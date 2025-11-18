# Spec View PDF Export with Annotations - Design Document

**Date:** 2025-11-13
**Feature:** Export PDF with Annotations from Spec View Tab
**Status:** Design Complete

## Overview

Allow users to export PDFs with annotations (highlights) from the Spec View tab. Users can select which spec sections to export and which annotation types to include. Single sections download as PDF files, multiple sections download as a ZIP archive.

## Requirements

- Export button in document header area
- Modal for selecting sections and annotation filters
- Export current or multiple spec sections
- Include programmatically created highlights in exported PDFs
- Package multiple sections as separate PDFs in a ZIP file
- Show progress, success notifications, and error handling
- File naming: `{masterformat_number} - {document_name}.pdf`

## Component Architecture

### 1. ExportButton Component
**Location:** `src/components/SpecCentricView/ExportButton.jsx`

- Renders in spec document header (next to section title)
- Opens export modal when clicked
- Simple button with download/export icon

### 2. ExportModal Component
**Location:** `src/components/SpecCentricView/ExportModal.jsx`

**Features:**
- Checklist of all spec sections (current section pre-selected)
- Annotation type filters (based on HighlightLegend)
- Currently active filters pre-selected by default
- Cancel and Export buttons
- Progress indicator during export
- Error display with retry options

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  specSections: [...],
  currentSection: {...},
  activeFilters: Set,
  customItemTypes: [...],
  projectId: string,
  projectVersionId: string
}
```

### 3. PdfExportService
**Location:** `src/services/pdfExportService.js`

**Responsibilities:**
- Load PDFs in hidden WebViewer instances
- Create annotations programmatically from highlight data
- Export PDFs using Apryse's `getFileData()` API
- Package multiple PDFs into ZIP using JSZip
- Trigger browser downloads

**Key Methods:**
```javascript
exportSections(config) // Main export orchestrator
exportSingleSection(section, highlights, filters) // Export one section
createAnnotationsFromHighlights(annotationManager, highlights, filters) // Create Apryse annotations
packageAsZip(pdfFiles) // Create ZIP archive
downloadFile(blob, filename) // Trigger download
```

### 4. Integration with SpecViewer
**File:** `src/components/SpecCentricView/SpecViewer.jsx`

Add ExportButton to document header area, passing:
- specData (all sections)
- sectionContent (highlights for current section)
- selectedSection
- activeFilters
- customItemTypes
- projectId, projectVersionId

## Export Process Flow

### User Interaction
1. User clicks "Export PDF" button
2. Modal opens with section checklist and annotation filters
3. User selects sections and filters, clicks "Export"
4. Progress indicator shows current section being exported
5. ZIP downloads automatically (or single PDF)
6. Success notification appears
7. Modal closes

### Technical Process

**For Current Section (already loaded):**
- Reuse existing WebViewer instance from projectLogsReader
- Export immediately with `getFileData()`

**For Other Sections:**
1. Create temporary hidden WebViewer instance
2. Load section's PDF from `pdf_url`
3. Fetch section content via `getSpecSectionContent()` API
4. Programmatically create annotations using Apryse Annotations API
5. Export with `getFileData()`
6. Destroy temporary instance
7. Repeat for next section (sequential processing)

**Packaging:**
- Single section: Download PDF directly
- Multiple sections: Create ZIP with JSZip, download

## Apryse API Usage

### Methods
- `documentViewer.getDocument()` - Get current document
- `Core.Annotations.TextHighlightAnnotation` - Create highlight annotations
- `annotationManager.addAnnotation()` - Add annotations to document
- `documentViewer.getDocument().getFileData()` - Export PDF with embedded annotations

### Annotation Creation
Convert highlight data to Apryse annotations:

```javascript
// Our format
{
  page_no: number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: {r, g, b},
  item_type: string,
  extraction_type: string
}

