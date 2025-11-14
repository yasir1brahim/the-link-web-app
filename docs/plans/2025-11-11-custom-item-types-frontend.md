# Custom Item Types Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add UI for managing and using custom highlight types in PDF viewer

**Architecture:** Extends existing highlight system with modal for CRUD operations, integrates custom types into highlight picker with separated sections, reuses existing filtering patterns

**Tech Stack:** React, SCSS, Axios, React Bootstrap, React Toastify

---

## Task 1: API helpers for custom item types

**Files**
- Modify: `src/api/SpecCentricView/api.js`

**Step 1: Add aligned helper functions**

Append the following near the bottom of the module (just above the existing export list) so they share the same `axiosInstance`/`handleError` pattern. Note the `/projects/` path segment:

```javascript
// Custom item type helpers
const getCustomItemTypes = async (projectId) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/projects/${projectId}/custom-item-types/`,
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

const createCustomItemType = async (projectId, payload) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/projects/${projectId}/custom-item-types/`,
            data: payload,
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

const updateCustomItemType = async (projectId, typeId, payload) => {
    try {
        return await axiosInstance({
            method: 'patch',
            url: `/api/deliverables/projects/${projectId}/custom-item-types/${typeId}/`,
            data: payload,
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

const deleteCustomItemType = async (projectId, typeId) => {
    try {
        return await axiosInstance({
            method: 'delete',
            url: `/api/deliverables/projects/${projectId}/custom-item-types/${typeId}/`,
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

const getCustomTypeColorPalette = async (projectId) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/projects/${projectId}/custom-item-types/color-palette/`,
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};
```

Add these names to the exported symbol list at the bottom.

**Step 2: Commit**

```bash
git add src/api/SpecCentricView/api.js
git commit -m "feat: add custom item type API helpers"
```

---

## Task 2: Custom type manager overlay

**Files**
- Create: `src/components/SpecCentricView/shared/CustomItemTypesManager.jsx`
- Create: `src/components/SpecCentricView/shared/CustomItemTypesManager.css`

**Step 1: Lightweight overlay**

Implement a manager component that mirrors the current highlight picker styling:

- Wrap content in the same overlay divs (`highlight-picker-overlay`, `highlight-picker-modal`) so we can drop it in without new dependencies.
- Props: `projectId`, `isOpen`, `onClose`, `onRefresh`, `initialTypes` (optional).
- On open, fetch the latest types and palette via the helper functions and store them in local state.
- Support CRUD operations with inline inputs/buttons. Use the existing toast service for notifications. Keep forms simple (input + color picker + primary/secondary buttons).
- After any create/update/delete, call `onRefresh?.()` so the parent can reload state.

**Step 2: Styling**

Add a small `.css` file that extends the current overlay styles (e.g., `.highlight-picker-section`, `.custom-type-row`). Avoid global resets; just adapt spacing/scrolling inside the modal.

**Step 3: Commit**

```bash
git add src/components/SpecCentricView/shared/CustomItemTypesManager.jsx \
        src/components/SpecCentricView/shared/CustomItemTypesManager.css
git commit -m "feat: add overlay manager for custom highlight types"
```

---

## Task 3: Update highlight constants

**Files**
- Modify: `src/components/SpecCentricView/highlightConstants.js`

**Step 1: Add helper utilities**

Append these functions at the end of the file so they extend the existing exports:

```javascript
export const formatCustomTypes = (customTypes = []) =>
  customTypes.map((type) => ({
    key: `custom_${type.id}`,
        type: type.name,
    color: `${type.color}A6`,
        isCustom: true,
    customTypeId: type.id,
    }));

export const isCustomHighlight = (highlight) =>
  highlight?.extraction_type === 'custom_highlights' && !!highlight?.custom_item_type;

