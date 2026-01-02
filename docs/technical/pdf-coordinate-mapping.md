# PDF Coordinate Transformation for Rotated Pages

## Issue Summary
Architectural drawings commonly use a built-in rotation (typically 270°) to display a portrait-stored page in landscape orientation. This creates a coordinate system mismatch between the **Parser** and the **Viewer**.

### The Conflict
*   **Parser Output (Visual Space)**: Coordinates are calculated based on the landscape view (e.g., 2592x1728). The origin (0,0) is at the top-left of the landscape image.
*   **WebViewer Input (Internal Space)**: Apryse WebViewer's annotation and navigation APIs expect coordinates relative to the *unrotated* portrait page (e.g., 1728x2592).

### Symptoms
1.  **Page Overflow**: An X-coordinate of 1750 (intended for a 2592-wide visual page) exceeds the 1728-wide internal page, causing the viewer to scroll into the next page.
2.  **Transposed Highlights**: Without transformation, X and Y axes are effectively swapped, making annotations appear in the wrong place or off-screen.

## Coordinate Mapping Logic

The transformation maps a visual bounding box `[vx1, vy1, vx2, vy2]` to the internal PDF space. Note that for 90° and 270° rotations, the width and height dimensions are swapped.

### 270° Rotation (Most Common for Drawings)
*Visual Landscape (2592x1728) -> Internal Portrait (1728x2592)*

*   **Internal X** = `InternalPageWidth - VisualY2`
*   **Internal Y** = `VisualX1`
*   **Internal Width** = `VisualHeight`
*   **Internal Height** = `VisualWidth`

### 90° Rotation
*   **Internal X** = `VisualY1`
*   **Internal Y** = `InternalPageHeight - VisualX2`
*   **Internal Width** = `VisualHeight`
*   **Internal Height** = `VisualWidth`

### 180° Rotation
*   **Internal X** = `InternalPageWidth - VisualX2`
*   **Internal Y** = `InternalPageHeight - VisualY2`
*   **Internal Width** = `VisualWidth`
*   **Internal Height** = `VisualHeight`

## Implementation Strategy

### Frontend Temporary Fix
A helper function `transformToInternal` was added to `ProjectLogsReader.js`. It intercepts coordinate objects and applies the rotation-based math before passing them to Apryse.

```javascript
function transformToInternal(loc, rotation, pageInfo) {
  const { x, y, width, height } = loc;
  const { width: pageWidth, height: pageHeight } = pageInfo; // Internal dimensions

  switch (rotation) {
    case 270:
      return {
        x: pageHeight - y - height,
        y: x,
        width: height,
        height: width,
      };
    // ... other cases ...
  }
}
```

### Backend Transition (Recommended)
The Django backend has been updated to perform these transformations upon receiving the webhook from the parser. 

1.  **Detection**: The parser sends `rotation`, `width`, and `height` metadata.
2.  **Transformation**: The `drawing_extraction_webhook` applies the math and stores the result in `bounding_box`.
3.  **Preservation**: The original visual coordinates are stored in `raw_bounding_box`.
4.  **Flagging**: The API provides an `is_internal` flag. If `true`, the frontend skips its local transformation to avoid double-correcting.

## Verification Checklist
- [x] 270° rotation scrolls to correct page.
- [x] 270° rotation shows highlights in correct visual position.
- [x] 0° rotation documents (standard specs) are unaffected.
- [x] Mixed rotation documents are handled on a per-page basis.