// Convert to Apryse TextHighlightAnnotation with:
// - Page number
// - Quads (coordinates)
// - Color (from our color maps)
```

### Color Mapping
Reuse logic from `DocumentHighlighter.jsx`:
- QA_COLOR_MAP for item types (inspections, warranties, etc.)
- EXTRACTION_COLOR_MAP for extraction types
- hexToRgb() for custom item type colors

## Data Structures

### Export Configuration
```javascript
{
  selectedSections: [sectionId1, sectionId2, ...],
  annotationFilters: Set(['inspections', 'warranties', 'custom_123', ...]),
  projectId: string,
  projectVersionId: string
}
```

### Section Export Data
```javascript
{
  section: {
    id: number,
    pdf_url: string,
    masterformat_number: string,
    document_name: string,
    custom_section_title: string,
    masterformat_title: string
  },
  content: {
    submittal_highlights: [...],
    ai_log_highlights: [...]
  },
  highlights: [...] // Processed with colors
}
```

## Error Handling

### Error Scenarios

1. **PDF Load Failures**
   - Expired/invalid PDF URL or network issues
   - *Handling:* Show error in modal, allow retry or skip section

2. **Memory Constraints**
   - Too many sections selected
   - *Handling:* Sequential processing, show per-section progress

3. **Missing Data**
   - Section has no highlights
   - *Handling:* Export PDF without annotations

4. **Export API Failures**
   - `getFileData()` fails
   - *Handling:* Show error message, allow retry

5. **ZIP Creation Failures**
   - JSZip fails
   - *Handling:* Fall back to individual PDF downloads

### Edge Cases

- No sections selected → Disable export button
- No annotation filters selected → Export without highlights
- Section already being viewed → Reuse existing WebViewer
- Very large exports (10+ sections) → Show warning
- Browser blocks download → Show instructions

### User Feedback

**Progress:**
- "Exporting section 2 of 5: 03 30 00 - Cast-in-Place Concrete..."

**Success:**
- Toast: "Successfully exported 5 sections"

**Errors:**
- "Failed to export Section 03 30 00: PDF could not be loaded. [Retry] [Skip]"

## Dependencies

### New Package
```json
"jszip": "^3.10.1"
```

### Existing Dependencies
- `@pdftron/webviewer` (already in use)
- React, axios (already in use)

## File Naming

### Single PDF
Format: `{masterformat_number} - {document_name}.pdf`
Example: `03 30 00 - Cast-in-Place Concrete.pdf`

### ZIP Archive
Format: `Spec Sections Export - {YYYY-MM-DD}.zip`
Example: `Spec Sections Export - 2025-11-13.zip`

Contents: Individual PDFs with single PDF naming convention

## Performance Optimizations

1. **Sequential Processing** - Export one section at a time to manage memory
2. **Reuse Current Viewer** - Don't reload currently displayed section
3. **Immediate Cleanup** - Destroy temporary WebViewer instances after export
4. **Lazy Loading** - Only fetch section content when exporting

## WebViewer Instance Management

### Hidden Instance Creation
```javascript
// Create hidden container
const container = document.createElement('div');
container.style.display = 'none';
document.body.appendChild(container);

// Initialize WebViewer
const instance = await WebViewer({
  path: '/webviewer/lib',
  initialDoc: pdfUrl
}, container);

// After export
instance.UI.dispose();
container.remove();
```

### Lifecycle
- Create → Load PDF → Create Annotations → Export → Destroy

## UI/UX Specifications

### Export Button
- Location: Document header, right side
- Text: "Export PDF" with download icon
- Style: Secondary button style

### Export Modal
- Width: ~500px
- Height: Auto (max-height with scroll)
- Sections: Scrollable checklist
- Annotation Filters: Grouped checkboxes matching HighlightLegend
- Actions: Cancel (left) and Export (right, primary)

### Progress Indicator
- Show percentage: "45% complete"
- Show current section: Section name
- Indeterminate spinner while processing

### Notifications
- Success toast: 3 second auto-dismiss
- Error alerts: Persistent until dismissed

## Implementation Approach

**Client-side export** using Apryse Web SDK:
- Fast for single sections
- No backend changes required
- Works with existing infrastructure
- Can add server-side support later if needed

## References

- [Apryse Annotation Import/Export Guide](https://docs.apryse.com/web/guides/annotation/import-export)
- Existing code: `DocumentHighlighter.jsx`, `projectLogsReader.js`
- Color constants: `highlightConstants.js`
