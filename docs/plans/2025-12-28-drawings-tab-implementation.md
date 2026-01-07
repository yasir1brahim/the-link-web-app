# Drawings Tab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a new "Drawings" tab for displaying extracted notes from construction drawing PDFs with table view, filters, and split-pane PDF viewer with bounding box annotations.

**Architecture:** Feature-flagged tab in ProjectLogs that follows the existing Submittal Log pattern. Uses DrawingsTab as main container with table, filters, upload modal, and PDF viewer. API integration follows existing pagination patterns.

**Tech Stack:** React, Reactstrap modals, Apryse WebViewer (via PdfWrapper), axios API layer

---

## Task 1: Add Feature Flag Constant

**Files:**
- Modify: `src/constants.js`

**Step 1: Add the constant**

Add after line 36 (after `SPEC_CENTERED_VIEW_FEATURE_FLAG_NAME`):

```javascript
export const DRAWINGS_FEATURE_FLAG_NAME = "drawings";
```

**Step 2: Verify build (this repo does not have an `npm run lint` script)**

Run: `npm run build`
Expected: Build completes without errors

**Step 3: Commit**

```bash
git add src/constants.js
git commit -m "$(cat <<'EOF'
feat: add drawings feature flag constant

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add Feature Flag to Context

**Files:**
- Modify: `src/contexts/FeatureFlagsContext.js`

**Step 1: Import the constant**

Add to imports around line 2:

```javascript
import {
  NOTICES_FEATURE_FLAG_NAME,
  // ... existing imports ...
  SPEC_CENTERED_VIEW_FEATURE_FLAG_NAME,
  DRAWINGS_FEATURE_FLAG_NAME,
} from "../constants";
```

**Step 2: Add the convenience method**

Add after `isSpecCenteredViewFlagActive` definition (around line 85):

```javascript
const isDrawingsFlagActive = (teamId) => isFlagActive(DRAWINGS_FEATURE_FLAG_NAME, teamId);
```

**Step 3: Add to context value**

Add `isDrawingsFlagActive` to the `value` object in the provider (around line 95):

```javascript
value={{
  // ... existing values ...
  isSpecCenteredViewFlagActive,
  isDrawingsFlagActive,
  refreshFlags,
}}
```

**Step 4: Verify build (this repo does not have an `npm run lint` script)**

Run: `npm run build`
Expected: Build completes without errors

**Step 5: Commit**

```bash
git add src/contexts/FeatureFlagsContext.js
git commit -m "$(cat <<'EOF'
feat: add isDrawingsFlagActive to feature flags context

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Create Drawings API Module

**Files:**
- Create: `src/api/Drawings/api.js`

**Step 1: Create the API file**

```javascript
import axiosInstance from "../../config/axios";
import { handleError } from "../../config/errorHandler";

/**
 * Fetch drawing notes with pagination and filters
 * @param {number} projectId - Project ID
 * @param {number} projectVersionId - Project version ID
 * @param {Object} options - Query options
 * @param {string} options.category - Category filter
 * @param {number} options.drawingFileId - Drawing file ID filter
 * @param {string} options.search - Search text
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.limit - Items per page
 * @returns {Promise} API response
 */
export const getDrawingNotes = async (
  projectId,
  projectVersionId,
  { category, drawingFileId, search, page = 1, limit = 25 } = {}
) => {
  try {
    return await axiosInstance({
      method: "get",
      url: `/api/deliverables/projects/${projectId}/drawing-notes/`,
      params: {
        project_version_id: projectVersionId,
        ...(category && { category }),
        ...(drawingFileId && { drawing_file_id: drawingFileId }),
        ...(search && { search }),
        page,
        limit,
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * Upload drawing files
 * Reuses existing ProjectLogs upload helper to avoid duplicate wrappers.
 *
 * NOTE: This expects the backend upload endpoint to accept:
 * - `files` (multipart, repeated key)
 * - `project_id`
 * - `project_version_id`
 * - `file_type: "drawing"`
 */
export { uploadFiles as uploadDrawingFiles } from "../ProjectLogs/api";
```

