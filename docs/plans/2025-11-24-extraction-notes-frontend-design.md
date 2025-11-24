# Extraction Notes Frontend Design

**Date:** 2025-11-24
**Status:** Design Complete - Ready for Implementation
**Related Documents:**
- [Backend Implementation Plan](../extraction-notes-implementation.md)
- [API Modification Specification](../api/extraction-notes-api-modification.md)

---

## Overview

Add text-based notes to ExtractedData highlights using Apryse's native sticky note annotations and reply system. Users can add notes during highlight creation or by clicking existing highlights, with all notes synced bidirectionally between the backend API and Apryse annotations.

---

## Architecture

### System Architecture

**Component Integration:**
- Leverage Apryse's native sticky note annotations and reply system
- Extend existing `projectLogsReader.js` to manage note annotations alongside highlight rectangles
- Maintain a normalized cache of full `ExtractedData` records inside `DocumentHighlighter` so rectangle and sticky annotations share one source of truth
- Sync note state bidirectionally between backend API and Apryse annotations
- Use CustomData to track ExtractedData ID and note IDs on annotations

**Data Flow:**
```
Backend (Django)
    ↓ (GET ExtractedData with notes)
    ↓
React State (DocumentHighlighter ExtractedData cache)
    ↓ (Pass derived annotation props to projectLogsReader)
    ↓
Apryse Annotations
    - RectangleAnnotation (highlights - existing)
    - StickyAnnotation (note parent - NEW)
    - StickyAnnotation replies (individual notes - NEW)
    ↑ (annotationChanged events)
    ↑
Event Handlers (NEW)
    ↑ (POST/PATCH/DELETE to backend)
    ↑
Backend API
```

**Key Design Principles:**
1. **Native-first**: Use Apryse's built-in UI/UX for note interactions
2. **On-demand creation**: Only create sticky notes when first note is added
3. **Optimistic updates**: Show changes immediately, sync to backend asynchronously
4. **Author-only editing**: Enforce permissions via ReadOnly flags

---

## User Interaction Flows

### Flow 1: Creating a Highlight with Initial Note

1. User selects text in PDF → Click "Add New Highlight" (context menu)
2. Highlight type picker modal opens with **new optional "Note" text field**
3. User selects highlight type, optionally fills note field
4. Click save → API creates ExtractedData with note (if provided)
5. **Optimistic UI update:**
   - Create highlight rectangle annotation immediately
   - If note provided: Create sticky note annotation + first reply with note text
   - Set sticky note to "Open Initially" = true
   - Store ExtractedData ID in sticky note's CustomData
6. When API response returns → Update sticky note CustomData with confirmed backend IDs

### Flow 2: Adding First Note to Existing Highlight

1. User clicks highlight rectangle (no sticky note exists yet)
2. Programmatically create sticky note annotation at highlight start position
3. **Trigger Apryse's native comment UI** to open the sticky note for editing
4. User types note in Apryse's interface → Saves
5. Listen to `annotationChanged` event → POST new note to backend
6. Backend returns note with ID → Update reply annotation's CustomData

### Flow 3: Adding Additional Notes (Replies)

1. User opens existing sticky note in Apryse UI (notes panel or clicking icon)
2. Uses Apryse's native "Add Reply" functionality
3. Types note → Saves
4. `annotationChanged` event fires → POST to backend
5. Backend returns note ID → Update reply CustomData

### Flow 4: Editing/Deleting Notes

1. Notes created by other users have `ReadOnly = true` (cannot edit/delete)
2. User's own notes are editable in Apryse UI
3. On edit: `annotationChanged` event → PATCH to backend (optimistic)
4. On delete: `annotationDeleted` event → DELETE to backend (optimistic)
5. If backend fails → Revert change, show error notification

---

## Technical Implementation

### Highlight State Refactor

- Replace the existing flattened highlight arrays with a single `extractedDataItems` array that stores the full `ExtractedData` objects returned by the API (locations, notes, metadata).
- Memoize helper selectors (`React.useMemo`) to derive rectangle annotations and maps by id so `projectLogsReader` can look up data without redundant iteration.
- Pass both the `extractedDataItems` array and a `getExtractedDataById` callback into `ProjectLogsReader` so click handlers and Apryse events reference the same cache.

