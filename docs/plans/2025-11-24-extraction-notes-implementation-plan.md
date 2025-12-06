# Extraction Notes Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add text-based notes to ExtractedData highlights using Apryse's native sticky note annotations with bidirectional backend sync.

**Architecture:** Extend DocumentHighlighter to maintain normalized ExtractedData cache, pass to projectLogsReader which manages both rectangle and sticky annotations. Use Apryse's reply system for threaded notes with optimistic updates and rollback error handling.

**Tech Stack:** React, Apryse WebViewer SDK, Axios, react-toastify

---

## Prerequisites

**Required Backend APIs:**
- `POST /api/deliverables/{projectId}/extracted-data/{extractedDataId}/notes/`
- `PATCH /api/deliverables/{projectId}/extracted-data/{extractedDataId}/notes/{noteId}/`
- `DELETE /api/deliverables/{projectId}/extracted-data/{extractedDataId}/notes/{noteId}/`
- `GET /api/deliverables/{projectId}/extracted-data/` returns `notes` array inline

**Verify backend is ready:**
```bash
# Check if endpoints exist
curl -H "Authorization: Bearer $TOKEN" \
  https://api.example.com/api/deliverables/123/extracted-data/456/notes/
```

---

## Task 1: Add API Methods

**Files:**
- Modify: `src/api/SpecCentricView/api.js`

**Step 1: Add createExtractionNote method**

Add after existing ExtractedData methods:

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
```

**Step 2: Add updateExtractionNote method**

```javascript
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
```

**Step 3: Add deleteExtractionNote method**

```javascript
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

**Step 4: Verify API methods syntax**

Run: `npm run lint src/api/SpecCentricView/api.js`
Expected: No errors

**Step 5: Commit**

```bash
git add src/api/SpecCentricView/api.js
git commit -m "feat: add extraction note API methods"
```

---

## Task 2: Refactor DocumentHighlighter State

**Files:**
- Modify: `src/components/SpecCentricView/DocumentHighlighter.jsx`

**Step 1: Replace highlight state with extractedDataItems**

Find the existing highlight state (likely around line 50-100). Replace with:

```javascript
// Replace existing highlight-related state with unified cache
const [extractedDataItems, setExtractedDataItems] = useState([]);
```

**Step 2: Add useEffect to populate extractedDataItems**

```javascript
// Populate extractedDataItems from highlights prop
useEffect(() => {
  setExtractedDataItems((highlights || []).map(item => ({
    ...item,
    notes: item.notes || [],
    pdf_locations: item.pdf_locations || [],
  })));
}, [highlights]);
```

**Step 3: Add memoized extractedDataById map**

```javascript
// Memoized lookup map for fast access by ID
const extractedDataById = useMemo(() => {
  return new Map(extractedDataItems.map(data => [data.id, data]));
}, [extractedDataItems]);

// Helper callback to pass down
const getExtractedDataById = useCallback((id) => {
  return extractedDataById.get(id);
}, [extractedDataById]);
```

**Step 4: Add currentUserId to component**

Find where user data is available (check props or context). Add:

```javascript
// Extract current user ID for permissions
const currentUserId = user?.id || null; // Adjust based on your auth context
```

**Step 5: Verify component compiles**

Run: `npm run build`
Expected: No compilation errors

**Step 6: Commit**

```bash
git add src/components/SpecCentricView/DocumentHighlighter.jsx
git commit -m "refactor: replace highlight state with extractedDataItems cache"
```

---

## Task 3: Thread Props to ProjectLogsReader

**Files:**
- Modify: `src/components/SpecCentricView/DocumentHighlighter.jsx`

**Step 1: Update ProjectLogsReader props**

Find where `<ProjectLogsReader>` is rendered. Update to pass new props:

```javascript
<ProjectLogsReader
  extractedDataItems={extractedDataItems}
  getExtractedDataById={getExtractedDataById}
  currentUserId={currentUserId}
  // ... existing props
/>
```

**Step 2: Verify component renders**

Run: `npm start`
Navigate to a document with highlights
Expected: No console errors (ProjectLogsReader will ignore new props for now)

**Step 3: Commit**

```bash
git add src/components/SpecCentricView/DocumentHighlighter.jsx
git commit -m "feat: thread extractedDataItems and currentUserId to ProjectLogsReader"
```

---

## Task 4: Add UI for Note Input in Modal

**Files:**
- Modify: `src/components/SpecCentricView/DocumentHighlighter.jsx`
- Modify: `src/components/SpecCentricView/DocumentHighlighter.css`