**Step 2: Verify build (this repo does not have an `npm run lint` script)**

Run: `npm run build`
Expected: Build completes without errors

**Step 3: Commit**

```bash
git add src/api/Drawings/api.js
git commit -m "$(cat <<'EOF'
feat: add Drawings API module with getDrawingNotes and uploadDrawingFiles

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Create DrawingsTab Main Container

**Files:**
- Create: `src/components/Drawings/DrawingsTab.jsx`

**Step 1: Create the component file**

```jsx
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
```

**Step 2: Verify build (this repo does not have an `npm run lint` script)**

Run: `npm run build`
Expected: Build completes without errors (may have runtime warnings until all components exist)

**Step 3: Commit**

```bash
git add src/components/Drawings/DrawingsTab.jsx
git commit -m "$(cat <<'EOF'
feat: add DrawingsTab main container component

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Create DrawingsTab CSS

**Files:**
- Create: `src/components/Drawings/DrawingsTab.css`

**Step 1: Create the CSS file**

```css
.drawings-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.drawings-container.side-by-side {
  flex-direction: row;
  gap: 20px;
}

.drawings-left-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.side-by-side .drawings-left-pane {
  flex: 0 0 50%;
  max-width: 50%;
}

.drawings-right-pane {
  flex: 0 0 50%;
  max-width: 50%;
  height: calc(100vh - 200px);
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.drawings-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
}

.drawings-header .btn-primary {
  white-space: nowrap;
}

/* Table styles */
.drawings-table-container {
  flex: 1;
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.drawings-table {
  width: 100%;
  border-collapse: collapse;
}

.drawings-table th,
.drawings-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.drawings-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.drawings-table tbody tr {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.drawings-table tbody tr:hover {
  background-color: #f9f9f9;
}

.drawings-table tbody tr.selected {
  background-color: #e3f2fd;
}

.drawings-table tbody tr.selected:hover {
  background-color: #bbdefb;
}

/* Text truncation */
.drawings-text-cell {
  max-width: 400px;
}

.drawings-text-truncated {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawings-text-full {
  white-space: pre-wrap;
}

.drawings-expand-btn {
  color: #007bff;
  background: none;
  border: none;
  padding: 4px 0;
  cursor: pointer;
  font-size: 12px;
}

.drawings-expand-btn:hover {
  text-decoration: underline;
}

/* Filters */
.drawings-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.drawings-filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawings-filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.drawings-filter-group select,
.drawings-filter-group input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  min-width: 180px;
}

.drawings-filter-group select:focus,
.drawings-filter-group input:focus {
  outline: none;
  border-color: #007bff;
}

.drawings-clear-filters {
  align-self: flex-end;
  padding: 8px 16px;
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.drawings-clear-filters:hover {
  background-color: #f5f5f5;
}

/* Pagination */
.drawings-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
}

.drawings-pagination-info {
  color: #666;
  font-size: 14px;
}

.drawings-pagination-controls {
  display: flex;
  gap: 8px;
}

.drawings-pagination-controls button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
}

.drawings-pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drawings-pagination-controls button:not(:disabled):hover {
  background-color: #f5f5f5;
}

/* Processing indicator */
.drawings-processing-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  color: #856404;
}

.drawings-processing-indicator.error {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.drawings-processing-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffc107;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Loading state */
.drawings-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px;
  color: #666;
}

/* Empty state */
.drawings-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #666;
  text-align: center;
}

.drawings-empty h3 {
  margin-bottom: 8px;
  color: #333;
}
```

**Step 2: Commit**

```bash
git add src/components/Drawings/DrawingsTab.css
git commit -m "$(cat <<'EOF'
feat: add DrawingsTab CSS styles

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Create DrawingsTable Component

**Files:**
- Create: `src/components/Drawings/DrawingsTable.jsx`

**Step 1: Create the component file**

```jsx
import React, { useState, useRef, useEffect } from "react";

