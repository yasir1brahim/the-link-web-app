# Drawings Table Refactor Design

## Overview

Extract reusable table components from the submittal table (ProjectLogs) to create a consistent UI for the drawings table. The submittal table remains untouched - we create new shared components and only integrate them into drawings.

## Approach

**Copy-and-generalize**: Create new generalized components in `/src/components/shared/DataTable/` by copying patterns from the submittal table. Only integrate into drawings. Submittal table stays as-is.

## Features for Drawings Table

### Toolbar (left to right)
- **Export dropdown** - Excel option (expandable for future formats)
- **Clear Filters button**
- **Count displays** - Clickable counts (Drawing Files, Categories) that show details when clicked

### Toolbar (right side)
- **Search input** - Moved from filters section to toolbar
- **Upload button** - Styled like submittal

### Table Features
- **Column-header filters** - Filter icons in headers with select dropdowns
- **Sortable columns** - Click to sort ascending/descending
- **Single-row click selection** - Multi-select support built in but disabled
- **Submittal-style row styling** - Alternating colors, hover states, tighter padding

### PDF Viewer
- **Side-by-side layout** - Match submittal structure
- **Up/down arrows** - Navigate between rows while viewing

### Pagination
- **Rows per page selector** - Match submittal style (may need backend update)

## Features NOT Included
- Checkbox multi-select (built into component but disabled for drawings)
- Delete button (no bulk actions yet)
- Save Selection / View Saved Lists
- Combine Rows
- Resizable columns

## Component Architecture

### New Shared Components (`/src/components/shared/DataTable/`)

```
/src/components/shared/DataTable/
├── DataTable.jsx           # Main table wrapper
├── DataTable.css           # Shared styles
├── DataTableToolbar.jsx    # Toolbar container
├── DataTablePagination.jsx # Pagination with rows per page
├── ExportDropdown.jsx      # Dropdown menu for exports
├── CountDisplay.jsx        # Clickable count badges
├── SearchInput.jsx         # Search with icon and clear
├── ColumnFilterPopover.jsx # Filter dropdown for headers
└── PdfViewerPane.jsx       # PDF viewer with navigation
```

### DataTable Props
```javascript
<DataTable
  columns={columnsConfig}
  data={drawings}
  selectedId={selectedDrawingId}
  onSelect={handleSelect}
  sortColumn={sortColumn}
  sortDirection={sortDirection}
  onSort={handleSort}
  columnFilters={columnFilters}
  filterOptions={filterOptions}
  onFilter={handleFilter}
  enableMultiSelect={false}
/>
```

### Columns Configuration
```javascript
const drawingsColumns = [
  {
    key: 'drawingFile',
    header: 'Drawing File',
    sortable: true,
    filterable: true,
    filterType: 'select',
    width: '30%'
  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    filterable: true,
    filterType: 'select',
    width: '20%'
  },
  {
    key: 'text',
    header: 'Text',
    sortable: true,
    filterable: true,
    filterType: 'select',
    width: '50%'
  }
]
```

## Data Flow

State stays in `DrawingsTab.jsx`. Shared components are presentational.

### State Shape
```javascript
{
  drawings: [],
  selectedDrawingId: null,
  sortColumn: 'drawingFile',
  sortDirection: 'asc',
  columnFilters: {
    drawingFile: null,
    category: null,
    text: null
  },
  searchQuery: '',
  currentPage: 1,
  rowsPerPage: 25,
  totalCount: 0,
  isPdfViewerOpen: false,
  drawingFilesCount: 0,
  categoriesCount: 0
}
```

### Props Flow
```
DrawingsTab (state + handlers)
├── DataTableToolbar
│   ├── ExportDropdown (onExport)
│   ├── ClearFiltersButton (onClearFilters)
│   ├── CountDisplay (counts, onClick)
│   ├── SearchInput (value, onChange)
│   └── UploadButton (onUpload)
├── DataTable (data, columns, sort, filters, handlers)
├── DataTablePagination (page, rowsPerPage, total, onChange)
└── PdfViewerPane (url, onClose, onNavigate)
```

## Styling

- Copy relevant styles from submittal table CSS
- Use CSS variables for consistency:
  ```css
  --dt-row-hover: #f5f5f5;
  --dt-row-selected: #e3f2fd;
  --dt-row-alt: #fafafa;
  --dt-border-color: #e0e0e0;
  --dt-header-bg: #fff;
  ```
- Match submittal's tighter cell padding

## Implementation Steps

### Phase 1: Create shared components
1. Create `/src/components/shared/DataTable/` directory
2. Build `DataTable.css` - copy relevant styles from submittal
3. Build `DataTableToolbar.jsx` - toolbar container with left/right layout
4. Build `SearchInput.jsx` - search with icon and clear
5. Build `ExportDropdown.jsx` - dropdown menu component
6. Build `CountDisplay.jsx` - clickable count badges
7. Build `ColumnFilterPopover.jsx` - filter dropdown for column headers
8. Build `DataTablePagination.jsx` - pagination with rows per page
9. Build `PdfViewerPane.jsx` - PDF viewer with up/down navigation
10. Build `DataTable.jsx` - main table component tying it together

### Phase 2: Integrate into Drawings
11. Update `DrawingsTab.jsx` - add new state (sorting, columnFilters, rowsPerPage)
12. Replace `DrawingsFilters.jsx` usage with new toolbar
13. Replace `DrawingsTable.jsx` usage with new `DataTable`
14. Add up/down arrow navigation to PDF viewer
15. Update pagination to use new component

### Phase 3: Backend (if needed)
16. Update drawings API to support `rowsPerPage` parameter

### Phase 4: Polish
17. Test all features work correctly
18. Verify styling matches submittal table

## Risk Mitigation

- Submittal table (`ProjectLogs`) is NOT touched at all
- New components are built fresh, not extracted
- Drawings can be tested independently
- Future: migrate submittal to use shared components once proven
