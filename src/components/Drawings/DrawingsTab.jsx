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
import { getDrawingNotes, exportDrawingNotesToExcel, uploadDrawingFiles } from '../../api/Drawings/api';
import { FileUploadModal } from '../shared/FileUploadModal';
import DrawingsProcessingIndicator from './DrawingsProcessingIndicator';
import DrawingFilesModal from './DrawingFilesModal';
import { ReactComponent as PlusUploadIcon } from '../../assets/images/plus-upload.svg';
import { ReactComponent as ExcelLogo } from '../../assets/images/microsoft-excel-symbol.svg';
import { getDisciplineDisplayName } from '../../constants/disciplines';
import './DrawingsTab.css';

// Sentinel value for filtering records with null sheet_number or sheet_title
const UNKNOWN_FILTER_VALUE = '__null__';

const DrawingsTab = ({ projectId, projectVersionId, teamId }) => {
  // Data state
  const [drawingNotes, setDrawingNotes] = useState([]);
  const [allFilterVals, setAllFilterVals] = useState({
    category: [],
    drawing_files: [],
    sheet_numbers: [],
    sheet_titles: [],
    disciplines: [],
    has_null_sheet_number: false,
    has_null_sheet_title: false,
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
    sheet_number: null,
    sheet_title: null,
    category: null,
    disciplines: null,
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
  const [drawingFilesModalOpen, setDrawingFilesModalOpen] = useState(false);

  // Upload state
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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
      key: 'sheet_number',
      header: 'Sheet Number',
      sortable: true,
      filterable: true,
      filterValueKey: 'value',
      filterLabelKey: 'label',
      width: '15%',
      render: (value) => value || 'Unknown Number',
    },
    {
      key: 'sheet_title',
      header: 'Sheet Title',
      sortable: true,
      filterable: true,
      filterValueKey: 'value',
      filterLabelKey: 'label',
      width: '22%',
      render: (value) => value || 'Unknown Title',
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      filterable: true,
      width: '12%',
    },
    {
      key: 'disciplines',
      header: 'Discipline',
      sortable: false,
      filterable: true,
      filterValueKey: 'value',
      filterLabelKey: 'label',
      width: '13%',
      render: (value) => {
        if (!value || value.length === 0) return '—';
        return value.map(getDisciplineDisplayName).join(', ');
      },
    },
    {
      key: 'text',
      header: 'Text',
      sortable: true,
      filterable: false,
      width: '38%',
    },
  ];

  // Fetch data
  const fetchDrawingNotes = useCallback(async () => {
    if (!projectId || !projectVersionId) return;

    setIsLoading(true);
    try {
      // Handle special "unknown" filter values for null filtering
      const sheetNumberFilter = columnFilters.sheet_number === UNKNOWN_FILTER_VALUE ? undefined : columnFilters.sheet_number;
      const sheetTitleFilter = columnFilters.sheet_title === UNKNOWN_FILTER_VALUE ? undefined : columnFilters.sheet_title;
      const sheetNumberIsNull = columnFilters.sheet_number === UNKNOWN_FILTER_VALUE;
      const sheetTitleIsNull = columnFilters.sheet_title === UNKNOWN_FILTER_VALUE;

      const response = await getDrawingNotes(projectId, projectVersionId, {
        category: columnFilters.category || undefined,
        sheetNumber: sheetNumberFilter || undefined,
        sheetTitle: sheetTitleFilter || undefined,
        sheetNumberIsNull: sheetNumberIsNull || undefined,
        sheetTitleIsNull: sheetTitleIsNull || undefined,
        disciplines: columnFilters.disciplines || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: rowsPerPage,
        sortColumn: sortColumn || undefined,
        sortDirection: sortColumn ? sortDirection : undefined,
      });

      setDrawingNotes(response?.data?.results || []);
      // Only update filter options when no filters are applied (preserves full list)
      const hasFilters = columnFilters.category || columnFilters.sheet_number || columnFilters.sheet_title || columnFilters.disciplines || debouncedSearch;
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
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: value,
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
    setColumnFilters({ sheet_number: null, sheet_title: null, category: null, disciplines: null });
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
        // Handle special "unknown" filter values for null filtering
        const sheetNumberFilter = columnFilters.sheet_number === UNKNOWN_FILTER_VALUE ? undefined : columnFilters.sheet_number;
        const sheetTitleFilter = columnFilters.sheet_title === UNKNOWN_FILTER_VALUE ? undefined : columnFilters.sheet_title;
        const sheetNumberIsNull = columnFilters.sheet_number === UNKNOWN_FILTER_VALUE;
        const sheetTitleIsNull = columnFilters.sheet_title === UNKNOWN_FILTER_VALUE;

        const response = await exportDrawingNotesToExcel(projectId, projectVersionId, {
          category: columnFilters.category || undefined,
          sheetNumber: sheetNumberFilter || undefined,
          sheetTitle: sheetTitleFilter || undefined,
          sheetNumberIsNull: sheetNumberIsNull || undefined,
          sheetTitleIsNull: sheetTitleIsNull || undefined,
          disciplines: columnFilters.disciplines || undefined,
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

  // Upload handlers
  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      setUploadError("Please select at least one PDF file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("project_id", projectId);
      formData.append("project_version_id", projectVersionId);
      formData.append("file_type", "drawing");
      uploadFiles.forEach((file) => formData.append("files", file));

      await uploadDrawingFiles(formData);
      setUploadFiles([]);
      setUploadSuccess(true);
      setUploadModalOpen(false);
      fetchDrawingNotes();
    } catch (err) {
      setUploadError("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadErrorClose = () => {
    setUploadError(null);
    setUploadModalOpen(true);
  };

  const handleUploadSuccessClose = () => {
    setUploadSuccess(false);
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
      onClick: () => setDrawingFilesModalOpen(true),
    },
    {
      label: 'category',
      labelPlural: 'categories',
      count: allFilterVals.category?.length || 0,
      // No onClick - categories modal not implemented yet
    },
  ];

  // Filter options for columns (include "Unknown" options if null values exist)
  // Derive from API response, or fall back to extracting from current data
  const sheetNumbers = allFilterVals.sheet_numbers?.length
    ? allFilterVals.sheet_numbers
    : [...new Set(drawingNotes.map((n) => n.sheet_number).filter(Boolean))];
  const sheetTitles = allFilterVals.sheet_titles?.length
    ? allFilterVals.sheet_titles
    : [...new Set(drawingNotes.map((n) => n.sheet_title).filter(Boolean))];
  const hasNullSheetNumber = allFilterVals.has_null_sheet_number ?? drawingNotes.some((n) => !n.sheet_number);
  const hasNullSheetTitle = allFilterVals.has_null_sheet_title ?? drawingNotes.some((n) => !n.sheet_title);

  const sheetNumberOptions = [
    ...(hasNullSheetNumber ? [{ value: UNKNOWN_FILTER_VALUE, label: 'Unknown Number' }] : []),
    ...sheetNumbers.map((val) => ({ value: val, label: val })),
  ];
  const sheetTitleOptions = [
    ...(hasNullSheetTitle ? [{ value: UNKNOWN_FILTER_VALUE, label: 'Unknown Title' }] : []),
    ...sheetTitles.map((val) => ({ value: val, label: val })),
  ];
  const disciplinesOptions = (allFilterVals.disciplines || []).map((val) => ({
    value: val,
    label: getDisciplineDisplayName(val),
  }));

  const filterOptions = {
    sheet_number: sheetNumberOptions,
    sheet_title: sheetTitleOptions,
    category: allFilterVals.category || [],
    disciplines: disciplinesOptions,
  };

  // Map column filters for DataTable
  const tableColumnFilters = {
    sheet_number: columnFilters.sheet_number,
    sheet_title: columnFilters.sheet_title,
    category: columnFilters.category,
    disciplines: columnFilters.disciplines,
  };

  const hasActiveFilters =
    columnFilters.sheet_number || columnFilters.sheet_title || columnFilters.category || columnFilters.disciplines || searchQuery;

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
                options={[{
                  label: 'Excel',
                  value: 'excel',
                  icon: <ExcelLogo style={{ height: '24px', width: '24px' }} />
                }]}
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
              title={[selectedNote.sheet_number, selectedNote.sheet_title].filter(Boolean).join(' - ') || 'Unknown Drawing'}
              onClose={handleClosePdf}
              isLoading={pdfLoading}
              setLoading={setPdfLoading}
            />
          </div>
        </>
      )}

      <FileUploadModal
        isOpen={uploadModalOpen}
        toggle={() => setUploadModalOpen(false)}
        title="Upload Drawing Files"
        acceptedFileTypes="application/pdf"
        uploadButtonText="Upload"
        guidelines={[
          "All drawing files must be in PDF format",
          "Maximum individual file size is 150 MB",
          "Maximum number of files in one upload is 250"
        ]}
        files={uploadFiles}
        onFilesChange={setUploadFiles}
        onUpload={handleUpload}
        isUploading={isUploading}
        uploadError={uploadError}
        onErrorClose={handleUploadErrorClose}
        uploadSuccess={uploadSuccess}
        onSuccessClose={handleUploadSuccessClose}
        successMessage="Your drawing files have been successfully uploaded and are being processed."
        successSubMessage="This may take a few minutes to complete."
      />

      <DrawingFilesModal
        isOpen={drawingFilesModalOpen}
        toggle={() => setDrawingFilesModalOpen(false)}
        drawingFiles={allFilterVals.drawing_files || []}
      />
    </div>
  );
};

export default DrawingsTab;
