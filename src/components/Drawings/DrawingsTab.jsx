import React, { useState, useEffect, useCallback } from "react";
import { getDrawingNotes } from "../../api/Drawings/api";
import DrawingsTable from "./DrawingsTable";
import DrawingsFilters from "./DrawingsFilters";
import DrawingsUploadModal from "./DrawingsUploadModal";
import DrawingsProcessingIndicator from "./DrawingsProcessingIndicator";
import PdfWrapper from "../../pdfWrapper";
import "./DrawingsTab.css";

const DrawingsTab = ({ projectId, projectVersionId, teamId }) => {
  // Data state
  const [drawingNotes, setDrawingNotes] = useState([]);
  const [allFilterVals, setAllFilterVals] = useState({
    category: [],
    drawing_files: [],
  });
  const [processingStatus, setProcessingStatus] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    category: "",
    drawingFileId: "",
    search: "",
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  // Selection state
  const [selectedNote, setSelectedNote] = useState(null);

  // PDF viewer state
  const [pdfData, setPdfData] = useState({ url: null });
  const [pdfLoading, setPdfLoading] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetch drawing notes
  const fetchDrawingNotes = useCallback(async () => {
    if (!projectId || !projectVersionId) return;

    setIsLoading(true);
    try {
      const response = await getDrawingNotes(projectId, projectVersionId, {
        category: filters.category || undefined,
        drawingFileId: filters.drawingFileId || undefined,
        search: filters.search || undefined,
        page,
        limit: pageSize,
      });

      // DRF pagination convention:
      // - response.data.results is the array of notes
      // - extra metadata is provided at the top level (added by backend)
      setDrawingNotes(response?.data?.results || []);
      setAllFilterVals(response?.data?.all_filter_vals || { category: [], drawing_files: [] });
      setTotalCount(response?.data?.total_count ?? response?.data?.count ?? 0);
      setProcessingStatus(response?.data?.processing_status || null);
    } catch (error) {
      console.error("Error fetching drawing notes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, projectVersionId, filters, page, pageSize]);

  // Initial fetch
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

  // Handle row selection
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
          page_no: note.page_number,
        },
        docId: note.drawing_file_id,
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
    setSelectedNote(null);
    setPdfData({ url: null });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSelectedNote(null);
    setPdfData({ url: null });
  };

  // Handle upload success
  const handleUploadSuccess = () => {
    setUploadModalOpen(false);
    fetchDrawingNotes();
  };

  return (
    <div className={`drawings-container ${selectedNote ? "side-by-side" : ""}`}>
      <div className="drawings-left-pane">
        <div className="drawings-header">
          <DrawingsFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            allFilterVals={allFilterVals}
          />
          <button
            className="btn btn-primary"
            onClick={() => setUploadModalOpen(true)}
          >
            Upload Drawings
          </button>
        </div>

        <DrawingsProcessingIndicator processingStatus={processingStatus} />

        <DrawingsTable
          drawingNotes={drawingNotes}
          selectedNote={selectedNote}
          onRowSelect={handleRowSelect}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </div>

      {selectedNote && pdfData.url && (
        <div className="drawings-right-pane">
          <PdfWrapper
            pdfData={pdfData}
            setPdfData={setPdfData}
            loading={pdfLoading}
            setLoading={setPdfLoading}
          />
        </div>
      )}

      <DrawingsUploadModal
        isOpen={uploadModalOpen}
        toggle={() => setUploadModalOpen(false)}
        projectId={projectId}
        projectVersionId={projectVersionId}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default DrawingsTab;
