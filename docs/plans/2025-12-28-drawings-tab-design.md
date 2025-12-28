# Drawings Tab Frontend Design

## Overview

A new "Drawings" tab for displaying extracted notes from construction drawing PDFs. The feature mirrors the Submittal Log UI pattern with a table view, filters, upload functionality, and split-pane PDF viewer with bounding box annotations.

## Feature Flag

**Flag name:** `drawings`

**Setup (mirrors existing flags):**

```javascript
// constants.js
export const DRAWINGS_FEATURE_FLAG_NAME = "drawings";

// FeatureFlagsContext.js
// Add isDrawingsFlagActive to context, implemented as:
// isFlagActive(DRAWINGS_FEATURE_FLAG_NAME, teamId)
```

## Tab Structure

**Placement:** Rightmost tab, after Spec View

**ProjectLogsHeaderTop.jsx:**
```jsx
{isDrawingsFlagActive(teamId) && (
  <button
    className={`tab-button ${activeTab === 'drawings' ? 'active' : ''}`}
    onClick={() => setActiveTab('drawings')}
  >
    Drawings
  </button>
)}
```

**ProjectLogs.jsx:**
- Add `'drawings'` as valid `activeTab` value
- Sync with URL search params (`?tab=drawings`)
- Render `<DrawingsTab>` when active

## Component Architecture

```
src/components/Drawings/
├── DrawingsTab.jsx           # Main container (layout, state management)
├── DrawingsTable.jsx         # Table with Category & Text columns
├── DrawingsFilters.jsx       # Category + Drawing File dropdowns + Search
├── DrawingsUploadModal.jsx   # Drawing-specific upload modal
├── DrawingsProcessingIndicator.jsx  # Processing status banner
└── api.js                    # API functions for drawing-notes endpoint
```

### DrawingsTab.jsx

Main container responsibilities:
- Manages state: `drawingNotes`, `filters`, `pagination`, `selectedNote`, `pdfData`, `processingStatus`
- Handles split-pane layout (table left, PDF viewer right)
- Coordinates between table selection and PDF viewer
- Polls for processing status when files are processing

### Data Relationship

Drawing notes are tied to project versions, consistent with submittals.

## Table Design

**Columns:**

| Column | Description |
|--------|-------------|
| Category | e.g., "GENERAL NOTES", "PLUMBING NOTES" |
| Text | Note content, truncated with expandable rows |

**Behavior:**
- Row click → selects row, opens PDF viewer with bounding box highlight
- Text truncated to ~150 chars with ellipsis
- Expandable rows for viewing full text inline (mirrors Submittal Log pattern)
- Selected row highlighted with active state
- Pagination at bottom

## Filters

**DrawingsFilters.jsx:**
- Category dropdown (populated from `all_filter_vals.category`)
- Drawing File dropdown (populated from `all_filter_vals.drawing_file`)
- Search input (debounced text search in note content)
- Clear/reset filters button

## Upload Flow

**DrawingsUploadModal.jsx:**
- Separate modal with drawing-specific UI/messaging
- Reuses core upload logic from existing UploadDocuments component
- Passes `file_type: "drawing"` to upload API
- Post-upload: shows processing indicator, polls for status, refreshes table

**API call:**
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('project_version_id', projectVersionId);
formData.append('file_type', 'drawing');
await uploadFiles(formData);
```

## Split-Pane & PDF Viewer

**Layout:**
```jsx
<div className={`drawings-container ${selectedNote ? 'side-by-side' : ''}`}>
  <div className="drawings-left-pane">
    <DrawingsFilters ... />
    <DrawingsProcessingIndicator ... />
    <DrawingsTable ... />
  </div>

  {selectedNote && (
    <div className="drawings-right-pane">
      <PdfWrapper
        pdfData={pdfData}
        highlightLocations={[boundingBoxAnnotation]}
      />
    </div>
  )}
</div>
```

**Bounding box conversion:**

API returns `bounding_box: [x1, y1, x2, y2]`. Convert to WebViewer format:
```javascript
const highlightLocation = {
  x: boundingBox[0],
  y: boundingBox[1],
  width: boundingBox[2] - boundingBox[0],
  height: boundingBox[3] - boundingBox[1],
  page_no: selectedNote.page_number
};
```

**Reused components:**
- `<PdfWrapper>` / `<ProjectLogsReader>` for PDF viewing with annotations

## API Integration

**Endpoint:** `GET /projects/{project_id}/drawing-notes/`

**Query parameters:**
```javascript
const params = {
  project_version_id: projectVersionId,
  category: filters.category || undefined,
  drawing_file_id: filters.drawingFileId || undefined,
  search: filters.search || undefined,
  page_number: pagination.page,
  limit: pagination.pageSize
};
```

**Expected response structure:**
```json
{
  "count": 156,
  "next": "/projects/42/drawing-notes/?page_number=2&limit=25",
  "previous": null,
  "results": {
    "results": [
      {
        "id": 1001,
        "drawing_file_id": 15,
        "drawing_file_name": "Mechanical IFC Set.pdf",
        "drawing_file_url": "https://storage.../Mechanical IFC Set.pdf",
        "page_number": 1,
        "section_header": "GENERAL NOTES:",
        "note_number": 1,
        "category": "GENERAL NOTES",
        "text": "All mechanical equipment shall be installed...",
        "drawing_references": [...],
        "bounding_box": [120.5, 340.2, 580.8, 395.1],
        "page_extraction_status": "success",
        "page_extraction_failed": false
      }
    ],
    "all_filter_vals": {
      "category": ["GENERAL NOTES", "PLUMBING NOTES", ...],
      "drawing_file": ["Mechanical IFC Set.pdf", ...]
    },
    "total_count": 156,
    "processing_status": {
      "is_processing": true,
      "files_processing": 2,
      "files_completed": 5,
      "files_failed": 0,
      "files": [
        {"id": 16, "name": "Electrical IFC Set.pdf", "status": "processing"}
      ]
    }
  }
}
```

**Backend updates required:**
- Add `drawing_file_url` to each note in response
- Add `processing_status` object to response

## Processing Status

**DrawingsProcessingIndicator.jsx:**
- Shown when `is_processing === true` or `files_failed > 0`
- Displays: "Processing 2 of 7 drawing files..."
- Failed state: "3 files failed extraction" with details option
- Clickable to open status modal

**Polling logic:**
```javascript
useEffect(() => {
  if (!processingStatus?.is_processing) return;

  const interval = setInterval(() => {
    fetchDrawingNotes(); // Refreshes both table and status
  }, 10000);

  return () => clearInterval(interval);
}, [processingStatus?.is_processing]);
```

## Key Files to Modify

| File | Changes |
|------|---------|
| `src/constants.js` | Add `DRAWINGS_FEATURE_FLAG_NAME` |
| `src/contexts/FeatureFlagsContext.js` | Add `isDrawingsFlagActive` |
| `src/components/shared/Header/ProjectLogsHeaderTop.jsx` | Add Drawings tab button |
| `src/components/ProjectLogs/ProjectLogs.jsx` | Add drawings tab routing and render |
| `src/components/Drawings/*` | New component directory |

## Future Considerations (v2)

- PDF Viewer Integration: Use `bounding_box` coordinates to highlight notes
- Drawing Reference Links: `drawing_references` will link to actual drawing pages
- Re-extraction: Users may trigger re-extraction for failed pages
