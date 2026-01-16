import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  SearchInput,
  ExportDropdown,
  CountDisplay,
  PdfViewerPane,
} from '../shared/DataTable';
import { getDrawingNotes, exportDrawingNotesToExcel } from '../../api/Drawings/api';
import DrawingsUploadModal from './DrawingsUploadModal';
import DrawingsProcessingIndicator from './DrawingsProcessingIndicator';
import { ReactComponent as PlusUploadIcon } from '../../assets/images/plus-upload.svg';
import './DrawingsTab.css';

const DrawingsTab = ({ projectId, projectVersionId, teamId }) => {
  // Data state
  const [drawingNotes, setDrawingNotes] = useState([]);
  const [allFilterVals, setAllFilterVals] = useState({
    category: [],
    drawing_files: [],
  });
  const [processingStatus, setProcessingStatus] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Selection state
  const [selectedNote, setSelectedNote] = useState(null);

  // Sorting state
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter state (column-based)
  const [columnFilters, setColumnFilters] = useState({
    drawing_file_id: null,
    category: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // PDF viewer state
  const [pdfData, setPdfData] = useState({ url: null });
  const [pdfLoading, setPdfLoading] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Column configuration
  const columns = [
    {
      key: 'drawing_file_name',
      header: 'Drawing File',
      sortable: true,
      filterable: true,
      filterValueKey: 'id',
      filterLabelKey: 'name',
      width: '30%',
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      filterable: true,
      width: '20%',
    },
    {
      key: 'text',
      header: 'Text',
      sortable: true,
      filterable: false,
      width: '50%',
    },
  ];

  // Fetch data
  const fetchDrawingNotes = useCallback(async () => {
    if (!projectId || !projectVersionId) return;

    setIsLoading(true);
    try {
      const response = await getDrawingNotes(projectId, projectVersionId, {
        category: columnFilters.category || undefined,
        drawingFileId: columnFilters.drawing_file_id || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: rowsPerPage,
        sortColumn: sortColumn || undefined,
        sortDirection: sortColumn ? sortDirection : undefined,
      });

      setDrawingNotes(response?.data?.results || []);
      // Only update filter options when no filters are applied (preserves full list)
      const hasFilters = columnFilters.category || columnFilters.drawing_file_id || debouncedSearch;
      if (!hasFilters && response?.data?.all_filter_vals) {
        setAllFilterVals(response.data.all_filter_vals);
      }
      setTotalCount(response?.data?.total_count ?? response?.data?.count ?? 0);
      setProcessingStatus(response?.data?.processing_status || null);
    } catch (error) {
      console.error('Error fetching drawing notes:', error);
      toast.error('Failed to load drawing notes');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, projectVersionId, columnFilters, debouncedSearch, page, rowsPerPage, sortColumn, sortDirection]);

  useEffect(() => {
    fetchDrawingNotes();
  }, [fetchDrawingNotes]);

  // Polling for processing status
  useEffect(() => {
    if (!processingStatus?.is_processing) return;

    const interval = setInterval(() => {
      fetchDrawingNotes();
    }, 10000);

    return () => clearInterval(interval);
  }, [processingStatus?.is_processing, fetchDrawingNotes]);

  // Handlers
  const handleRowSelect = (note) => {
    setSelectedNote(note);

    if (note?.drawing_file_url && note?.bounding_box) {
      setPdfLoading(true);
      const [x1, y1, x2, y2] = note.bounding_box;

      setPdfData({
        url: note.drawing_file_url,
        textLoc: {
          x: x1,
          y: y1,
          width: x2 - x1,
          height: y2 - y1,
          scroll_to_x: x1,
          scroll_to_y: y2,
          jump_to_annotation: true,
          page_no: note.page_number,
        },
        docId: note.drawing_file_id,
      });

      // Reset loading after a short delay
      setTimeout(() => setPdfLoading(false), 500);
    }
  };

  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(1);
  };

  const handleFilter = (columnKey, value) => {
    // Map column key to filter key
    const filterKey = columnKey === 'drawing_file_name' ? 'drawing_file_id' : columnKey;
    setColumnFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
    setPage(1);
    setSelectedNote(null);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1);
    setSelectedNote(null);
  };

  const handleClearFilters = () => {
    setColumnFilters({ drawing_file_id: null, category: null });
    setSearchQuery('');
    setPage(1);
    setSelectedNote(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSelectedNote(null);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    setSelectedNote(null);
  };

  const handleExport = async (format) => {
    if (format === 'excel') {
      try {
        const response = await exportDrawingNotesToExcel(projectId, projectVersionId, {
          category: columnFilters.category || undefined,
          drawingFileId: columnFilters.drawing_file_id || undefined,
          search: debouncedSearch || undefined,
        });

        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'drawing_notes.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
        toast.error('Failed to export drawing notes');
      }
    }
  };

  const handleClosePdf = () => {
    setSelectedNote(null);
    setPdfData({ url: null });
  };

  // Navigation handlers
  const handleNavigateUp = () => {
    if (!selectedNote) return;
    const currentIndex = drawingNotes.findIndex((n) => n.id === selectedNote.id);
    if (currentIndex > 0) {
      handleRowSelect(drawingNotes[currentIndex - 1]);
    }
  };

  const handleNavigateDown = () => {
    if (!selectedNote) return;
    const currentIndex = drawingNotes.findIndex((n) => n.id === selectedNote.id);
    if (currentIndex < drawingNotes.length - 1) {
      handleRowSelect(drawingNotes[currentIndex + 1]);
    }
  };

  const canNavigateUp = selectedNote
    ? drawingNotes.findIndex((n) => n.id === selectedNote.id) > 0
    : false;

  const canNavigateDown = selectedNote
    ? drawingNotes.findIndex((n) => n.id === selectedNote.id) < drawingNotes.length - 1
    : false;

  // Count display data
  const counts = [
    {
      label: 'drawing file',
      labelPlural: 'drawing files',
      count: allFilterVals.drawing_files?.length || 0,
      onClick: () => {
        // Could open a modal showing all drawing files
      },
    },
    {
      label: 'category',
      labelPlural: 'categories',
      count: allFilterVals.category?.length || 0,
      onClick: () => {
        // Could open a modal showing all categories
      },
    },
  ];

  // Filter options for columns
  const filterOptions = {
    drawing_file_name: allFilterVals.drawing_files || [],
    category: allFilterVals.category || [],
  };

  // Map column filters for DataTable (convert drawing_file_id back to drawing_file_name)
  const tableColumnFilters = {
    drawing_file_name: columnFilters.drawing_file_id,
    category: columnFilters.category,
  };

  const hasActiveFilters =
    columnFilters.drawing_file_id || columnFilters.category || searchQuery;

  const showPdfViewer = selectedNote && pdfData.url;

  return (
    <div className={`drawings-container ${showPdfViewer ? 'side-by-side' : ''}`}>
      <div className="drawings-left-pane">
        {processingStatus?.is_processing && (
          <DrawingsProcessingIndicator processingStatus={processingStatus} />
        )}

        <DataTableToolbar
          leftContent={
            <>
              <ExportDropdown
                options={[{ label: 'Excel', value: 'excel' }]}
                onExport={handleExport}
                disabled={totalCount === 0}
              />
              {hasActiveFilters && (
                <button className="dt-clear-filters-btn" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              )}
              {showPdfViewer && (
                <button className="dt-close-pdf-btn" onClick={handleClosePdf}>
                  Close PDF Viewer
                </button>
              )}
            </>
          }
          rightContent={
            <>
              <CountDisplay counts={counts} totalCount={totalCount} totalLabel="notes" />
              <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search drawings..."
                alwaysExpanded={false}
              />
              <button
                className="dt-upload-btn-yellow"
                onClick={() => setUploadModalOpen(true)}
              >
                <PlusUploadIcon />
                <span>Upload Drawings</span>
              </button>
            </>
          }
        />

        <DataTable
          columns={columns}
          data={drawingNotes}
          rowKey="id"
          selectedId={selectedNote?.id}
          onRowSelect={handleRowSelect}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          columnFilters={tableColumnFilters}
          filterOptions={filterOptions}
          onFilter={handleFilter}
          isLoading={isLoading}
          emptyMessage="No drawing notes found"
        />

        <DataTablePagination
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>

      {showPdfViewer && (
        <>
          <div className="drawings-nav-column">
            <button
              className="drawings-nav-btn"
              onClick={handleNavigateUp}
              disabled={!canNavigateUp || pdfLoading}
              title="Previous note"
            >
              <ArrowDropUpIcon />
            </button>
            <button
              className="drawings-nav-btn"
              onClick={handleNavigateDown}
              disabled={!canNavigateDown || pdfLoading}
              title="Next note"
            >
              <ArrowDropDownIcon />
            </button>
          </div>
          <div className="drawings-right-pane">
            <PdfViewerPane
              pdfData={pdfData}
              setPdfData={setPdfData}
              title={selectedNote.drawing_file_name}
              onClose={handleClosePdf}
              isLoading={pdfLoading}
              setLoading={setPdfLoading}
            />
          </div>
        </>
      )}

      <DrawingsUploadModal
        isOpen={uploadModalOpen}
        toggle={() => setUploadModalOpen(false)}
        projectId={projectId}
        projectVersionId={projectVersionId}
        onSuccess={() => {
          setUploadModalOpen(false);
          fetchDrawingNotes();
        }}
      />
    </div>
  );
};

export default DrawingsTab;
