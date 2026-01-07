# Drawings Tab: PDF Viewer Coordinate System Mismatch

**Date:** 2025-12-29
**Updated:** 2026-01-02
**Status:** In Progress - root cause identified, transformation formula needs refinement
**Priority:** To be determined

## Problem Description

When clicking a row in the Drawings tab, the PDF viewer exhibits two issues:

1. **Opens to the wrong page** - e.g., clicking a note on page 2 opens page 3
2. **Rectangle annotation does not appear** - the bounding box highlight is not visible

## Root Cause: 270° Page Rotation

**CONFIRMED:** The architectural drawing PDFs have **270° rotation** applied to all pages. This causes a coordinate system mismatch between:
- The parser's output coordinates (in PDF/unrotated space)
- The viewer's expected coordinates (in rotated/displayed space)

### Evidence

```javascript
// All pages have 270° rotation
const doc = window._debugViewer.Core.documentViewer.getDocument();
for (let i = 1; i <= doc.getPageCount(); i++) {
  console.log(`Page ${i}: rotation=${doc.getPageRotation(i)}°`);
}
// Output: Page 1: rotation=270°, Page 2: rotation=270°, ... (all pages)
```

### Page Dimensions

- **Displayed dimensions:** 2592 × 1728 (landscape, 36" × 24" architectural D-size)
- **Stored dimensions:** 1728 × 2592 (portrait, rotated 270° for display)

## Detailed Findings from Debug Session (2026-01-02)

### 1. Coordinate Transposition Confirmed

When testing `displayPageLocation(page, x, y)`:
- Changing Y value moved the viewport **horizontally** (not vertically)
- This confirms coordinates are transposed due to the 270° rotation

### 2. Page Offset Explained

The +1 page offset occurs because:
- Parser outputs X coordinate ~1750 (intended for 2592-wide rotated page)
- After rotation, this X value maps to the Y axis
- Y value of 1750 exceeds page height (1728), causing scroll into next page

### 3. Annotation Coordinates in Viewer

```javascript
// Parser output (example)
bounding_box: [1751.04, 244.41, 2014.81, 252.39]
// x1=1751.04, y1=244.41, x2=2014.81, y2=252.39
// width=263.77, height=7.98

// Page info
pageWidth: 2592, pageHeight: 1728, rotation: 270°
```

### 4. Transformation Testing Results

| Test | Formula | Result |
|------|---------|--------|
| Red (simple swap) | `viewerX=pdfY, viewerY=pdfX` | Horizontal correct, vertical mirrored |
| Green | `viewerX=pageHeight-pdfY, viewerY=2*pageHeight-pdfX` | "Pretty close" overall |
| Purple | `viewerX=pageHeight-pdfY, viewerY=pageWidth-pdfX` | Off to the left |
| Cyan | Full bbox transform with green formula | **Correct dimensions, correct vertical, horizontal off to left** |

### 5. Key Finding: Cyan Rectangle Analysis

The cyan rectangle test revealed:
- **Dimensions:** CORRECT (width and height properly swapped for rotation)
- **Vertical position:** CORRECT
- **Horizontal position:** INCORRECT (too far left, needs to move right)

In annotation coordinate space for 270° rotated pages:
- **X coordinate** controls **visual vertical** position
- **Y coordinate** controls **visual horizontal** position

### 6. Partial Transformation Formula

What we know works:
```javascript
// For 270° rotation:
const pageHeight = 1728;

// X transformation (controls vertical) - CORRECT:
viewerX = pageHeight - pdfY2;  // where pdfY2 is the top edge of bounding box

// Width/Height - CORRECT (swap them):
viewerWidth = pdfY2 - pdfY1;   // original height becomes width
viewerHeight = pdfX2 - pdfX1;  // original width becomes height

// Y transformation (controls horizontal) - NEEDS WORK:
// Tried: viewerY = 2*pageHeight - pdfX1  // close but not exact
// Tried: viewerY = 2*pageHeight - pdfX2  // too far left
// Tried: viewerY = pageWidth - pdfX      // too far left
```

## Comparison with Submittal Log

