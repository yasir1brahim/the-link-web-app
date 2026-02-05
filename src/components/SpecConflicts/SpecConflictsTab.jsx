import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  DataTableToolbar,
  DataTablePagination,
  SearchInput,
  ExportDropdown,
  CountDisplay,
} from '../shared/DataTable';
import { ReactComponent as ExcelLogo } from '../../assets/images/microsoft-excel-symbol.svg';
import {
  triggerSpecComparison,
  getSpecComparisons,
  getSpecConflicts,
  exportSpecConflictsToExcel,
} from '../../api/SpecConflicts/api';
import SpecConflictsTable from './SpecConflictsTable';
import SpecConflictsProcessingIndicator from './SpecConflictsProcessingIndicator';
import './SpecConflictsTab.css';

const POLL_INTERVAL = 5000;
const MAX_POLL_ATTEMPTS = 120;

const SpecConflictsTab = ({ projectId, projectVersionId, teamId }) => {
  // Comparison state
  const [comparison, setComparison] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [isComparing, setIsComparing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Table state
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [columnFilters, setColumnFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Polling refs
  const pollingRef = useRef(null);
  const isPollingRef = useRef(false); // Guard against duplicate polling

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch conflicts
  const fetchConflicts = useCallback(async () => {
    if (!projectId || !projectVersionId) return;

    setIsLoading(true);
    try {
      const response = await getSpecConflicts(projectId, {
        projectVersionId,
        page,
        limit: rowsPerPage,
        sortColumn,
        sortDirection,
        search: debouncedSearch || undefined,
        sheetNumber: columnFilters.sheet_number || undefined,
        specMasterformatNumber: columnFilters.spec_masterformat_number || undefined,
        reason: columnFilters.reason || undefined,
      });

      setConflicts(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setComparison(response.data.comparison);

      if (response.data.filter_options) {
        setFilterOptions({
          sheet_number: response.data.filter_options.sheet_numbers || [],
          spec_masterformat_number: response.data.filter_options.spec_masterformat_numbers || [],
          reason: response.data.filter_options.reasons || [],
        });
      }
    } catch (error) {
      console.error('Error fetching conflicts:', error);
      toast.error('Failed to load conflicts');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, projectVersionId, page, rowsPerPage, sortColumn, sortDirection, debouncedSearch, columnFilters]);

  // Check for existing comparison on mount
  useEffect(() => {
    const checkExistingComparison = async () => {
      if (!projectId || !projectVersionId) return;

      try {
        const response = await getSpecComparisons(projectId, { projectVersionId });
        const comparisons = response.data.results || [];

        if (comparisons.length > 0) {
          const latest = comparisons[0];
          setComparison(latest);

          if (latest.status === 'PROCESSING') {
            setIsComparing(true);
            startPolling(latest.id);
          } else if (latest.status === 'SUCCESS' || latest.status === 'PARTIAL_SUCCESS') {
            await fetchConflicts();
          }
        }
      } catch (error) {
        console.error('Error checking existing comparison:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    checkExistingComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, projectVersionId]); // fetchConflicts and startPolling intentionally excluded to run only on mount/version change

  // Re-fetch when filters/sort/pagination change
  useEffect(() => {
    // Handle both SUCCESS and PARTIAL_SUCCESS
    if (!initialLoading && (comparison?.status === 'SUCCESS' || comparison?.status === 'PARTIAL_SUCCESS')) {
      fetchConflicts();
    }
  }, [fetchConflicts, initialLoading, comparison?.status]);

  // Cleanup polling on unmount or projectVersionId change
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
      isPollingRef.current = false; // Reset guard on cleanup
    };
  }, [projectVersionId]); // Re-run cleanup when version changes

  const startPolling = (comparisonId) => {
    // Guard against duplicate polling
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    // Clear any existing polling before starting new one
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }

    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        const response = await getSpecComparisons(projectId, { projectVersionId });
        const comp = response.data.results.find(c => c.id === comparisonId);

        if (!comp || comp.status === 'FAILED') {
          setComparison(comp);
          setIsComparing(false);
          isPollingRef.current = false; // Reset guard
          toast.error(comp?.error_message || 'Comparison failed');
          return;
        }

        if (comp.status === 'SUCCESS' || comp.status === 'PARTIAL_SUCCESS') {
          setComparison(comp);
          setIsComparing(false);
          isPollingRef.current = false; // Reset guard
          fetchConflicts();
          toast.success('Comparison complete!');
          return;
        }

        if (attempts >= MAX_POLL_ATTEMPTS) {
          setIsComparing(false);
          isPollingRef.current = false; // Reset guard
          toast.error('Comparison timed out. Please try again.');
          return;
        }

        pollingRef.current = setTimeout(poll, POLL_INTERVAL);
      } catch (error) {
        setIsComparing(false);
        isPollingRef.current = false; // Reset guard
        toast.error('Failed to check comparison status');
      }
    };

    poll();
  };

  const handleRunComparison = async () => {
    try {
      setIsComparing(true);
      const response = await triggerSpecComparison(projectId, projectVersionId);
      const newComparison = response.data;
      setComparison(newComparison);
      startPolling(newComparison.id);
    } catch (error) {
      setIsComparing(false);
      toast.error('Failed to start comparison');
    }
  };

  const handleRowClick = (conflictId) => {
    setExpandedRowId(expandedRowId === conflictId ? null : conflictId);
  };

  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(1);
  };

  const handleFilter = (columnKey, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
    setPage(1);
    setExpandedRowId(null);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1);
    setExpandedRowId(null);
  };

  const handleClearFilters = () => {
    setColumnFilters({});
    setSearchQuery('');
    setPage(1);
    setExpandedRowId(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setExpandedRowId(null);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    setExpandedRowId(null);
  };

  const handleExport = async (format) => {
    if (format === 'excel') {
      try {
        const response = await exportSpecConflictsToExcel(projectId, {
          projectVersionId,
          search: debouncedSearch || undefined,
          sheetNumber: columnFilters.sheet_number || undefined,
          specMasterformatNumber: columnFilters.spec_masterformat_number || undefined,
          reason: columnFilters.reason || undefined,
          sortColumn,
          sortDirection,
        });

        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'spec_conflicts.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
        toast.error('Failed to export conflicts');
      }
    }
  };

  const hasActiveFilters = Object.values(columnFilters).some(Boolean) || searchQuery;

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="spec-conflicts-container">
        <div className="spec-conflicts-loading">Loading...</div>
      </div>
    );
  }

  // No comparison exists - prompt to run
  if (!comparison) {
    return (
      <div className="spec-conflicts-container">
        <div className="spec-conflicts-prompt">
          <h3>No spec comparison has been run yet</h3>
          <p>Compare your drawing notes against project specifications to detect conflicts.</p>
          <button
            className="spec-conflicts-run-btn"
            onClick={handleRunComparison}
            disabled={isComparing}
          >
            Run Comparison
          </button>
        </div>
      </div>
    );
  }

  // Comparison failed
  if (comparison.status === 'FAILED') {
    return (
      <div className="spec-conflicts-container">
        <div className="spec-conflicts-error">
          <h3>Comparison failed</h3>
          <p>{comparison.error_message || 'An unexpected error occurred.'}</p>
          <button
            className="spec-conflicts-run-btn"
            onClick={handleRunComparison}
            disabled={isComparing}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Zero conflicts
  if (comparison.status === 'SUCCESS' && totalCount === 0 && !hasActiveFilters) {
    return (
      <div className="spec-conflicts-container">
        <DataTableToolbar
          leftContent={
            <button
              className="spec-conflicts-run-btn"
              onClick={handleRunComparison}
              disabled={isComparing}
            >
              {isComparing ? 'Comparing...' : 'Run Comparison'}
            </button>
          }
          rightContent={null}
        />
        <div className="spec-conflicts-empty">
          <h3>No conflicts found</h3>
          <p>
            All {comparison.notes_processed || 0} drawing notes are consistent with the specifications.
          </p>
          <span className="last-run">Last run: {formatDateTime(comparison.completed_at)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="spec-conflicts-container">
      {isComparing && <SpecConflictsProcessingIndicator comparison={comparison} />}

      <DataTableToolbar
        leftContent={
          <>
            <button
              className="spec-conflicts-run-btn"
              onClick={handleRunComparison}
              disabled={isComparing}
            >
              {isComparing ? 'Comparing...' : 'Run Comparison'}
            </button>
            <ExportDropdown
              options={[
                {
                  label: 'Excel',
                  value: 'excel',
                  icon: <ExcelLogo style={{ height: '24px', width: '24px' }} />,
                },
              ]}
              onExport={handleExport}
              disabled={totalCount === 0}
            />
            {hasActiveFilters && (
              <button className="dt-clear-filters-btn" onClick={handleClearFilters}>
                Clear Filters
              </button>
            )}
          </>
        }
        rightContent={
          <>
            <CountDisplay
              counts={[]}
              totalCount={totalCount}
              totalLabel="conflicts"
            />
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search conflicts..."
              alwaysExpanded={false}
            />
          </>
        }
      />

      <SpecConflictsTable
        conflicts={conflicts}
        expandedRowId={expandedRowId}
        onRowClick={handleRowClick}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        columnFilters={columnFilters}
        filterOptions={filterOptions}
        onFilter={handleFilter}
        isLoading={isLoading}
      />

      <DataTablePagination
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

export default SpecConflictsTab;