```javascript
const [extractedDataItems, setExtractedDataItems] = useState([]);

useEffect(() => {
  setExtractedDataItems((highlights || []).map(item => ({
    ...item,
    notes: item.notes || [],
    pdf_locations: item.pdf_locations || [],
  })));
}, [highlights]);

const extractedDataById = useMemo(() => {
  return new Map(extractedDataItems.map(data => [data.id, data]));
}, [extractedDataItems]);
```

```javascript
<ProjectLogsReader
  extractedDataItems={extractedDataItems}
  getExtractedDataById={(id) => extractedDataById.get(id)}
  currentUserId={currentUserId}
  {...otherProps}
/>
```

```javascript
function createHighlightAnnotations(extractedDataList, Annotations) {
  return extractedDataList.flatMap((data) => {
    return data.pdf_locations.map((location, locationIndex) => {
      const colorData = getColorDataForHighlight(data.item_type, data.extraction_type);
      const color = createAnnotationColor(colorData);

      const rectangleAnnot = new Annotations.RectangleAnnotation({
        PageNumber: location.page_no,
        X: location.x,
        Y: location.y,
        Width: location.width ?? 10000,
        Height: location.height ?? 30,
        Color: color,
        FillColor: color,
      });

      rectangleAnnot.CustomData = {
        extracted_data_id: data.id,
        pdf_location_index: locationIndex,
        item_type: data.item_type,
        extraction_type: data.extraction_type,
        requirement_text: data.requirement_text,
        color: colorData,
      };

      return rectangleAnnot;
    });
  });
}
```

### Sticky Note Configuration

**Positioning (configurable):**
```javascript
// Configuration constant at top of projectLogsReader.js
const STICKY_NOTE_POSITION = 'start'; // Options: 'start', 'center', 'end', 'offset'

function calculateStickyPosition(highlightLocation, position = 'start') {
  const { x, y, width, height } = highlightLocation;
  switch(position) {
    case 'start': return { x, y };
    case 'center': return { x: x + width/2, y: y + height/2 };
    case 'end': return { x: x + width, y: y + height };
    case 'offset': return { x: x + width + 5, y: y - 5 }; // Top-right offset
    default: return { x, y };
  }
}
```

**Appearance:**
```javascript
const stickyNote = new Annotations.StickyAnnotation({
  PageNumber: location.page_no,
  X: position.x,
  Y: position.y,
  Icon: Annotations.StickyAnnotation.IconNames.Comment, // Consistent icon
  StrokeColor: new Annotations.Color(255, 200, 100, 1), // Neutral orange/yellow
});
stickyNote.setContents(''); // Parent note has no content
stickyNote.setOpenInitially(true); // Open by default
stickyNote.setCustomData('extracted_data_id', extractedDataId);
```

**Creating Replies (Individual Notes):**
```javascript
const noteReply = new Annotations.StickyAnnotation({
  PageNumber: location.page_no,
  X: position.x,
  Y: position.y,
  InReplyTo: parentStickyNote.Id, // Apryse links reply to parent automatically
  ReplyType: 'Group',
});
noteReply.setContents(noteText);
noteReply.Author = authorName;
noteReply.setCustomData('extraction_note_id', backendNoteId);
noteReply.setCustomData('extracted_data_id', extractedDataId); // Link back to highlight
noteReply.setCustomData('created_by_id', userId);
noteReply.ReadOnly = (currentUserId !== userId); // Enforce author-only editing
```

**Identifying annotation types:**
```javascript
function isExtractionNoteParent(annotation) {
  return annotation.getCustomData('extracted_data_id') &&
         !annotation.InReplyTo; // Has extracted_data_id but no parent = parent sticky
}

function isExtractionNoteReply(annotation) {
  return annotation.getCustomData('extraction_note_id') &&
         annotation.InReplyTo; // Has backend note ID AND is a reply
}
```

---

## Event Handling & Backend Sync

### Annotation Event Listeners

**Setup in projectLogsReader.js:**
```javascript
const { annotationManager } = webViewer.Core;

// Listen for annotation changes
annotationManager.addEventListener('annotationChanged', handleAnnotationChanged);
annotationManager.addEventListener('annotationDeleted', handleAnnotationDeleted);
annotationManager.addEventListener('annotationSelected', handleAnnotationSelected);
```

### Handling Annotation Changes

