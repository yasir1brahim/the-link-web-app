import React, { useState, useEffect, useCallback } from "react";
import FileDownload from "js-file-download";
import { getDrawingNotes, exportDrawingNotesToExcel } from "../../api/Drawings/api";
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
  const drawingScrollDebug =
    typeof window !== "undefined" &&
    window.localStorage.getItem("drawingsScrollDebug") === "1";

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
      const scrollToX = x1;
      const scrollToY = y2;

      if (drawingScrollDebug) {
        console.groupCollapsed("[DRAWINGS_SCROLL_DEBUG] Note selection");
        console.log({
          noteId: note.id,
          pageNumber: note.page_number,
          boundingBox: note.bounding_box,
          scrollTarget: {
            x: scrollToX,
            y: scrollToY,
          },
          pageRotation: note.page_rotation,
          pageRotatedWidth: note.page_rotated_width,
          pageRotatedHeight: note.page_rotated_height,
          pageUnrotatedWidth: note.page_unrotated_width,
          pageUnrotatedHeight: note.page_unrotated_height,
        });
        console.groupEnd();
      }

      setPdfData({
        url: note.drawing_file_url,
        textLoc: {
          x: x1,
          y: y1,
          width: x2 - x1,
          height: y2 - y1,
          scroll_to_x: scrollToX,
          scroll_to_y: scrollToY,
          jump_to_annotation: true,
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

  // Handle Excel export
  const handleExportExcel = async () => {
    try {
      const response = await exportDrawingNotesToExcel(
        projectId,
        projectVersionId,
        {
          category: filters.category || undefined,
          drawingFileId: filters.drawingFileId || undefined,
          search: filters.search || undefined,
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const now = new Date();
      const fileName = `drawing_notes_${now.toLocaleDateString("en-US", { day: "numeric" })}_${now.toLocaleDateString("en-US", { month: "short" })}_${now.toLocaleDateString("en-US", { year: "numeric" })}_${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(":", "")}.xlsx`;
      FileDownload(blob, fileName);
    } catch (error) {
      console.error("Error exporting drawing notes:", error);
    }
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
          <div className="drawings-header-actions">
            <button
              className="drawings-export-btn"
              onClick={handleExportExcel}
              disabled={totalCount === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Export to Excel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Drawings
            </button>
          </div>
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