export const getHighlightColor = (highlight, customTypes = []) => {
  if (isCustomHighlight(highlight)) {
    const match = customTypes.find((type) => type.id === highlight.custom_item_type?.id);
    return match ? `${match.color}A6` : 'rgba(128, 128, 128, 0.6)';
  }

  const standard = HIGHLIGHT_TYPES.find((type) => type.key === highlight?.item_type);
  return standard ? standard.color : 'rgba(128, 128, 128, 0.6)';
};
```

Keep `DEFAULT_FILTER_KEYS` unchanged so legacy consumers still initialise correctly.

**Step 2: Commit**

```bash
git add src/components/SpecCentricView/highlightConstants.js
git commit -m "feat: helper utilities for custom highlight types"
```

---

## Task 4: Load custom types in SpecViewer

**Files**
- Modify: `src/components/SpecCentricView/SpecViewer.jsx`

**Step 1: Import helpers and define state**

Add the new API helper to the import list:

```javascript
import {
  getSpecCentricData,
  getSpecSectionContent,
  getCustomItemTypes,
} from '../../api/SpecCentricView/api';
```

Introduce state alongside existing declarations:

```javascript
const [customItemTypes, setCustomItemTypes] = useState([]);
```

**Step 2: Fetch custom types**

Create a memoised loader above the main effect:

```javascript
const refreshCustomTypes = useCallback(async () => {
  if (!projectId) {
    return;
  }
    try {
        const response = await getCustomItemTypes(projectId);
        setCustomItemTypes(response.data.results || []);
  } catch (err) {
    console.warn('Unable to load custom item types', err);
  }
}, [projectId]);
```

Invoke `refreshCustomTypes()` in the `getSpecCentricData` success handler, after the existing `setSpecData` calls.

**Step 3: Pass data to children**

- Add `customItemTypes={customItemTypes}` and `onCustomTypesUpdate={refreshCustomTypes}` to `DocumentHighlighter`.
- Add `customItemTypes={customItemTypes}` to `HighlightLegend`.
- Ensure props remain optional downstream to avoid regressions if the list is empty.

**Step 4: Commit**

```bash
git add src/components/SpecCentricView/SpecViewer.jsx
git commit -m "feat: surface custom item types in SpecViewer"
```

---

## Task 5: Update DocumentHighlighter for custom types

**Files**
- Modify: `src/components/SpecCentricView/DocumentHighlighter.jsx`

**Step 1: Wire in new helpers**

- Import `formatCustomTypes`, `isCustomHighlight`, `getHighlightColor`, and the `CustomItemTypesManager`.
- Extend props so `customItemTypes = []` and `onCustomTypesUpdate` are optional.

**Step 2: Extend highlight options**

- When building `highlightTypeOptions`, append entries returned by `formatCustomTypes(customItemTypes)` so the existing grid displays both standard and custom buttons. No modal replacement—keep the current overlay.
- Add a footer link inside the overlay (“Manage custom types”) that hides the picker and opens the manager overlay.

**Step 3: Selection logic**

- When the user selects a custom type, set `payload.custom_item_type_id` and force `payload.extraction_type = 'custom_highlights'`.
- Continue using `pendingHighlight.selectedText` and `pendingHighlight.locations` so we don’t break the current payload contract.

**Step 4: Filtering and styling**

- When filtering highlights, check `isCustomHighlight(highlight)` and map to `activeFilters.has(\`custom_${highlight.custom_item_type.id}\`)`.
- Use `getHighlightColor(highlight, customItemTypes)` wherever colors are applied.

**Step 5: Mount the manager overlay**

- Track `showCustomTypesManager` state.
- Render `<CustomItemTypesManager>` alongside the existing overlay when toggled. Pass `projectId`, `initialTypes={customItemTypes}`, `onClose`, and `onRefresh={onCustomTypesUpdate}`.
- After closing the manager, reopen the picker if appropriate and refresh data via `onCustomTypesUpdate?.()`.

**Step 6: Commit**

```bash
git add src/components/SpecCentricView/DocumentHighlighter.jsx
git commit -m "feat: support custom highlight types in DocumentHighlighter"
```

---

## Task 6: Update HighlightLegend for Custom Types

**Files**
- Modify: `src/components/SpecCentricView/HighlightLegend.jsx`

**Step 1: Accept custom types**

- Import `formatCustomTypes`, `isCustomHighlight`.
- Extend the component signature to accept `customItemTypes = []`.

**Step 2: Count custom highlights**

- When building the statistics map, initialise counts for each formatted custom type (`custom_${id}`) and increment them whenever a highlight meets `isCustomHighlight`.
- Keep the existing logic for standard types intact.

**Step 3: Render list**

- Combine the sorted standard types with `formatCustomTypes(customItemTypes)` when rendering.
- Mark custom entries with a small badge or icon but reuse the existing `.legend-item` markup.
- Ensure `activeFilters` initialises with both the default keys and any custom keys so toggling works seamlessly.

**Step 4: Styles**

- Extend `HighlightLegend.css` with minimal rules for the custom badge (e.g., `.legend-color-custom-badge`). Avoid structural changes.

**Step 5: Commit**

```bash
git add src/components/SpecCentricView/HighlightLegend.jsx \
        src/components/SpecCentricView/HighlightLegend.css
git commit -m "feat: display custom highlight types in legend"
```

---

## Task 7: Integration testing

**Step 1: Manual checklist**

While exercising Spec Viewer, confirm:
1. ✓ The highlight picker shows a “Manage custom types” link that opens the manager overlay.
2. ✓ CRUD operations inside the manager update the list and persist via the API helpers.
3. ✓ Newly created types appear in the picker with the correct colour chips.
4. ✓ Creating a manual highlight with a custom type succeeds and the highlight renders with the right colour.
5. ✓ `HighlightLegend` displays custom entries with counts and toggling filters hides/shows the associated highlights.

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete custom item types frontend implementation"
```

---

## Verification Steps

1. **API Integration**: Verify all API calls work with backend
   - GET `/api/deliverables/projects/{id}/custom-item-types/`
   - POST/PATCH/DELETE operations
   - Color palette endpoint

2. **State Management**: Confirm proper state updates
   - Custom types refresh after CRUD operations
   - Highlights update after creating with custom type
   - Filters properly include/exclude custom highlights

3. **UI/UX**: Check user experience
   - Modal responsiveness
   - Color picker functionality
   - Error handling with toasts
   - Loading states during operations

4. **Edge Cases**: Test boundary conditions
   - Empty custom types list
   - Long type names
   - Duplicate name prevention
   - Deleting types with existing highlights

---

## Troubleshooting Guide

**Common Issues:**

1. **Custom types not showing in picker**
   - Check: Are custom types loaded in SpecViewer?
   - Check: Is customItemTypes prop passed to DocumentHighlighter?
   - Debug: Add console.log in loadCustomTypes function

2. **Filtering not working for custom types**
   - Check: Is the filter key format correct (`custom_${id}`)?
   - Check: Is isCustomHighlight function working?
   - Debug: Log activeFilters Set and highlight data

3. **Colors not displaying correctly**
   - Check: Is transparency being added (+ 'A6')?
   - Check: Color format from backend (#RRGGBB)
   - Debug: Log color values in getHighlightColor

4. **API errors on create/update/delete**
   - Check: Network tab for actual error response
   - Check: Are all required fields present?
   - Check: Is projectId being passed correctly?

---

## Notes for Implementation

- This plan assumes the engineer has the backend implementation complete and running
- All file paths are relative to `/Users/averypawelek/the-link/the-link-web-app/`
- The implementation follows existing patterns in the codebase (useState, axios, Bootstrap)
- No new dependencies are required - everything uses existing packages
- Each task is designed to be committed independently for clean git history
- The implementation maintains backward compatibility with existing highlights