**Single handler for add/modify (optimistic updates):**
```javascript
async function handleAnnotationChanged(annotations, action, { imported }) {
  if (imported) return;

  for (const annot of annotations) {
    if (!isExtractionNoteReply(annot)) {
      continue;
    }

    if (action === 'add') {
      const extractedDataId = annot.getCustomData('extracted_data_id');
      const noteText = annot.getContents();

      try {
        const note = await api.createExtractionNote(
          projectId,
          extractedDataId,
          { text: noteText }
        );

        annot.setCustomData('extraction_note_id', note.id);
        annot.setCustomData('created_by_id', note.created_by_id);
        annotationManager.redrawAnnotation(annot);
      } catch (error) {
        handleError(error);
        annotationManager.deleteAnnotation(annot, undefined, true);
      }

      continue;
    }

    if (action === 'modify') {
      const noteId = annot.getCustomData('extraction_note_id');
      const extractedDataId = annot.getCustomData('extracted_data_id');
      const newText = annot.getContents();
      const previousText = annot._originalContents ?? annot.getCustomData('_previous_contents');

      try {
        await api.updateExtractionNote(
          projectId,
          extractedDataId,
          noteId,
          { text: newText }
        );
      } catch (error) {
        handleError(error);
        if (typeof previousText === 'string') {
          annot.setContents(previousText);
          annotationManager.redrawAnnotation(annot);
        }
      }
    }
  }
}
```

### Capturing Original Note Text

```javascript
function handleAnnotationSelected(annotations) {
  annotations.forEach((annot) => {
    if (isExtractionNoteReply(annot)) {
      annot._originalContents = annot.getContents();
    }
  });
}
```

### Deleting Notes

**Handler:**
```javascript
async function handleAnnotationDeleted(annotations, { imported }) {
  if (imported) return;

  for (const annot of annotations) {
    if (!isExtractionNoteReply(annot)) {
      continue;
    }

    const noteId = annot.getCustomData('extraction_note_id');
    const extractedDataId = annot.getCustomData('extracted_data_id');
    const annotCopy = annot.clone();

    try {
      await api.deleteExtractionNote(
        projectId,
        extractedDataId,
        noteId
      );
    } catch (error) {
      handleError(error);
      annotationManager.addAnnotation(annotCopy, { imported: true });
      annotationManager.drawAnnotationsFromList([annotCopy]);
    }
  }
}
```

### The `imported` Flag

**Purpose:** Prevent infinite loops when loading annotations from backend.

When we add annotations programmatically (from backend data), Apryse fires `annotationChanged` events. Without the `imported` flag, our event handlers would try to POST these annotations back to the backend, even though they already exist there.

**Solution:**
```javascript
// When loading from backend, mark as imported
annotationManager.addAnnotation(parentSticky, { imported: true });
annotationManager.addAnnotations(replies, { imported: true });

// Then in our event handler:
function handleAnnotationChanged(annotations, action, { imported }) {
  if (imported) return; // Skip - these came from backend, don't POST back

  // Only handle user-created annotations here
}
```

---

## Loading Notes on Document Load

### Rendering Notes from Backend Data

**When ExtractedData is loaded with notes:**
```javascript
function createNotesForExtractedData(extractedData, webViewer, currentUserId) {
  const { annotationManager, Annotations } = webViewer.Core;

  if (!extractedData.notes || extractedData.notes.length === 0) {
    return;
  }

  const firstLocation = extractedData.pdf_locations[0];
  const position = calculateStickyPosition(firstLocation, STICKY_NOTE_POSITION);

  const parentSticky = new Annotations.StickyAnnotation({
    PageNumber: firstLocation.page_no,
    X: position.x,
    Y: position.y,
    Icon: Annotations.StickyAnnotation.IconNames.Comment,
    StrokeColor: new Annotations.Color(255, 200, 100, 1),
  });

  parentSticky.setContents('');
  parentSticky.setOpenInitially(true);
  parentSticky.setCustomData('extracted_data_id', extractedData.id);
  parentSticky.ReadOnly = true;

  annotationManager.addAnnotation(parentSticky, { imported: true });

  const replies = extractedData.notes.map(note => {
    const reply = new Annotations.StickyAnnotation({
      PageNumber: firstLocation.page_no,
      X: position.x,
      Y: position.y,
      InReplyTo: parentSticky.Id,
      ReplyType: 'Group',
    });

    reply.setContents(note.text);
    reply.Author = note.created_by_name || 'Unknown';
    reply.setCustomData('extraction_note_id', note.id);
    reply.setCustomData('extracted_data_id', extractedData.id);
    reply.setCustomData('created_by_id', note.created_by_id);
    reply.ReadOnly = note.created_by_id !== currentUserId;

    return reply;
  });

  annotationManager.addAnnotations(replies, { imported: true });
  annotationManager.drawAnnotationsFromList([parentSticky, ...replies]);
}
```

