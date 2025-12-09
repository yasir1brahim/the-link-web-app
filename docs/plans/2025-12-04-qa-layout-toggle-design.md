# QA Features Layout Toggle Design

## Overview

Revert the QA Planner and Owner Deliverables features from a separate "Inspection & QA" tab back to the Compass chat sidebar, while keeping the tabbed layout available behind an easily toggleable flag.

## Goal

Allow developers to switch between two layouts:
1. **Sidebar layout** (default): QA features appear as buttons in the Compass chat sidebar
2. **Tabbed layout**: QA features appear in a dedicated "Inspection & QA" tab

## Design

### The Toggle Flag

A local constant at the top of `ProjectLogs.jsx`:

```javascript
// Toggle between tabbed layout (true) and sidebar layout (false)
// Set to false to show QA features in Compass sidebar instead of separate tab
const USE_TABBED_QA_LAYOUT = false;
```

### Shared Logic via Custom Hook

To avoid code duplication, extract all state and handler logic into a shared hook.

**Create `src/components/SpecGpt/hooks/useInspectionQA.js`**

The hook manages:
- `showLogViewer` - whether log viewer is visible
- `currentLogData` - the log being viewed
- `currentLogType` - 'owner_deliverables_log' or 'qa_planner'
- `isLoadingLog` - loading state
- `selectedFeature` - which sidebar button is selected
- `showQAPlannerModal` - modal visibility
- `isGeneratingQALogs` - generation loading state
- `isLoading` - general loading state

The hook exposes handlers:
- `onShowOwnerDeliverablesLogsClick()`
- `onShowQAPlannerClick()`
- `onQAPlannerSubmit(selectedOptions)`
- `onQAPlannerRegenerate()`
- `onBackFromLogViewer()`
- `setShowQAPlannerModal()`

The hook accepts parameters:
- `projectId`
- `projectVersionId`

The hook contains the `useEffect` for polling log updates when status is `PROCESSING`.

### Prop Flow

```
ProjectLogs.jsx
├── USE_TABBED_QA_LAYOUT constant
├── passes useQaTabbedLayout to ProjectLogsHeaderTop
│   └── conditionally renders "Inspection & QA" tab button
├── passes useQaTabbedLayout + feature flags to Chat
│   └── when false: shows sidebar buttons, LogViewer, QAPlannerModal
└── conditionally renders InspectionQA for 'inspection-qa' tab
    └── only when useQaTabbedLayout is true
```

### Component Changes

#### Chat/index.js

New props:
- `useQaTabbedLayout`
- `isInspectionLogFeatureFlagActive`
- `isQaPlannerFlagActive`

When `useQaTabbedLayout` is `false`:
1. Import and call `useInspectionQA(projectId, projectVersionId)`
2. Pass handlers and feature flags to `ChatSidebar`
3. Conditionally render `LogViewer` when `showLogViewer` is true
4. Render `QAPlannerModal`

#### Chat/ChatSidebar/index.js

Restore props:
- `onShowOwnerDeliverablesLogsClick`
- `onShowQAPlannerClick`
- `isInspectionLogFeatureFlagActive`
- `isQaPlannerFlagActive`

Conditionally render Owner Deliverables and QA Planner buttons when feature flags are active.

#### InspectionQA/index.js

Refactor to use `useInspectionQA` hook instead of inline state and handlers. Component becomes a thin UI wrapper.

### File Changes Summary

| File | Changes |
|------|---------|
| `src/components/SpecGpt/hooks/useInspectionQA.js` | **NEW** - shared hook |
| `src/components/ProjectLogs/ProjectLogs.jsx` | Add constant; pass props |
| `src/components/shared/Header/ProjectLogsHeaderTop.jsx` | Conditional tab rendering |
| `src/components/SpecGpt/components/Chat/index.js` | Use hook when sidebar mode |
| `src/components/SpecGpt/components/Chat/ChatSidebar/index.js` | Restore button props |
| `src/components/SpecGpt/components/InspectionQA/index.js` | Use shared hook |

### Behavior

When `USE_TABBED_QA_LAYOUT = false` (sidebar mode):
- No "Inspection & QA" tab in header
- Owner Deliverables and QA Planner buttons appear in Compass sidebar
- Clicking them shows LogViewer in place of the chat

When `USE_TABBED_QA_LAYOUT = true` (tabbed mode):
- "Inspection & QA" tab appears in header
- Clicking it shows the InspectionQA component
- Compass sidebar has no QA buttons

### Notes

- Inspection List feature has been removed; only Owner Deliverables and QA Planner remain
- `LogViewer` and `QAPlannerModal` components require no changes
- The flag can be promoted to a feature flag later if per-team control is needed