**Step 1: Add pendingNoteText state**

Add near other modal-related state:

```javascript
const [pendingNoteText, setPendingNoteText] = useState('');
```

**Step 2: Add textarea to highlight picker modal**

Find the highlight picker modal JSX (search for "Add Highlight" or similar heading). Add after the selected text preview:

```javascript
{/* Note input section */}
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
```

**Step 3: Reset pendingNoteText on modal close**

Find the cancel/close handlers for the modal. Add:

```javascript
const handleCancelHighlight = () => {
  setPendingNoteText(''); // Clear note text
  // ... existing cancel logic
};
```

**Step 4: Add CSS styles**

In `DocumentHighlighter.css`, add at the end:

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

**Step 5: Test UI renders**

Run: `npm start`
Create a highlight
Expected: Note textarea appears in modal, is optional, can type in it

**Step 6: Commit**

```bash
git add src/components/SpecCentricView/DocumentHighlighter.jsx src/components/SpecCentricView/DocumentHighlighter.css
git commit -m "feat: add optional note textarea to highlight creation modal"
```

---

## Task 5: Send Note on Highlight Creation

**Files:**
- Modify: `src/components/SpecCentricView/DocumentHighlighter.jsx`

**Step 1: Update handleSaveHighlight payload**

Find `handleSaveHighlight` function (or similar). Update the payload:

```javascript
async function handleSaveHighlight(highlightType) {
  setIsSavingHighlight(true);

  const payload = {
    // ... existing payload fields (project_id, item_type, pdf_locations, etc.)
    note_text: pendingNoteText.trim() || null, // Add note if provided
  };

  try {
    const { data } = await api.createManualHighlight(projectId, payload);

    // Update local state optimistically
    const newExtractedData = {
      ...data,
      notes: data.notes || [],
      pdf_locations: data.pdf_locations || [],
    };

    setExtractedDataItems(prev => [...prev, newExtractedData]);

    // Reset modal state
    setPendingNoteText('');
    setHighlightPickerOpen(false);
    setPendingHighlight(null);
  } catch (error) {
    setHighlightError(error.message);
  } finally {
    setIsSavingHighlight(false);
  }
}
```

**Step 2: Test highlight creation with note**

Run: `npm start`
1. Create highlight with note text → Check network tab for `note_text` in payload
2. Create highlight without note → Check `note_text: null` in payload

Expected: Payload includes note_text field

**Step 3: Commit**

```bash
git add src/components/SpecCentricView/DocumentHighlighter.jsx
git commit -m "feat: include note_text in highlight creation payload"
```

---

## Task 6: Add Apryse Utility Functions

**Files:**
- Modify: `src/components/PdfReader/projectLogsReader.js`

**Step 1: Accept new props at function signature**

Find the main function export. Update to accept new props:

```javascript
export default function projectLogsReader({
  extractedDataItems,
  getExtractedDataById,
  currentUserId,
  // ... existing props
}) {
  // ... existing code
}
```

**Step 2: Add sticky note position configuration**

At the top of the file (after imports):

```javascript
// Configuration for sticky note positioning
const STICKY_NOTE_POSITION = 'start'; // Options: 'start', 'center', 'end', 'offset'
```

**Step 3: Add calculateStickyPosition utility**

```javascript
/**
 * Calculate sticky note position based on highlight location
 */
function calculateStickyPosition(highlightLocation, position = 'start') {
  const { x, y, width, height } = highlightLocation;

  let calcX, calcY;

  switch(position) {
    case 'start':
      calcX = x;
      calcY = y;
      break;
    case 'center':
      calcX = x + (width || 0) / 2;
      calcY = y + (height || 0) / 2;
      break;
    case 'end':
      calcX = x + (width || 0);
      calcY = y + (height || 0);
      break;
    case 'offset':
      calcX = x + (width || 0) + 5;
      calcY = y - 5;
      break;
    default:
      calcX = x;
      calcY = y;
  }

  // Ensure position is within bounds
  calcX = Math.max(0, calcX);
  calcY = Math.max(0, calcY);

  return { x: calcX, y: calcY };
}
```

**Step 4: Add annotation type checkers**