**Integration in existing highlight rendering:**
```javascript
// In projectLogsReader.js, after creating highlight rectangles
function renderHighlightsAndNotes(extractedDataList, webViewer) {
  // Existing: Create rectangle annotations for highlights
  const highlightAnnotations = createHighlightAnnotations(extractedDataList);
  annotationManager.addAnnotations(highlightAnnotations);

  // NEW: Create sticky notes for items with notes
  extractedDataList.forEach(data => {
    createNotesForExtractedData(data, webViewer, currentUserId);
  });

  // Redraw all
  annotationManager.drawAnnotationsFromList(highlightAnnotations);
}
```

---

## UI Changes

### 1. Highlight Creation Modal (DocumentHighlighter.jsx)

**Add optional note field to the highlight picker modal:**

```javascript
// New state
const [pendingNoteText, setPendingNoteText] = useState('');

// In the modal JSX (around line 415)
<div className="highlight-picker-modal">
  <div className="highlight-picker-content">
    <h3>Add Highlight</h3>
    <p className="selected-text-preview">
      {truncateText(pendingHighlight?.selectedText, 200)}
    </p>

    {/* NEW: Optional note field */}
    <div className="note-input-section">
      <label htmlFor="highlight-note">Add Note (Optional)</label>
      <textarea
        id="highlight-note"
        className="note-textarea"
        placeholder="Add a note about this highlight..."
        value={pendingNoteText}
        onChange={(e) => setPendingNoteText(e.target.value)}
        rows={3}
      />
    </div>

    <div className="highlight-type-options">
      {/* Existing type buttons */}
    </div>

    {highlightError && <div className="error-message">{highlightError}</div>}

    <div className="modal-actions">
      <button onClick={handleCancelHighlight}>Cancel</button>
    </div>
  </div>
</div>
```

**Update save handler:**
```javascript
async function handleSaveHighlight(highlightType) {
  setIsSavingHighlight(true);

  const payload = {
    // ... existing payload fields ...
    note_text: pendingNoteText.trim() || null, // Send note if provided
  };

  try {
    const response = await api.createExtractedData(projectId, payload);

    // Optimistic: Create highlight + sticky note immediately
    handleHighlightCreationSuccess(response, pendingNoteText);

    // Reset
    setPendingNoteText('');
    setHighlightPickerOpen(false);
  } catch (error) {
    setHighlightError(error.message);
  } finally {
    setIsSavingHighlight(false);
  }
}
```

### 2. Click Handler for Highlights (projectLogsReader.js)

**Add click listener to highlight rectangles:**

```javascript
// During annotation creation
annotationManager.addEventListener('annotationSelected', (annotations) => {
  const selectedAnnot = annotations[0];

  // Check if it's a highlight rectangle (not a sticky note)
  if (isHighlightRectangle(selectedAnnot)) {
    const extractedDataId = selectedAnnot.getCustomData('extracted_data_id');
    handleHighlightClick(extractedDataId, webViewer);
  }
});

function handleHighlightClick(extractedDataId, webViewer) {
  const { annotationManager, Annotations } = webViewer.Core;

  // Check if sticky note already exists
  const existingSticky = findStickyNoteForExtractedData(extractedDataId);

  if (existingSticky) {
    // Open existing sticky note
    webViewer.UI.openElement('notesPanel');
    annotationManager.selectAnnotation(existingSticky);
  } else {
    // Create new sticky note and trigger Apryse's comment UI
    const extractedData = getExtractedDataById(extractedDataId);
    const firstLocation = extractedData.pdf_locations[0];
    const position = calculateStickyPosition(firstLocation, STICKY_NOTE_POSITION);

    const newSticky = new Annotations.StickyAnnotation({
      PageNumber: firstLocation.page_no,
      X: position.x,
      Y: position.y,
      Icon: Annotations.StickyAnnotation.IconNames.Comment,
      StrokeColor: new Annotations.Color(255, 200, 100, 1),
    });

    newSticky.setContents('');
    newSticky.setOpenInitially(true);
    newSticky.setCustomData('extracted_data_id', extractedDataId);
    newSticky.ReadOnly = true; // Parent is not editable

    annotationManager.addAnnotation(newSticky);
    annotationManager.redrawAnnotation(newSticky);

    // Open notes panel and select the new sticky note
    webViewer.UI.openElement('notesPanel');
    annotationManager.selectAnnotation(newSticky);
  }
}
```