| Aspect | Submittal Log | Drawings |
|--------|---------------|----------|
| Coordinate source | `text_loc` from backend | `bounding_box` from parser |
| Page rotation | Typically 0° | 270° (architectural sheets) |
| Coordinates work? | Yes | No |
| Sample Y values | Small (~150-200) | Large (~1750) |

The Submittal Log works because those PDFs are not rotated, so no transformation is needed.

## Debug Code Added

### Files Modified for Debugging

1. **`src/components/Drawings/DrawingsTab.jsx`**
   - Added `[DRAWINGS_DEBUG]` console logging for raw parser data and constructed textLoc
   - Removed temp `-1` page adjustment for testing

2. **`src/components/ProjectLogs/combinedLogs.jsx`**
   - Added `[SUBMITTAL_DEBUG]` logging for comparison

3. **`src/components/PdfReader/projectLogsReader.js`**
   - Added `[VIEWER_DEBUG]` logging for displayPageLocation calls
   - Added page dimension logging
   - Added annotation creation logging
   - Exposed `window._debugViewer` and `window._debugAnnotationManager` for console testing

### Useful Console Commands for Testing

```javascript
// Check page rotation
const doc = window._debugViewer.Core.documentViewer.getDocument();
doc.getPageRotation(2);  // Returns 270 for rotated pages

// Get page dimensions
doc.getPageInfo(2);  // {width: 2592, height: 1728}

// Check current page
window._debugViewer.Core.documentViewer.getCurrentPage();

// Test displayPageLocation
window._debugViewer.Core.documentViewer.displayPageLocation(pageNum, x, y);

// List all annotations
window._debugAnnotationManager.getAnnotationsList().forEach((a, i) => {
  console.log(`Annotation ${i}:`, {
    page: a.PageNumber, x: a.X, y: a.Y,
    width: a.Width, height: a.Height, hidden: a.Hidden
  });
});

// Create test annotation
const Annotations = window._debugViewer.Core.Annotations;
const testAnnot = new Annotations.RectangleAnnotation({
  PageNumber: 2,
  X: 100, Y: 100, Width: 50, Height: 200,
  StrokeColor: new Annotations.Color(255, 0, 0, 1),
  FillColor: new Annotations.Color(255, 0, 0, 0.3),
});
window._debugAnnotationManager.addAnnotation(testAnnot);
window._debugAnnotationManager.redrawAnnotation(testAnnot);
```

## Next Steps

### Immediate Priority: Fix Horizontal Position Formula

The Y transformation (which controls horizontal position) needs to be corrected. Current best attempt:
```javascript
viewerY = 2 * pageHeight - pdfX1;  // Close but not exact
```

Possible approaches:
1. **Investigate Apryse coordinate conversion APIs** - Check if `getViewerCoordinates()` or similar methods handle rotation automatically
2. **Test with known coordinates** - Place an annotation manually at a known visual position and reverse-engineer the formula
3. **Check Apryse documentation** for 270° rotation coordinate handling

### Backend Option (Recommended Long-term)

Have the parser:
1. Detect page rotation
2. Transform coordinates to viewer space before outputting
3. Include rotation metadata in the response

This would keep the frontend simple and consistent with how Submittal Log works.

### Testing Checklist

Once a fix is implemented, test with:
- [ ] 270° rotated PDFs (current architectural drawings)
- [ ] 0° rotation PDFs (standard documents)
- [ ] 90° and 180° rotated PDFs (if applicable)
- [ ] Various page sizes (letter, legal, architectural D/E)
- [ ] Multiple notes on the same page
- [ ] Notes at different positions (corners, center, edges)

## References

- [Apryse WebViewer Coordinates Guide](https://docs.apryse.com/documentation/web/guides/coordinates/)
- Apryse coordinate systems:
  - **PDF Coordinates:** Origin at bottom-left, Y increases upward
  - **Viewer Page Coordinates:** Origin at top-left, Y increases downward
  - For rotated pages, these systems interact in complex ways

## Session Notes

### 2026-01-02 Debug Session Summary

1. Confirmed 270° rotation is the root cause
2. Identified that coordinates are transposed (X↔Y swap needed)
3. Found that dimensions and vertical position can be correctly transformed
4. Horizontal position formula still needs refinement
5. Added extensive debug logging for future testing