```javascript
/**
 * Check if annotation is an extraction note parent (sticky without parent)
 */
function isExtractionNoteParent(annotation) {
  return annotation.getCustomData('extracted_data_id') &&
         !annotation.InReplyTo;
}

/**
 * Check if annotation is an extraction note reply
 */
function isExtractionNoteReply(annotation) {
  return annotation.getCustomData('extraction_note_id') &&
         annotation.InReplyTo;
}

/**
 * Check if annotation is a highlight rectangle
 */
function isHighlightRectangle(annotation, Annotations) {
  return annotation instanceof Annotations.RectangleAnnotation &&
         annotation.getCustomData('extracted_data_id');
}
```

**Step 5: Add findStickyNoteForExtractedData utility**

```javascript
/**
 * Find existing sticky note parent for an ExtractedData ID
 */
function findStickyNoteForExtractedData(extractedDataId, annotationManager) {
  const allAnnotations = annotationManager.getAnnotationsList();
  return allAnnotations.find(annot =>
    isExtractionNoteParent(annot) &&
    annot.getCustomData('extracted_data_id') === extractedDataId
  );
}
```

**Step 6: Verify syntax**

Run: `npm run lint src/components/PdfReader/projectLogsReader.js`
Expected: No errors

**Step 7: Commit**

```bash
git add src/components/PdfReader/projectLogsReader.js
git commit -m "feat: add sticky note utility functions to projectLogsReader"
```

---

## Task 7: Create Sticky Notes from Backend Data

**Files:**
- Modify: `src/components/PdfReader/projectLogsReader.js`

**Step 1: Add createNotesForExtractedData function**

Add this function in projectLogsReader.js:

```javascript
/**
 * Create sticky note annotations for an ExtractedData item with notes
 */
function createNotesForExtractedData(extractedData, webViewer, currentUserId) {
  const { annotationManager, Annotations } = webViewer.Core;

  // Safety checks
  if (!extractedData.notes || extractedData.notes.length === 0) {
    return;
  }

  if (!extractedData.pdf_locations || extractedData.pdf_locations.length === 0) {
    console.warn(`ExtractedData ${extractedData.id} has no PDF locations, skipping notes`);
    return;
  }

  const firstLocation = extractedData.pdf_locations[0];
  const position = calculateStickyPosition(firstLocation, STICKY_NOTE_POSITION);

  // Create parent sticky note
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
  parentSticky.ReadOnly = true; // Parent is not editable

  annotationManager.addAnnotation(parentSticky, { imported: true });

  // Create reply annotations for each note
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

**Step 2: Integrate into highlight rendering**

Find where highlights are rendered (search for `createHighlightAnnotations` or similar). After rectangle annotations are added:

```javascript
// After existing highlight rectangle rendering
extractedDataItems.forEach(data => {
  createNotesForExtractedData(data, webViewer, currentUserId);
});
```

**Step 3: Test with backend data**

Run: `npm start`
Navigate to document with ExtractedData that has notes
Expected: Sticky note icons appear on page, clicking opens notes panel with replies

**Step 4: Commit**

```bash
git add src/components/PdfReader/projectLogsReader.js
git commit -m "feat: render sticky notes from backend ExtractedData notes"
```

---

## Task 8: Handle Note Creation Events

**Files:**
- Modify: `src/components/PdfReader/projectLogsReader.js`

**Step 1: Import API methods**

At top of file:

```javascript
import * as api from '../../api/SpecCentricView/api';
```

**Step 2: Add handleAnnotationChanged event handler**

```javascript
/**
 * Handle annotation add/modify events
 */
async function handleAnnotationChanged(annotations, action, { imported }) {
  if (imported) return; // Skip annotations loaded from backend

  for (const annot of annotations) {
    if (!isExtractionNoteReply(annot)) {
      continue;
    }

    if (action === 'add') {
      const extractedDataId = annot.getCustomData('extracted_data_id');
      const noteText = annot.getContents();

      if (!noteText || !noteText.trim()) {
        continue; // Skip empty notes
      }

      try {
        const note = await api.createExtractionNote(
          projectId,
          extractedDataId,
          { text: noteText }
        );

        // Update annotation with backend note ID
        annot.setCustomData('extraction_note_id', note.id);
        annot.setCustomData('created_by_id', note.created_by_id);
        annotationManager.redrawAnnotation(annot);
      } catch (error) {
        console.error('Failed to create note:', error);
        // Rollback: delete the annotation without firing events
        annotationManager.deleteAnnotation(annot, false, true);
      }

      continue;
    }

    if (action === 'modify') {
      const noteId = annot.getCustomData('extraction_note_id');
      const extractedDataId = annot.getCustomData('extracted_data_id');
      const newText = annot.getContents();
      const previousText = annot._originalContents || annot.getCustomData('_previous_contents');

      try {
        await api.updateExtractionNote(
          projectId,
          extractedDataId,
          noteId,
          { text: newText }
        );

        // Clear cached original
        delete annot._originalContents;
      } catch (error) {
        console.error('Failed to update note:', error);

        // Rollback: restore previous text
        if (typeof previousText === 'string') {
          annot.setContents(previousText);
          annotationManager.redrawAnnotation(annot);
        }
      }
    }
  }
}
```

**Step 3: Add handleAnnotationSelected to cache original text**

```javascript
/**
 * Cache original note contents when selected for edit rollback
 */