### 3. CSS Styling (DocumentHighlighter.css)

```css
/* Note input in highlight creation modal */
.note-input-section {
  margin: 16px 0;
  width: 100%;
}

.note-input-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.note-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
}

.note-textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.note-textarea::placeholder {
  color: #999;
}
```

---

## API Integration

### New API Methods (src/api/SpecCentricView/api.js)

```javascript
// Create a new note on an ExtractedData
export async function createExtractionNote(projectId, extractedDataId, noteData) {
  try {
    const { data } = await axiosInstance({
      method: 'post',
      url: `/api/deliverables/${projectId}/extracted-data/${extractedDataId}/notes/`,
      data: noteData,
    });

    return data;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// Update an existing note
export async function updateExtractionNote(projectId, extractedDataId, noteId, noteData) {
  try {
    const { data } = await axiosInstance({
      method: 'patch',
      url: `/api/deliverables/${projectId}/extracted-data/${extractedDataId}/notes/${noteId}/`,
      data: noteData,
    });

    return data;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// Delete a note
export async function deleteExtractionNote(projectId, extractedDataId, noteId) {
  try {
    await axiosInstance({
      method: 'delete',
      url: `/api/deliverables/${projectId}/extracted-data/${extractedDataId}/notes/${noteId}/`,
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
}
```

**Note:** The existing `GET /api/deliverables/{projectId}/extracted-data/` endpoint already returns notes inline per the backend implementation.

---

## Error Handling & Edge Cases

### Error Scenarios

**1. Note Creation Fails (Network Error)**
```javascript
try {
  const response = await api.createExtractionNote(...);
  annot.setCustomData('extraction_note_id', response.id);
} catch (error) {
  annotationManager.deleteAnnotation(annot, { force: true });
  handleError(error);
}
```

**2. Note Update Fails**
```javascript
const original = annot._originalContent;

try {
  await api.updateExtractionNote(...);
  delete annot._originalContent;
} catch (error) {
  annot.setContents(original);
  annotationManager.redrawAnnotation(annot);
  handleError(error);
}
```

**3. Permission Denied (Non-Author Tries to Edit)**

This should be prevented by `ReadOnly` flag, but as a safety net:

```javascript
if (noteAuthorId && noteAuthorId !== currentUserId) {
  console.error('Unauthorized note modification attempt');
  revertAnnotationChange(annot);
  return;
}
```

**4. Delete Fails (Backend Error)**
```javascript
// Clone before it's gone
const annotClone = {
  contents: annot.getContents(),
  author: annot.Author,
  customData: annot.CustomData,
  position: { x: annot.X, y: annot.Y, page: annot.PageNumber },
  parentId: annot.InReplyTo
};

try {
  await api.deleteExtractionNote(...);
} catch (error) {
  const restored = recreateNoteAnnotation(annotClone);
  annotationManager.addAnnotation(restored, { imported: true });
  annotationManager.drawAnnotationsFromList([restored]);
  handleError(error);
}
```

### Edge Cases

**1. User Creates Highlight While Offline**
```javascript
try {
  const response = await api.createExtractedData(projectId, payload);
  // Success - create annotations
} catch (error) {
  handleError(error);
  // Don't create any annotations - nothing to show
}
```

**2. ExtractedData Has No PDF Locations**
```javascript
function createNotesForExtractedData(extractedData, webViewer) {
  // Safety check
  if (!extractedData.pdf_locations || extractedData.pdf_locations.length === 0) {
    console.warn(`ExtractedData ${extractedData.id} has no PDF locations, skipping notes`);
    return;
  }

  if (!extractedData.notes || extractedData.notes.length === 0) {
    return;
  }

  // Continue with creation...
}
```