const DrawingsTable = ({
  drawingNotes,
  selectedNote,
  onRowSelect,
  isLoading,
  page,
  pageSize,
  totalCount,
  onPageChange,
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [truncatedRows, setTruncatedRows] = useState(new Set());
  const textRefs = useRef({});

  // Check which rows need truncation
  useEffect(() => {
    const newTruncatedRows = new Set();
    drawingNotes.forEach((note) => {
      const ref = textRefs.current[note.id];
      if (ref && ref.scrollHeight > ref.clientHeight) {
        newTruncatedRows.add(note.id);
      }
    });
    setTruncatedRows(newTruncatedRows);
  }, [drawingNotes]);

  const toggleExpand = (e, noteId) => {
    e.stopPropagation();
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  if (isLoading) {
    return (
      <div className="drawings-loading">
        <span>Loading drawing notes...</span>
      </div>
    );
  }

  if (drawingNotes.length === 0) {
    return (
      <div className="drawings-empty">
        <h3>No drawing notes found</h3>
        <p>Upload drawing PDFs to extract notes, or adjust your filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="drawings-table-container">
        <table className="drawings-table">
          <thead>
            <tr>
              <th style={{ width: "200px" }}>Drawing File</th>
              <th style={{ width: "150px" }}>Category</th>
              <th>Text</th>
            </tr>
          </thead>
          <tbody>
            {drawingNotes.map((note) => {
              const isExpanded = expandedRows.has(note.id);
              const needsTruncation = truncatedRows.has(note.id);

              return (
                <tr
                  key={note.id}
                  className={selectedNote?.id === note.id ? "selected" : ""}
                  onClick={() => onRowSelect(note)}
                >
                  <td>{note.drawing_file_name}</td>
                  <td>{note.category}</td>
                  <td className="drawings-text-cell">
                    <div
                      ref={(el) => (textRefs.current[note.id] = el)}
                      className={
                        isExpanded
                          ? "drawings-text-full"
                          : "drawings-text-truncated"
                      }
                    >
                      {note.text}
                    </div>
                    {(needsTruncation || isExpanded) && (
                      <button
                        className="drawings-expand-btn"
                        onClick={(e) => toggleExpand(e, note.id)}
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="drawings-pagination">
        <span className="drawings-pagination-info">
          Showing {startItem}-{endItem} of {totalCount} notes
        </span>
        <div className="drawings-pagination-controls">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default DrawingsTable;
```

**Step 2: Verify build (this repo does not have an `npm run lint` script)**

Run: `npm run build`
Expected: Build completes without errors

**Step 3: Commit**

```bash
git add src/components/Drawings/DrawingsTable.jsx
git commit -m "$(cat <<'EOF'
feat: add DrawingsTable component with expandable rows and pagination

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Create DrawingsFilters Component

**Files:**
- Create: `src/components/Drawings/DrawingsFilters.jsx`

**Step 1: Create the component file**

```jsx
import React, { useState, useEffect, useCallback } from "react";

const DrawingsFilters = ({ filters, onFilterChange, allFilterVals }) => {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFilterChange({ ...filters, search: searchValue });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters, onFilterChange]);

  const handleCategoryChange = (e) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handleDrawingFileChange = (e) => {
    onFilterChange({ ...filters, drawingFileId: e.target.value });
  };

  const handleClearFilters = () => {
    setSearchValue("");
    onFilterChange({
      category: "",
      drawingFileId: "",
      search: "",
    });
  };

  const hasActiveFilters =
    filters.category || filters.drawingFileId || filters.search;

  return (
    <div className="drawings-filters">
      <div className="drawings-filter-group">
        <label htmlFor="category-filter">Category</label>
        <select
          id="category-filter"
          value={filters.category}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {allFilterVals.category?.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="drawings-filter-group">
        <label htmlFor="drawing-file-filter">Drawing File</label>
        <select
          id="drawing-file-filter"
          value={filters.drawingFileId}
          onChange={handleDrawingFileChange}
        >
          <option value="">All Files</option>
          {allFilterVals.drawing_files?.map((file) => (
            <option key={file.id} value={file.id}>
              {file.name}
            </option>
          ))}
        </select>
      </div>

      <div className="drawings-filter-group">
        <label htmlFor="search-filter">Search</label>
        <input
          id="search-filter"
          type="text"
          placeholder="Search note content..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      {hasActiveFilters && (
        <button className="drawings-clear-filters" onClick={handleClearFilters}>
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default DrawingsFilters;
```

**Step 2: Verify build (this repo does not have an `npm run lint` script)**

Run: `npm run build`
Expected: Build completes without errors

**Step 3: Commit**

```bash
git add src/components/Drawings/DrawingsFilters.jsx
git commit -m "$(cat <<'EOF'
feat: add DrawingsFilters component with category, file, and search filters

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Create DrawingsProcessingIndicator Component

**Files:**
- Create: `src/components/Drawings/DrawingsProcessingIndicator.jsx`

**Step 1: Create the component file**

```jsx
import React from "react";

const DrawingsProcessingIndicator = ({ processingStatus }) => {
  if (!processingStatus) return null;

  const { is_processing, files_processing, files_completed, files_failed } =
    processingStatus;

  if (!is_processing && files_failed === 0) return null;

  const totalFiles = files_processing + files_completed + files_failed;

  if (files_failed > 0 && !is_processing) {
    return (
      <div className="drawings-processing-indicator error">
        <span>
          {files_failed} file{files_failed > 1 ? "s" : ""} failed extraction.
          {processingStatus.files?.length > 0 && (
            <> Failed: {processingStatus.files.filter(f => f.status === "FAILED").map(f => f.name).join(", ")}</>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="drawings-processing-indicator">
      <div className="drawings-processing-spinner" />
      <span>
        Processing {files_completed} of {totalFiles} drawing file
        {totalFiles > 1 ? "s" : ""}...
      </span>
    </div>
  );
};

export default DrawingsProcessingIndicator;
```

**Step 2: Verify build (this repo does not have an `npm run lint` script)**

Run: `npm run build`
Expected: Build completes without errors

**Step 3: Commit**

```bash
git add src/components/Drawings/DrawingsProcessingIndicator.jsx
git commit -m "$(cat <<'EOF'
feat: add DrawingsProcessingIndicator component for file processing status

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Create DrawingsUploadModal Component

**Files:**
- Create: `src/components/Drawings/DrawingsUploadModal.jsx`

**Step 1: Create the component file**

```jsx
import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { uploadDrawingFiles } from "../../api/Drawings/api";

const DrawingsUploadModal = ({
  isOpen,
  toggle,
  projectId,
  projectVersionId,
  onSuccess,
}) => {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf" && f.size > 0
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
    setError(null);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      (f) => f.type === "application/pdf" && f.size > 0
    );
    setFiles((prev) => [...prev, ...selectedFiles]);
    setError(null);
    e.target.value = ""; // Reset input
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one PDF file to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("project_id", projectId);
      formData.append("project_version_id", projectVersionId);
      formData.append("file_type", "drawing");
      files.forEach((file) => formData.append("files", file));

      await uploadDrawingFiles(formData);
      setFiles([]);
      onSuccess();
    } catch (err) {
      setError("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      setError(null);
      toggle();
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg">
      <ModalHeader toggle={handleClose}>Upload Drawing Files</ModalHeader>
      <ModalBody>
        <div
          className={`drawings-upload-dropzone ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>Drag and drop PDF files here, or click to select</p>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileInput}
            style={{ display: "none" }}
            id="drawings-file-input"
          />
          <label htmlFor="drawings-file-input" className="btn btn-secondary">
            Select Files
          </label>
        </div>

        {files.length > 0 && (
          <div className="drawings-upload-file-list">
            <h4>Selected Files ({files.length})</h4>
            <ul>
              {files.map((file, index) => (
                <li key={index}>
                  <span>{file.name}</span>
                  <button
                    className="drawings-upload-remove-btn"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <div className="drawings-upload-error">{error}</div>}
      </ModalBody>
      <ModalFooter>
        <button
          className="btn btn-secondary"
          onClick={handleClose}
          disabled={uploading}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default DrawingsUploadModal;
```

**Step 2: Add upload modal styles to DrawingsTab.css**

Append to `src/components/Drawings/DrawingsTab.css`:

```css
/* Upload Modal */
.drawings-upload-dropzone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 48px;
  text-align: center;
  transition: all 0.2s ease;
}

.drawings-upload-dropzone.drag-over {
  border-color: #007bff;
  background-color: #f0f7ff;
}

.drawings-upload-dropzone p {
  margin-bottom: 16px;
  color: #666;
}

.drawings-upload-file-list {
  margin-top: 24px;
}

.drawings-upload-file-list h4 {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
}

.drawings-upload-file-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.drawings-upload-file-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
}

.drawings-upload-remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 12px;
}

.drawings-upload-remove-btn:hover {
  text-decoration: underline;
}

.drawings-upload-error {
  margin-top: 16px;
  padding: 12px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
}
```

**Step 3: Verify build (this repo does not have an `npm run lint` script)**

Run: `npm run build`
Expected: Build completes without errors

**Step 4: Commit**

```bash
git add src/components/Drawings/DrawingsUploadModal.jsx src/components/Drawings/DrawingsTab.css
git commit -m "$(cat <<'EOF'
feat: add DrawingsUploadModal component with drag-and-drop support

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Create Component Index File

**Files:**
- Create: `src/components/Drawings/index.js`

**Step 1: Create the index file**

```javascript
export { default as DrawingsTab } from "./DrawingsTab";
export { default as DrawingsTable } from "./DrawingsTable";
export { default as DrawingsFilters } from "./DrawingsFilters";
export { default as DrawingsUploadModal } from "./DrawingsUploadModal";
export { default as DrawingsProcessingIndicator } from "./DrawingsProcessingIndicator";
```

**Step 2: Commit**

```bash
git add src/components/Drawings/index.js
git commit -m "$(cat <<'EOF'
feat: add Drawings component index for clean imports

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Add Drawings Tab Button to Header

**Files:**
- Modify: `src/components/shared/Header/ProjectLogsHeaderTop.jsx`

**Step 1: Add the Drawings tab button**

Find the last tab button (Spec View) around line 86-94 and add after it:

```jsx
{props.isDrawingsFlagActive && (
  <button
    className={`tab-button ${props.activeTab === 'drawings' ? 'active' : ''}`}
    onClick={() => props.setActiveTab('drawings')}
    style={{
      padding: '12px 24px',
      border: 'none',
      backgroundColor: props.activeTab === 'drawings' ? '#fff' : '#f5f5f5',
      borderBottom: props.activeTab === 'drawings' ? '2px solid #007bff' : '2px solid transparent',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: props.activeTab === 'drawings' ? '600' : '400',
      color: props.activeTab === 'drawings' ? '#007bff' : '#666',
      transition: 'all 0.2s ease'
    }}
  >
    Drawings
  </button>
)}
```

**Step 2: Verify build (this repo does not have an `npm run lint` script)**

Run: `npm run build`
Expected: Build completes without errors

**Step 3: Commit**

```bash
git add src/components/shared/Header/ProjectLogsHeaderTop.jsx
git commit -m "$(cat <<'EOF'
feat: add Drawings tab button to ProjectLogsHeaderTop

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Integrate DrawingsTab into ProjectLogs

**Files:**
- Modify: `src/components/ProjectLogs/ProjectLogs.jsx`

**Step 1: Add import for DrawingsTab**

Add near the top with other component imports (around line 30):

```javascript
import { DrawingsTab } from "../Drawings";
```

**Step 2: Add isDrawingsFlagActive to useFeatureFlags destructuring**

Find the `useFeatureFlags()` call (around line 51-59) and add `isDrawingsFlagActive`:

```javascript
const {
  isVersioningFlagActive,
  isVersionComparisonFlagActive,
  isVersionComparisonSearchFlagActive,
  isSpecGptFlagActive,
  isInspectionLogFlagActive,
  isQaPlannerFlagActive,
  isSpecCenteredViewFlagActive,
  isDrawingsFlagActive,
} = useFeatureFlags();
```

**Step 3: Add drawings to URL sync validation**

Find the URL sync effect that validates tab names (around line 565-575) and add `'drawings'`:

```javascript
} else if (tabFromUrl === 'submittal' || tabFromUrl === 'assistant' || tabFromUrl === 'spec-view' || tabFromUrl === 'drawings') {
  setActiveTab(tabFromUrl);
}
```

**Step 4: Pass isDrawingsFlagActive to ProjectLogsHeaderTop**

Find where `ProjectLogsHeaderTop` is rendered and add the prop:

```jsx
<ProjectLogsHeaderTop
  // ... existing props ...
  isDrawingsFlagActive={isDrawingsFlagActive(teamId)}
/>
```

**Step 5: Add DrawingsTab render condition**

Find where tab content is rendered (after spec-view around line 2031) and add:

```jsx
{activeTab === 'drawings' &&
  <DrawingsTab
    projectId={projectId}
    projectVersionId={projectVersionId}
    teamId={teamId}
  />
}
```

**Step 6: Verify build (this repo does not have an `npm run lint` script)**

Run: `npm run build`
Expected: Build completes without errors

**Step 7: Commit**

```bash
git add src/components/ProjectLogs/ProjectLogs.jsx
git commit -m "$(cat <<'EOF'
feat: integrate DrawingsTab into ProjectLogs with feature flag and URL sync

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Build and Test

**Step 1: Run the build**

Run: `npm run build`
Expected: Build completes without errors

**Step 2: Format (optional)**

Run: `npm run format`
Expected: Files are formatted

**Step 3: Start the dev server and manually test**

Run: `npm start`

Manual verification:
1. Enable the `drawings` feature flag for your team
2. Navigate to Project Logs
3. Verify "Drawings" tab appears (rightmost)
4. Click Drawings tab - should show empty state
5. Click Upload Drawings - modal should open
6. Upload a PDF - should trigger processing indicator
7. After processing, notes should appear in table
8. Click a row - PDF viewer should open with highlight

**Step 4: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: complete Drawings Tab implementation

Adds new Drawings tab to Project Logs with:
- Feature flag gating (drawings)
- Table with Category, Drawing File, and Text columns
- Expandable text rows
- Category and Drawing File filters with search
- Drag-and-drop upload modal
- Processing status indicator with polling
- Split-pane PDF viewer with bounding box highlights
- Pagination support

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

This plan creates 8 new files and modifies 4 existing files:

**New Files:**
1. `src/constants.js` - DRAWINGS_FEATURE_FLAG_NAME constant
2. `src/api/Drawings/api.js` - API functions
3. `src/components/Drawings/DrawingsTab.jsx` - Main container
4. `src/components/Drawings/DrawingsTab.css` - Styles
5. `src/components/Drawings/DrawingsTable.jsx` - Table component
6. `src/components/Drawings/DrawingsFilters.jsx` - Filter controls
7. `src/components/Drawings/DrawingsProcessingIndicator.jsx` - Status indicator
8. `src/components/Drawings/DrawingsUploadModal.jsx` - Upload modal
9. `src/components/Drawings/index.js` - Exports

**Modified Files:**
1. `src/constants.js` - Add flag constant
2. `src/contexts/FeatureFlagsContext.js` - Add isDrawingsFlagActive
3. `src/components/shared/Header/ProjectLogsHeaderTop.jsx` - Add tab button
4. `src/components/ProjectLogs/ProjectLogs.jsx` - Add tab routing and render