function handleAnnotationSelected(annotations) {
  annotations.forEach((annot) => {
    if (isExtractionNoteReply(annot)) {
      annot._originalContents = annot.getContents();
    }
  });
}
```

**Step 4: Register event listeners**

Find where webViewer is initialized. After initialization:

```javascript
const { annotationManager, Annotations } = webViewer.Core;

annotationManager.addEventListener('annotationChanged', handleAnnotationChanged);
annotationManager.addEventListener('annotationSelected', handleAnnotationSelected);
```

**Step 5: Test note creation**

Run: `npm start`
1. Click existing sticky note
2. Add reply using Apryse UI
3. Check network tab for POST request
Expected: Note syncs to backend, annotation gets note_id in CustomData

**Step 6: Commit**

```bash
git add src/components/PdfReader/projectLogsReader.js
git commit -m "feat: sync note creation and updates to backend"
```

---

## Task 9: Handle Note Deletion Events

**Files:**
- Modify: `src/components/PdfReader/projectLogsReader.js`

**Step 1: Add handleAnnotationDeleted handler**

```javascript
/**
 * Handle annotation deletion with backend sync and rollback
 */
async function handleAnnotationDeleted(annotations, { imported }) {
  if (imported) return;

  for (const annot of annotations) {
    // Handle reply deletion
    if (isExtractionNoteReply(annot)) {
      const noteId = annot.getCustomData('extraction_note_id');
      const extractedDataId = annot.getCustomData('extracted_data_id');

      // Clone annotation for potential rollback
      const annotCopy = {
        contents: annot.getContents(),
        author: annot.Author,
        customData: { ...annot.CustomData },
        position: {
          x: annot.X,
          y: annot.Y,
          page: annot.PageNumber
        },
        parentId: annot.InReplyTo
      };

      try {
        await api.deleteExtractionNote(
          projectId,
          extractedDataId,
          noteId
        );
      } catch (error) {
        console.error('Failed to delete note:', error);

        // Rollback: recreate the annotation
        const restored = new Annotations.StickyAnnotation({
          PageNumber: annotCopy.position.page,
          X: annotCopy.position.x,
          Y: annotCopy.position.y,
          InReplyTo: annotCopy.parentId,
          ReplyType: 'Group',
        });

        restored.setContents(annotCopy.contents);
        restored.Author = annotCopy.author;
        Object.keys(annotCopy.customData).forEach(key => {
          restored.setCustomData(key, annotCopy.customData[key]);
        });

        annotationManager.addAnnotation(restored, { imported: true });
        annotationManager.drawAnnotationsFromList([restored]);
      }

      continue;
    }

    // Handle parent sticky deletion (deletes all child notes)
    if (isExtractionNoteParent(annot)) {
      const extractedDataId = annot.getCustomData('extracted_data_id');
      const replies = annotationManager.getAnnotationsList().filter(a =>
        a.InReplyTo === annot.Id && isExtractionNoteReply(a)
      );

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
    }
  }
}
```

**Step 2: Register deletion event listener**

Add to event listener registration block:

```javascript
annotationManager.addEventListener('annotationDeleted', handleAnnotationDeleted);
```

**Step 3: Test note deletion**

Run: `npm start`
1. Delete a note reply → Check network for DELETE request
2. Simulate backend error (disconnect network) → Delete note → Note should reappear
Expected: Successful deletes sync to backend, failed deletes rollback

**Step 4: Commit**

```bash
git add src/components/PdfReader/projectLogsReader.js
git commit -m "feat: sync note deletions to backend with rollback"
```

---

## Task 10: Add Click Handler for Highlights

**Files:**
- Modify: `src/components/PdfReader/projectLogsReader.js`

**Step 1: Add handleHighlightClick function**

```javascript
/**
 * Handle click on highlight rectangle to open/create notes
 */