**3. Sticky Note Position Off-Screen**
```javascript
function calculateStickyPosition(highlightLocation, position = 'start') {
  const { x, y, width, height } = highlightLocation;

  let calcX, calcY;

  switch(position) {
    case 'start':
      calcX = x;
      calcY = y;
      break;
    // ... other cases
  }

  // Ensure position is within page bounds (basic validation)
  calcX = Math.max(0, calcX);
  calcY = Math.max(0, calcY);

  return { x: calcX, y: calcY };
}
```

**4. User Deletes Parent Sticky Note**

Apryse handles this automatically - deleting a parent deletes all replies. We need to handle the backend sync:

```javascript
async function handleAnnotationDeleted(annotations, { imported }) {
  if (imported) return;

  for (const annot of annotations) {
    if (isExtractionNoteParent(annot)) {
      const extractedDataId = annot.getCustomData('extracted_data_id');
      const replies = getChildAnnotations(annot);

      // Delete all notes from backend
      for (const reply of replies) {
        const noteId = reply.getCustomData('extraction_note_id');
        if (noteId) {
          try {
            await api.deleteExtractionNote(projectId, extractedDataId, noteId);
          } catch (error) {
            console.error('Failed to delete note from backend:', error);
          }
        }
      }

      // Optional: surface an info toast via react-toastify to confirm deletion
    }
  }
}
```

---

## Implementation Checklist

### Files to Modify

#### 1. `src/components/SpecCentricView/DocumentHighlighter.jsx`

- [ ] Replace flattened highlight state with `extractedDataItems` cache (stores full `ExtractedData` objects)
- [ ] Memoize an `extractedDataById` map and pass `getExtractedDataById` + `extractedDataItems` into `ProjectLogsReader`
- [ ] Thread `currentUserId` down so note permissions can be enforced client-side
- [ ] Add state: `pendingNoteText`
- [ ] Add textarea field in highlight picker modal
- [ ] Update `handleSaveHighlight()` to include `note_text` in payload
- [ ] Add handler `handleHighlightCreationSuccess()` to create sticky note if note provided
- [ ] Pass note creation callback to `projectLogsReader`

#### 2. `src/components/PdfReader/projectLogsReader.js`

- [ ] Accept new props: `extractedDataItems`, `getExtractedDataById`, and `currentUserId`
- [ ] Add constant: `STICKY_NOTE_POSITION = 'start'`
- [ ] Add utility functions:
  - [ ] `calculateStickyPosition(location, position)`
  - [ ] `isExtractionNoteParent(annotation)`
  - [ ] `isExtractionNoteReply(annotation)`
  - [ ] `findStickyNoteForExtractedData(extractedDataId)`
- [ ] Update rectangle creation to attach `extracted_data_id` (and location index) to `CustomData`
- [ ] Add function: `createNotesForExtractedData(extractedData, webViewer, currentUserId)`
- [ ] Add event listeners:
  - [ ] `annotationChanged`
  - [ ] `annotationDeleted`
  - [ ] `annotationSelected`
- [ ] Add handlers:
  - [ ] Consolidated `handleAnnotationChanged()` for add/modify
  - [ ] `handleAnnotationDeleted()` with rollback + `{ imported: true }`
  - [ ] `handleAnnotationSelected()` to cache original contents
  - [ ] `handleHighlightClick()` leveraging `getExtractedDataById`
- [ ] Invoke `handleError` inside all async catch blocks before local rollback
- [ ] Update highlight rendering to call `createNotesForExtractedData()`

#### 3. `src/components/SpecCentricView/DocumentHighlighter.css`

- [ ] Add styles for `.note-input-section`
- [ ] Add styles for `.note-textarea`
- [ ] Add focus states and placeholder styles

#### 4. `src/api/SpecCentricView/api.js`

- [ ] Add function: `createExtractionNote()`
- [ ] Add function: `updateExtractionNote()`
- [ ] Add function: `deleteExtractionNote()`

### Implementation Order

**Phase 1: API Layer** (Independent work)
1. [ ] Add API methods to `api.js`
2. [ ] Test API methods work with existing backend

**Phase 2: UI Changes** (Can start in parallel)
3. [ ] Add note textarea to DocumentHighlighter modal
4. [ ] Add CSS styles
5. [ ] Update state management for `pendingNoteText`

**Phase 3: Core Note Creation** (Backend API modification must be complete)
6. [ ] Update `handleSaveHighlight()` to send `note_text`
7. [ ] Implement optimistic sticky note creation in `handleHighlightCreationSuccess()`

**Phase 4: Apryse Integration**
8. [ ] Add utility functions to `projectLogsReader.js`
9. [ ] Implement `createNotesForExtractedData()` for loading existing notes
10. [ ] Add annotation event listeners

**Phase 5: Interactive Features**
11. [ ] Implement click-to-add-note handler
12. [ ] Implement note edit/delete handlers
13. [ ] Add error handling and rollback logic

**Phase 6: Testing & Polish**
14. [ ] Test all user flows
15. [ ] Test error scenarios
16. [ ] Test with multiple users (permissions)
17. [ ] Performance testing with many notes

### Testing Checklist

**Manual Testing:**
- [ ] Create highlight without note → Note field optional, can skip
- [ ] Create highlight with note → Sticky note appears immediately with note
- [ ] Click highlight without notes → Sticky note created, Apryse UI opens
- [ ] Click highlight with notes → Existing sticky note opens
- [ ] Add reply via Apryse UI → Note syncs to backend
- [ ] Edit own note → Changes save to backend
- [ ] Try to edit other user's note → ReadOnly prevents editing
- [ ] Delete own note → Note removed, backend updated
- [ ] Try to delete other user's note → ReadOnly prevents deletion
- [ ] Reload page → All notes appear correctly
- [ ] Network failure during creation → Annotation removed, error shown
- [ ] Network failure during edit → Changes reverted, error shown
- [ ] Multiple notes on same highlight → All appear threaded correctly
- [ ] Notes open by default → Sticky notes are visible on load

**Edge Cases:**
- [ ] Create note with very long text (> 1000 chars)
- [ ] Create note with special characters / emojis
- [ ] Create note while offline
- [ ] ExtractedData with no PDF locations
- [ ] Sticky note at edge of page boundary

---

## Dependencies

### Backend Requirements

1. **ExtractionNote model and API endpoints** - Must be implemented per [backend implementation plan](../extraction-notes-implementation.md)
2. **API modification for note_text field** - Must accept optional `note_text` during ExtractedData creation per [API modification spec](../api/extraction-notes-api-modification.md)
3. **ExtractedData serializer** - Must include `notes` field in response (already implemented in backend plan)

### Frontend Requirements

1. **Apryse WebViewer** - Already integrated
2. **Global error handling hooks** - Reuse existing `handleError()` toast integration
3. **Auth token management** - Already provided by shared axios instance
4. **Current user ID access** - Expose `currentUserId` from container and pass into `ProjectLogsReader`

---

## Future Enhancements (Out of Scope)

These are intentionally excluded from the initial implementation but could be added later:

1. **Rich text notes** - Currently plain text only
2. **@mentions** - Tagging other users in notes
3. **Note templates** - Pre-defined note structures
4. **Bulk operations** - Add same note to multiple highlights
5. **Note search** - Filter/search notes across document
6. **Note export** - Export notes to CSV/PDF
7. **Note notifications** - Notify users when notes are added to shared highlights
8. **Request queueing** - Handle rapid note creation (deferred for simplicity)

---

## Success Criteria

The implementation is complete when:

1. ✅ Users can add optional notes during highlight creation
2. ✅ Users can click highlights to add notes after creation
3. ✅ Notes appear as Apryse sticky note annotations
4. ✅ Multiple notes appear as threaded replies
5. ✅ Notes are visible by default (open initially)
6. ✅ Only note authors can edit/delete their notes
7. ✅ All changes sync to backend in real-time
8. ✅ Optimistic updates provide instant feedback
9. ✅ Failed operations rollback with error messages
10. ✅ Notes persist across page reloads
11. ✅ All tests pass

---

## References

- [Apryse Sticky Note Documentation](https://docs.apryse.com/web/guides/annotation/types/stickynoteannotation)
- [Backend Implementation Plan](../extraction-notes-implementation.md)
- [API Modification Specification](../api/extraction-notes-api-modification.md)