function handleHighlightClick(extractedDataId, webViewer) {
  const { annotationManager, Annotations } = webViewer.Core;

  // Check if sticky note already exists
  const existingSticky = findStickyNoteForExtractedData(extractedDataId, annotationManager);

  if (existingSticky) {
    // Open existing sticky note
    webViewer.UI.openElement('notesPanel');
    annotationManager.selectAnnotation(existingSticky);
    return;
  }

  // Create new sticky note
  const extractedData = getExtractedDataById(extractedDataId);

  if (!extractedData || !extractedData.pdf_locations || extractedData.pdf_locations.length === 0) {
    console.warn(`Cannot create sticky note: ExtractedData ${extractedDataId} has no PDF locations`);
    return;
  }

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
```

**Step 2: Register click event listener**

Update the annotationSelected handler:

```javascript
function handleAnnotationSelected(annotations) {
  const selectedAnnot = annotations[0];

  if (!selectedAnnot) return;

  // Cache original contents for edit rollback
  if (isExtractionNoteReply(selectedAnnot)) {
    selectedAnnot._originalContents = selectedAnnot.getContents();
  }

  // Handle highlight rectangle clicks
  if (isHighlightRectangle(selectedAnnot, Annotations)) {
    const extractedDataId = selectedAnnot.getCustomData('extracted_data_id');
    if (extractedDataId) {
      handleHighlightClick(extractedDataId, webViewer);
    }
  }
}
```

**Step 3: Test click interaction**

Run: `npm start`
1. Click highlight without notes → Sticky note created, notes panel opens
2. Click highlight with existing notes → Existing sticky selected, notes panel opens
Expected: Smooth interaction, notes panel opens correctly

**Step 4: Commit**

```bash
git add src/components/PdfReader/projectLogsReader.js
git commit -m "feat: add click handler to create/open notes on highlights"
```

---

## Task 11: Fix Scope and Closure Issues

**Files:**
- Modify: `src/components/PdfReader/projectLogsReader.js`

**Step 1: Ensure handlers have access to required variables**

Move all event handlers inside the main function scope or pass dependencies:

```javascript
export default function projectLogsReader({
  extractedDataItems,
  getExtractedDataById,
  currentUserId,
  projectId, // Ensure this is passed as prop
  // ... existing props
}) {
  // ... existing code

  // Make sure all handler functions are defined INSIDE this scope
  // so they have access to projectId, getExtractedDataById, etc.

  function handleAnnotationChanged(annotations, action, { imported }) {
    // Now has access to projectId, api, etc.
    // ... (existing implementation)
  }

  // ... other handlers
}
```

**Step 2: Verify projectId is available**

Check if projectId is passed to projectLogsReader. If not, update DocumentHighlighter:

```javascript
<ProjectLogsReader
  extractedDataItems={extractedDataItems}
  getExtractedDataById={getExtractedDataById}
  currentUserId={currentUserId}
  projectId={projectId} // ADD THIS
  // ... existing props
/>
```

**Step 3: Test all interactions**

Run: `npm start`
Test: Create note, edit note, delete note
Expected: No "undefined" errors in console

**Step 4: Commit**

```bash
git add src/components/PdfReader/projectLogsReader.js src/components/SpecCentricView/DocumentHighlighter.jsx
git commit -m "fix: ensure event handlers have access to required scope variables"
```

---

## Task 12: Add Error Notification Integration

**Files:**
- Modify: `src/components/PdfReader/projectLogsReader.js`

**Step 1: Import toast notifications**

At top of file:

```javascript
import { toast } from 'react-toastify';
```

**Step 2: Add handleError helper**

```javascript
/**
 * Display error notification to user
 */
function handleError(error, context = '') {
  const message = error?.response?.data?.message || error.message || 'An error occurred';
  console.error(`${context}:`, error);
  toast.error(`${context}: ${message}`);
}
```

**Step 3: Update all catch blocks to use handleError**

Replace `console.error` calls in event handlers:

```javascript
// Example in handleAnnotationChanged
try {
  const note = await api.createExtractionNote(...);
  // ...
} catch (error) {
  handleError(error, 'Failed to create note');
  annotationManager.deleteAnnotation(annot, false, true);
}
```

Do the same for:
- Update note errors: `'Failed to update note'`
- Delete note errors: `'Failed to delete note'`

**Step 4: Test error notifications**

Run: `npm start`
Simulate errors (disconnect network or modify API URL)
Expected: Toast notifications appear with clear error messages

**Step 5: Commit**

```bash
git add src/components/PdfReader/projectLogsReader.js
git commit -m "feat: add error notifications for note sync failures"
```

---

## Task 13: Handle Edge Case - Empty Note Text

**Files:**
- Modify: `src/components/PdfReader/projectLogsReader.js`

**Step 1: Add validation in handleAnnotationChanged**

Update the 'add' case:

```javascript
if (action === 'add') {
  const extractedDataId = annot.getCustomData('extracted_data_id');
  const noteText = annot.getContents();

  // Skip empty notes
  if (!noteText || !noteText.trim()) {
    annotationManager.deleteAnnotation(annot, false, true);
    toast.warning('Cannot create empty note');
    continue;
  }

  // ... rest of creation logic
}
```

**Step 2: Test empty note handling**

Run: `npm start`
1. Open sticky note
2. Click "Add Reply"
3. Save without typing
Expected: Note is deleted, warning toast appears

**Step 3: Commit**

```bash
git add src/components/PdfReader/projectLogsReader.js
git commit -m "fix: prevent creation of empty notes"
```

---

## Task 14: Handle Edge Case - Parent Sticky Deletion

**Files:**
- Modify: `src/components/PdfReader/projectLogsReader.js`

**Step 1: Add warning for parent sticky deletion**

Update handleAnnotationDeleted:

```javascript
if (isExtractionNoteParent(annot)) {
  const extractedDataId = annot.getCustomData('extracted_data_id');
  const replies = annotationManager.getAnnotationsList().filter(a =>
    a.InReplyTo === annot.Id && isExtractionNoteReply(a)
  );

  if (replies.length > 0) {
    // Show warning
    toast.info(`Deleting ${replies.length} note(s) from highlight`);
  }

  // Delete all notes from backend
  for (const reply of replies) {
    // ... existing deletion logic
  }
}
```

**Step 2: Test parent deletion**

Run: `npm start`
Delete parent sticky note with multiple replies
Expected: All replies deleted, info toast shows count

**Step 3: Commit**

```bash
git add src/components/PdfReader/projectLogsReader.js
git commit -m "feat: add notification when parent sticky note is deleted"
```

---

## Task 15: Add ReadOnly Permission Enforcement

**Files:**
- Modify: `src/components/PdfReader/projectLogsReader.js`

**Step 1: Add permission check helper**

```javascript
/**
 * Check if current user can edit annotation
 */
function canEditAnnotation(annotation, currentUserId) {
  const createdById = annotation.getCustomData('created_by_id');
  return createdById && createdById === currentUserId;
}
```

**Step 2: Enforce permissions in modify handler**

Update handleAnnotationChanged 'modify' case:

```javascript
if (action === 'modify') {
  const noteId = annot.getCustomData('extraction_note_id');
  const extractedDataId = annot.getCustomData('extracted_data_id');

  // Permission check (safety net - ReadOnly should prevent this)
  if (!canEditAnnotation(annot, currentUserId)) {
    console.error('Unauthorized note modification attempt');
    const previousText = annot._originalContents;
    if (previousText) {
      annot.setContents(previousText);
      annotationManager.redrawAnnotation(annot);
    }
    toast.error('You can only edit your own notes');
    continue;
  }

  // ... rest of modify logic
}
```

**Step 3: Test with multi-user data**

Run: `npm start`
Load document with notes from other users
Expected: Cannot edit other users' notes, ReadOnly flag prevents interaction

**Step 4: Commit**

```bash
git add src/components/PdfReader/projectLogsReader.js
git commit -m "feat: enforce author-only edit permissions on notes"
```

---

## Task 16: Update Highlight Rectangle Creation

**Files:**
- Modify: `src/components/PdfReader/projectLogsReader.js`

**Step 1: Ensure CustomData includes extracted_data_id**

Find where rectangle annotations are created. Ensure CustomData includes:

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
        extracted_data_id: data.id, // CRITICAL for linking
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

**Step 2: Verify CustomData is set**

Run: `npm start`
Create a highlight, then in console:

```javascript
// In browser console
const annot = annotationManager.getSelectedAnnotations()[0];
console.log(annot.CustomData);
```

Expected: Should contain `extracted_data_id`

**Step 3: Commit**

```bash
git add src/components/PdfReader/projectLogsReader.js
git commit -m "fix: ensure highlight rectangles include extracted_data_id in CustomData"
```

---

## Task 17: Integration Testing - Full Flow

**Files:**
- Manual testing only

**Step 1: Test highlight creation with note**

1. Select text in PDF
2. Click "Add New Highlight"
3. Type note in textarea
4. Save
5. Verify:
   - Highlight appears
   - Sticky note appears
   - Notes panel shows note
   - Backend receives note (check network tab)

**Step 2: Test adding note to existing highlight**

1. Click existing highlight (no notes)
2. Verify sticky note created
3. Type note in Apryse UI
4. Save
5. Verify:
   - Note appears in panel
   - Backend receives POST (network tab)
   - Annotation has extraction_note_id

**Step 3: Test adding multiple notes**

1. Open existing sticky note
2. Add 3 replies
3. Verify all sync to backend
4. Reload page
5. Verify all notes load correctly

**Step 4: Test editing notes**

1. Edit your own note
2. Verify backend receives PATCH
3. Try to edit another user's note
4. Verify ReadOnly prevents editing

**Step 5: Test deleting notes**

1. Delete your own note
2. Verify backend receives DELETE
3. Delete parent sticky with multiple notes
4. Verify all notes deleted from backend
5. Try offline delete → reconnect
6. Verify rollback works

**Step 6: Document test results**

Create: `docs/testing/extraction-notes-manual-tests.md`

```markdown
# Extraction Notes Manual Test Results

Date: YYYY-MM-DD
Tester: [Name]

## Test Results

- [ ] Highlight creation with note: PASS/FAIL
- [ ] Adding note to existing highlight: PASS/FAIL
- [ ] Multiple notes (replies): PASS/FAIL
- [ ] Editing own note: PASS/FAIL
- [ ] Cannot edit other's note: PASS/FAIL
- [ ] Deleting note: PASS/FAIL
- [ ] Parent deletion: PASS/FAIL
- [ ] Notes persist on reload: PASS/FAIL
- [ ] Error handling (offline): PASS/FAIL

## Issues Found

[List any issues]

## Notes

[Additional observations]
```

**Step 7: Commit test documentation**

```bash
git add docs/testing/extraction-notes-manual-tests.md
git commit -m "docs: add manual test checklist for extraction notes"
```

---

## Task 18: Performance Testing

**Files:**
- Manual testing only

**Step 1: Test with many notes**

1. Create highlight with 20+ notes
2. Verify UI remains responsive
3. Check memory usage in DevTools
4. Reload page and verify load time

**Step 2: Test with many highlights**

1. Load document with 50+ highlights
2. Verify sticky notes render correctly
3. Check for performance issues
4. Monitor network requests

**Step 3: Document performance findings**

Add to test documentation:

```markdown
## Performance Testing

- Highlights tested: [number]
- Notes per highlight: [number]
- Initial load time: [ms]
- Memory usage: [MB]
- Issues: [none/list]
```

**Step 4: Commit performance results**

```bash
git add docs/testing/extraction-notes-manual-tests.md
git commit -m "docs: add performance test results"
```

---

## Task 19: Error Handling Edge Cases

**Files:**
- Manual testing only

**Step 1: Test network failure scenarios**

1. Disconnect network
2. Try to create note → Verify rollback + error toast
3. Try to edit note → Verify rollback + error toast
4. Try to delete note → Verify rollback + error toast
5. Reconnect network
6. Verify operations work again

**Step 2: Test backend error scenarios**

Simulate 400/500 errors by temporarily breaking backend:

1. Create note with invalid data
2. Verify error handling
3. Update note with invalid data
4. Verify rollback

**Step 3: Document edge case results**

Add to test documentation:

```markdown
## Edge Case Testing

- Network failure: PASS/FAIL
- Backend 400 error: PASS/FAIL
- Backend 500 error: PASS/FAIL
- Empty note prevention: PASS/FAIL
- No PDF locations: PASS/FAIL
```

**Step 4: Commit edge case results**

```bash
git add docs/testing/extraction-notes-manual-tests.md
git commit -m "docs: add edge case test results"
```

---

## Task 20: Code Review and Cleanup

**Files:**
- All modified files

**Step 1: Run linter on all files**

```bash
npm run lint src/components/SpecCentricView/DocumentHighlighter.jsx
npm run lint src/components/PdfReader/projectLogsReader.js
npm run lint src/api/SpecCentricView/api.js
```

Fix any warnings or errors.

**Step 2: Check for console.log statements**

Search all modified files for debug logs:

```bash
grep -n "console.log" src/components/SpecCentricView/DocumentHighlighter.jsx
grep -n "console.log" src/components/PdfReader/projectLogsReader.js
```

Remove or replace with proper logging.

**Step 3: Review TODO comments**

Search for TODO comments:

```bash
grep -n "TODO" src/components/SpecCentricView/DocumentHighlighter.jsx
grep -n "TODO" src/components/PdfReader/projectLogsReader.js
```

Resolve or document for future work.

**Step 4: Verify CSS is clean**

Check for unused styles:

```bash
# Manually review DocumentHighlighter.css
# Remove any unused note-related styles
```

**Step 5: Run build**

```bash
npm run build
```

Verify no warnings or errors.

**Step 6: Commit cleanup**

```bash
git add .
git commit -m "refactor: clean up code, remove debug logs, fix lint warnings"
```

---

## Task 21: Create Pull Request

**Files:**
- Git operations only

**Step 1: Push branch to remote**

```bash
git push origin annotation-comments
```

**Step 2: Create PR using gh CLI**

```bash
gh pr create --title "Feature: Add extraction notes to highlights" --body "$(cat <<'EOF'
## Summary
- Add optional note field to highlight creation modal
- Render notes as Apryse sticky note annotations with replies
- Sync note CRUD operations bidirectionally with backend
- Enforce author-only edit permissions
- Optimistic updates with rollback error handling

## Implementation Details
- Refactored DocumentHighlighter to maintain normalized ExtractedData cache
- Extended projectLogsReader with sticky note creation and event handling
- Added API methods for note CRUD operations
- Full error handling with user-facing notifications

## Test Plan
- [x] Manual testing completed (see docs/testing/extraction-notes-manual-tests.md)
- [x] Tested all user flows (create, edit, delete)
- [x] Tested permissions (author-only editing)
- [x] Tested error handling (network failures, rollbacks)
- [x] Performance tested with 50+ highlights and 20+ notes

## Related Issues
Closes #[ISSUE_NUMBER]

## Screenshots
[Add screenshots of note UI in modal and sticky notes in PDF]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Step 3: Add reviewers**

```bash
gh pr edit --add-reviewer [reviewer-username]
```

**Step 4: Verify PR created successfully**

```bash
gh pr view
```

Expected: PR details displayed with correct title and body

---

## Success Criteria

✅ **Implementation is complete when:**

1. Users can add optional notes during highlight creation
2. Users can click highlights to add notes after creation
3. Notes appear as Apryse sticky note annotations
4. Multiple notes appear as threaded replies
5. Notes are visible by default (open initially)
6. Only note authors can edit/delete their notes
7. All changes sync to backend in real-time
8. Optimistic updates provide instant feedback
9. Failed operations rollback with error messages
10. Notes persist across page reloads
11. All manual tests pass

---

## Rollback Plan

If issues are discovered after merge:

**Step 1: Revert the merge commit**

```bash
git revert -m 1 [merge-commit-hash]
git push origin main
```

**Step 2: Document rollback reason**

Create issue:

```bash
gh issue create --title "Extraction notes rollback - [reason]" --body "[details]"
```

**Step 3: Fix issues in feature branch**

Continue development in `annotation-comments` branch.

---

## Future Enhancements

**Out of scope for this PR (document for future work):**

1. Rich text notes (currently plain text only)
2. @mentions (tagging other users in notes)
3. Note templates (pre-defined note structures)
4. Bulk operations (add same note to multiple highlights)
5. Note search (filter/search notes across document)
6. Note export (export notes to CSV/PDF)
7. Note notifications (notify users when notes added to shared highlights)
8. Offline queue (handle rapid note creation while offline)

**Document in:**

```bash
echo "# Extraction Notes Future Enhancements

See docs/plans/2025-11-24-extraction-notes-frontend-design.md section 'Future Enhancements'

Priority items:
1. Rich text notes
2. @mentions
3. Note search

" > docs/plans/extraction-notes-future-work.md

git add docs/plans/extraction-notes-future-work.md
git commit -m "docs: document future enhancement ideas for extraction notes"
```

---

## References

- **Design Document:** `docs/plans/2025-11-24-extraction-notes-frontend-design.md`
- **Backend API Plan:** `docs/extraction-notes-implementation.md`
- **Apryse Docs:** https://docs.apryse.com/web/guides/annotation/types/stickynoteannotation
- **Skills Used:**
  - @superpowers:writing-plans (this skill)
  - @superpowers:executing-plans (for implementation)
  - @superpowers:verification-before-completion (before PR)
