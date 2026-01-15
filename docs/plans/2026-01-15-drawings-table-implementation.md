# Drawings Table Refactor - TDD Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create reusable DataTable components from submittal table patterns and integrate them into the drawings table for UI consistency.

**Architecture:** Build shared components in `/src/components/shared/DataTable/` using TDD. Each component is tested in isolation, then integrated into DrawingsTab. Submittal table remains untouched.

**Tech Stack:** React, Jest, @testing-library/react, reactstrap (Dropdown), @mui/material (Pagination, Select), CSS

---

## Task 1: Create DataTable Directory and CSS Foundation

**Files:**
- Create: `src/components/shared/DataTable/DataTable.css`
- Create: `src/components/shared/DataTable/index.js`

**Step 1: Create directory structure**

Run: `mkdir -p src/components/shared/DataTable/__tests__`

**Step 2: Create CSS file with base styles**

Create `src/components/shared/DataTable/DataTable.css`:
```css
/* DataTable Shared Component Styles */

/* CSS Variables */
:root {
  --dt-row-hover: #f5f5f5;
  --dt-row-selected: #e3f2fd;
  --dt-row-alt: #fafafa;
  --dt-border-color: #e0e0e0;
  --dt-header-bg: #fff;
  --dt-primary: #1976d2;
}

/* Table Wrapper */
.dt-wrapper {
  border: 1px solid rgba(229, 231, 235, 1);
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.06),
              0px 1px 3px 0px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  max-height: calc(100vh - 280px);
  margin-bottom: 10px;
  overflow: auto;
}

/* Table Base */
.dt-table {
  width: 100%;
  border-collapse: collapse;
}

.dt-table th {
  background: var(--dt-header-bg);
  position: sticky;
  top: 0;
  z-index: 1;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 5px;
  text-align: left;
  border-bottom: 1px solid var(--dt-border-color);
}

.dt-table td {
  font-size: 13px;
  padding: 4px 5px;
  color: rgba(14, 35, 50, 1);
  line-height: 1.3;
}

.dt-table tbody tr {
  background: #fff;
  cursor: pointer;
}

.dt-table tbody tr:nth-child(even) {
  background: var(--dt-row-alt);
}

.dt-table tbody tr:hover {
  background: var(--dt-row-hover);
}

.dt-table tbody tr.dt-row-selected {
  background: var(--dt-row-selected);
}

/* Header Cell with Icons */
.dt-header-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dt-header-cell .dt-sort-icon,
.dt-header-cell .dt-filter-icon {
  cursor: pointer;
  opacity: 0.7;
}

.dt-header-cell .dt-sort-icon:hover,
.dt-header-cell .dt-filter-icon:hover {
  opacity: 1;
}

.dt-header-cell .dt-filter-icon.active {
  opacity: 1;
  color: var(--dt-primary);
}

/* Toolbar */
.dt-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  flex-wrap: wrap;
  gap: 8px;
}

.dt-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dt-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Export Dropdown */
.dt-export-btn {
  background: #fff;
  border: 1px solid var(--dt-border-color);
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dt-export-btn:hover {
  background: #f5f5f5;
}

/* Clear Filters Button */
.dt-clear-filters-btn {
  background: transparent;
  border: none;
  color: var(--dt-primary);
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
}

.dt-clear-filters-btn:hover {
  text-decoration: underline;
}

/* Count Display */
.dt-count-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.dt-count-item {
  cursor: pointer;
  color: var(--dt-primary);
}

.dt-count-item:hover {
  text-decoration: underline;
}

.dt-count-separator {
  color: #ccc;
}

/* Search Input */
.dt-search {
  position: relative;
  display: flex;
  align-items: center;
}

.dt-search-input {
  height: 32px;
  border: none;
  border-bottom: 2px solid #e2e2e2;
  outline: none;
  border-radius: 3px 3px 0 0;
  font-size: 14px;
  color: #676f74;
  background-color: #ffffff;
  padding: 8px 8px 8px 36px;
  transition: border-color 0.3s ease;
  width: 200px;
}

.dt-search-input:focus {
  border-color: var(--dt-primary);
}

.dt-search-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  padding: 4px;
}

.dt-search-clear {
  cursor: pointer;
  padding: 4px;
  margin-left: 4px;
}

.dt-search-collapsed {
  width: 32px;
  height: 32px;
  background: #f4f7fb;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Upload Button */
.dt-upload-btn {
  background: var(--dt-primary);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dt-upload-btn:hover {
  background: #1565c0;
}

/* Pagination */
.dt-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 0;
  gap: 16px;
}

/* Filter Popover */
.dt-filter-popover {
  position: absolute;
  background: #fff;
  border: 1px solid var(--dt-border-color);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 150px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 100;
}

.dt-filter-option {
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 2px;
}

.dt-filter-option:hover {
  background: #f5f5f5;
}

.dt-filter-option.selected {
  background: var(--dt-row-selected);
}

/* Loading & Empty States */
.dt-loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.dt-empty {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* PDF Viewer Pane */
.dt-pdf-pane {
  position: sticky;
  top: 0;
  height: calc(100vh - 200px);
  border-left: 1px solid var(--dt-border-color);
  display: flex;
  flex-direction: column;
}

.dt-pdf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--dt-border-color);
  background: #f5f5f5;
}

.dt-pdf-title {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.dt-pdf-nav {
  display: flex;
  gap: 4px;
}

.dt-pdf-nav button {
  background: #fff;
  border: 1px solid var(--dt-border-color);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
}

.dt-pdf-nav button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dt-pdf-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.dt-pdf-content {
  flex: 1;
  overflow: hidden;
}
```

**Step 3: Create index.js barrel export**

Create `src/components/shared/DataTable/index.js`:
```javascript
// DataTable shared components
// Components will be exported here as they are created

export { default as DataTableToolbar } from './DataTableToolbar';
export { default as SearchInput } from './SearchInput';
export { default as ExportDropdown } from './ExportDropdown';
export { default as CountDisplay } from './CountDisplay';
export { default as ColumnFilterPopover } from './ColumnFilterPopover';
export { default as DataTablePagination } from './DataTablePagination';
export { default as PdfViewerPane } from './PdfViewerPane';
export { default as DataTable } from './DataTable';
```

**Step 4: Commit**

```bash
git add src/components/shared/DataTable/
git commit -m "feat(DataTable): add directory structure and CSS foundation"
```

---

## Task 2: SearchInput Component

**Files:**
- Create: `src/components/shared/DataTable/__tests__/SearchInput.test.jsx`
- Create: `src/components/shared/DataTable/SearchInput.jsx`

**Step 1: Write the failing test**

Create `src/components/shared/DataTable/__tests__/SearchInput.test.jsx`:
```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchInput from '../SearchInput';

describe('SearchInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Search...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Expanded state', () => {
    it('renders input when expanded', () => {
      render(<SearchInput {...defaultProps} expanded={true} />);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('displays current value in input', () => {
      render(<SearchInput {...defaultProps} value="test query" expanded={true} />);

      expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
    });

    it('calls onChange when typing', () => {
      const onChange = jest.fn();
      render(<SearchInput {...defaultProps} onChange={onChange} expanded={true} />);

      fireEvent.change(screen.getByPlaceholderText('Search...'), {
        target: { value: 'new value' },
      });

      expect(onChange).toHaveBeenCalledWith('new value');
    });

    it('renders clear button when value is not empty', () => {
      render(<SearchInput {...defaultProps} value="test" expanded={true} />);

      expect(screen.getByTestId('search-clear')).toBeInTheDocument();
    });

    it('does not render clear button when value is empty', () => {
      render(<SearchInput {...defaultProps} value="" expanded={true} />);

      expect(screen.queryByTestId('search-clear')).not.toBeInTheDocument();
    });

    it('calls onChange with empty string when clear is clicked', () => {
      const onChange = jest.fn();
      render(<SearchInput {...defaultProps} value="test" onChange={onChange} expanded={true} />);

      fireEvent.click(screen.getByTestId('search-clear'));

      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('Collapsed state', () => {
    it('renders search icon button when collapsed', () => {
      render(<SearchInput {...defaultProps} expanded={false} onExpand={jest.fn()} />);

      expect(screen.getByTestId('search-expand')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    });

    it('calls onExpand when search icon is clicked', () => {
      const onExpand = jest.fn();
      render(<SearchInput {...defaultProps} expanded={false} onExpand={onExpand} />);

      fireEvent.click(screen.getByTestId('search-expand'));

      expect(onExpand).toHaveBeenCalled();
    });
  });

  describe('Always expanded mode', () => {
    it('renders input without collapse functionality when alwaysExpanded', () => {
      render(<SearchInput {...defaultProps} alwaysExpanded={true} />);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      expect(screen.queryByTestId('search-expand')).not.toBeInTheDocument();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- SearchInput --watchAll=false`
Expected: FAIL - Cannot find module '../SearchInput'

**Step 3: Write minimal implementation**

Create `src/components/shared/DataTable/SearchInput.jsx`:
```jsx
import React from 'react';
import { ReactComponent as SearchIcon } from '../../../assets/images/search-icon.svg';
import { ReactComponent as CloseIcon } from '../../../assets/images/close-x.svg';
import './DataTable.css';

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  expanded = true,
  onExpand,
  alwaysExpanded = false,
}) => {
  const isExpanded = alwaysExpanded || expanded;

  if (!isExpanded) {
    return (
      <div
        className="dt-search-collapsed"
        data-testid="search-expand"
        onClick={onExpand}
      >
        <SearchIcon />
      </div>
    );
  }

  return (
    <div className="dt-search">
      <span className="dt-search-icon">
        <SearchIcon />
      </span>
      <input
        type="text"
        className="dt-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <span
          className="dt-search-clear"
          data-testid="search-clear"
          onClick={() => onChange('')}
        >
          <CloseIcon />
        </span>
      )}
    </div>
  );
};

export default SearchInput;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- SearchInput --watchAll=false`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/shared/DataTable/__tests__/SearchInput.test.jsx src/components/shared/DataTable/SearchInput.jsx
git commit -m "feat(DataTable): add SearchInput component with TDD"
```

---

## Task 3: ExportDropdown Component

**Files:**
- Create: `src/components/shared/DataTable/__tests__/ExportDropdown.test.jsx`
- Create: `src/components/shared/DataTable/ExportDropdown.jsx`

**Step 1: Write the failing test**

Create `src/components/shared/DataTable/__tests__/ExportDropdown.test.jsx`:
```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportDropdown from '../ExportDropdown';

describe('ExportDropdown', () => {
  const defaultOptions = [
    { label: 'Excel', value: 'excel', icon: null },
    { label: 'CSV', value: 'csv', icon: null },
  ];

  const defaultProps = {
    options: defaultOptions,
    onExport: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders export button with label', () => {
    render(<ExportDropdown {...defaultProps} />);

    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders custom button label', () => {
    render(<ExportDropdown {...defaultProps} buttonLabel="Download" />);

    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', () => {
    render(<ExportDropdown {...defaultProps} />);

    fireEvent.click(screen.getByText('Export'));

    expect(screen.getByText('Excel')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  it('calls onExport with option value when option is clicked', () => {
    const onExport = jest.fn();
    render(<ExportDropdown {...defaultProps} onExport={onExport} />);

    fireEvent.click(screen.getByText('Export'));
    fireEvent.click(screen.getByText('Excel'));

    expect(onExport).toHaveBeenCalledWith('excel');
  });

  it('closes dropdown after selection', () => {
    render(<ExportDropdown {...defaultProps} />);

    fireEvent.click(screen.getByText('Export'));
    expect(screen.getByText('Excel')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Excel'));

    // Dropdown should close - Excel option no longer visible
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders single option without dropdown', () => {
    const singleOption = [{ label: 'Excel', value: 'excel', icon: null }];
    const onExport = jest.fn();
    render(<ExportDropdown options={singleOption} onExport={onExport} />);

    // Should still work as dropdown for future extensibility
    fireEvent.click(screen.getByText('Export'));
    fireEvent.click(screen.getByText('Excel'));

    expect(onExport).toHaveBeenCalledWith('excel');
  });

  it('is disabled when disabled prop is true', () => {
    render(<ExportDropdown {...defaultProps} disabled={true} />);

    const button = screen.getByText('Export').closest('button');
    expect(button).toBeDisabled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- ExportDropdown --watchAll=false`
Expected: FAIL - Cannot find module '../ExportDropdown'

**Step 3: Write minimal implementation**

Create `src/components/shared/DataTable/ExportDropdown.jsx`:
```jsx
import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { ReactComponent as DownloadIcon } from '../../../assets/images/file-download.svg';
import './DataTable.css';

const ExportDropdown = ({
  options = [],
  onExport,
  buttonLabel = 'Export',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (value) => {
    onExport(value);
    setIsOpen(false);
  };

  return (
    <Dropdown isOpen={isOpen} toggle={toggle}>
      <DropdownToggle
        caret
        className="dt-export-btn"
        disabled={disabled}
      >
        <DownloadIcon style={{ width: 16, height: 16 }} />
        {buttonLabel}
      </DropdownToggle>
      <DropdownMenu
        style={{
          minWidth: '120px',
          backgroundColor: 'white',
        }}
      >
        {options.map((option) => (
          <DropdownItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'white',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0eaf7')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            {option.icon && (
              <span style={{ marginRight: 8 }}>{option.icon}</span>
            )}
            {option.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default ExportDropdown;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- ExportDropdown --watchAll=false`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/shared/DataTable/__tests__/ExportDropdown.test.jsx src/components/shared/DataTable/ExportDropdown.jsx
git commit -m "feat(DataTable): add ExportDropdown component with TDD"
```

---

## Task 4: CountDisplay Component

**Files:**
- Create: `src/components/shared/DataTable/__tests__/CountDisplay.test.jsx`
- Create: `src/components/shared/DataTable/CountDisplay.jsx`

**Step 1: Write the failing test**

Create `src/components/shared/DataTable/__tests__/CountDisplay.test.jsx`:
```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CountDisplay from '../CountDisplay';

describe('CountDisplay', () => {
  const defaultCounts = [
    { label: 'documents', count: 5, onClick: jest.fn() },
    { label: 'spec sections', count: 3, onClick: jest.fn() },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders counts with labels', () => {
    render(<CountDisplay counts={defaultCounts} />);

    expect(screen.getByText('5 documents')).toBeInTheDocument();
    expect(screen.getByText('3 spec sections')).toBeInTheDocument();
  });

  it('renders singular label when count is 1', () => {
    const counts = [
      { label: 'document', labelPlural: 'documents', count: 1, onClick: jest.fn() },
    ];
    render(<CountDisplay counts={counts} />);

    expect(screen.getByText('1 document')).toBeInTheDocument();
  });

  it('renders plural label when count is not 1', () => {
    const counts = [
      { label: 'document', labelPlural: 'documents', count: 5, onClick: jest.fn() },
    ];
    render(<CountDisplay counts={counts} />);

    expect(screen.getByText('5 documents')).toBeInTheDocument();
  });

  it('calls onClick when count is clicked', () => {
    const onClick = jest.fn();
    const counts = [{ label: 'items', count: 10, onClick }];
    render(<CountDisplay counts={counts} />);

    fireEvent.click(screen.getByText('10 items'));

    expect(onClick).toHaveBeenCalled();
  });

  it('renders separator between counts', () => {
    render(<CountDisplay counts={defaultCounts} />);

    expect(screen.getByText('|')).toBeInTheDocument();
  });

  it('does not render counts with zero value by default', () => {
    const counts = [
      { label: 'items', count: 0, onClick: jest.fn() },
      { label: 'other', count: 5, onClick: jest.fn() },
    ];
    render(<CountDisplay counts={counts} />);

    expect(screen.queryByText('0 items')).not.toBeInTheDocument();
    expect(screen.getByText('5 other')).toBeInTheDocument();
  });

  it('renders counts with zero value when showZero is true', () => {
    const counts = [
      { label: 'items', count: 0, onClick: jest.fn(), showZero: true },
    ];
    render(<CountDisplay counts={counts} />);

    expect(screen.getByText('0 items')).toBeInTheDocument();
  });

  it('renders total count when provided', () => {
    render(<CountDisplay counts={defaultCounts} totalCount={100} totalLabel="submittals" />);

    expect(screen.getByText('100 submittals')).toBeInTheDocument();
  });

  it('does not render when all counts are zero and no total', () => {
    const counts = [
      { label: 'items', count: 0, onClick: jest.fn() },
    ];
    const { container } = render(<CountDisplay counts={counts} />);

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- CountDisplay --watchAll=false`
Expected: FAIL - Cannot find module '../CountDisplay'

**Step 3: Write minimal implementation**

Create `src/components/shared/DataTable/CountDisplay.jsx`:
```jsx
import React from 'react';
import './DataTable.css';

const CountDisplay = ({
  counts = [],
  totalCount,
  totalLabel = 'items',
}) => {
  // Filter out zero counts unless showZero is true
  const visibleCounts = counts.filter(
    (c) => c.count > 0 || c.showZero
  );

  // Don't render anything if no visible counts and no total
  if (visibleCounts.length === 0 && (totalCount === undefined || totalCount === null)) {
    return <div />;
  }

  const formatLabel = (item) => {
    if (item.count === 1 && item.labelPlural) {
      return item.label;
    }
    return item.labelPlural || item.label;
  };

  return (
    <div className="dt-count-display">
      {visibleCounts.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && <span className="dt-count-separator">|</span>}
          <span
            className="dt-count-item"
            onClick={item.onClick}
          >
            {item.count} {formatLabel(item)}
          </span>
        </React.Fragment>
      ))}

      {totalCount !== undefined && totalCount !== null && (
        <>
          {visibleCounts.length > 0 && (
            <span className="dt-count-separator">|</span>
          )}
          <span className="dt-count-total">
            {totalCount} {totalLabel}
          </span>
        </>
      )}
    </div>
  );
};

export default CountDisplay;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- CountDisplay --watchAll=false`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/shared/DataTable/__tests__/CountDisplay.test.jsx src/components/shared/DataTable/CountDisplay.jsx
git commit -m "feat(DataTable): add CountDisplay component with TDD"
```

---

## Task 5: ColumnFilterPopover Component

**Files:**
- Create: `src/components/shared/DataTable/__tests__/ColumnFilterPopover.test.jsx`
- Create: `src/components/shared/DataTable/ColumnFilterPopover.jsx`

**Step 1: Write the failing test**

Create `src/components/shared/DataTable/__tests__/ColumnFilterPopover.test.jsx`:
```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ColumnFilterPopover from '../ColumnFilterPopover';

describe('ColumnFilterPopover', () => {
  const defaultOptions = ['Option A', 'Option B', 'Option C'];
  const defaultProps = {
    options: defaultOptions,
    selectedValue: null,
    onChange: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all options', () => {
    render(<ColumnFilterPopover {...defaultProps} />);

    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('renders "All" option at the top', () => {
    render(<ColumnFilterPopover {...defaultProps} />);

    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('highlights selected option', () => {
    render(<ColumnFilterPopover {...defaultProps} selectedValue="Option B" />);

    const selectedOption = screen.getByText('Option B').closest('.dt-filter-option');
    expect(selectedOption).toHaveClass('selected');
  });

  it('highlights "All" when no value is selected', () => {
    render(<ColumnFilterPopover {...defaultProps} selectedValue={null} />);

    const allOption = screen.getByText('All').closest('.dt-filter-option');
    expect(allOption).toHaveClass('selected');
  });

  it('calls onChange with option value when option is clicked', () => {
    const onChange = jest.fn();
    render(<ColumnFilterPopover {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByText('Option A'));

    expect(onChange).toHaveBeenCalledWith('Option A');
  });

  it('calls onChange with null when "All" is clicked', () => {
    const onChange = jest.fn();
    render(<ColumnFilterPopover {...defaultProps} selectedValue="Option A" onChange={onChange} />);

    fireEvent.click(screen.getByText('All'));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('calls onClose after selection', () => {
    const onClose = jest.fn();
    render(<ColumnFilterPopover {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Option A'));

    expect(onClose).toHaveBeenCalled();
  });

  it('supports object options with id and name', () => {
    const objectOptions = [
      { id: 1, name: 'File 1' },
      { id: 2, name: 'File 2' },
    ];
    const onChange = jest.fn();
    render(
      <ColumnFilterPopover
        options={objectOptions}
        selectedValue={1}
        onChange={onChange}
        onClose={jest.fn()}
        valueKey="id"
        labelKey="name"
      />
    );

    expect(screen.getByText('File 1')).toBeInTheDocument();
    expect(screen.getByText('File 2')).toBeInTheDocument();

    const selectedOption = screen.getByText('File 1').closest('.dt-filter-option');
    expect(selectedOption).toHaveClass('selected');

    fireEvent.click(screen.getByText('File 2'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('renders empty state when no options', () => {
    render(<ColumnFilterPopover {...defaultProps} options={[]} />);

    expect(screen.getByText('No options available')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- ColumnFilterPopover --watchAll=false`
Expected: FAIL - Cannot find module '../ColumnFilterPopover'

**Step 3: Write minimal implementation**

Create `src/components/shared/DataTable/ColumnFilterPopover.jsx`:
```jsx
import React from 'react';
import './DataTable.css';

const ColumnFilterPopover = ({
  options = [],
  selectedValue,
  onChange,
  onClose,
  valueKey = null,
  labelKey = null,
}) => {
  const getValue = (option) => {
    if (valueKey && typeof option === 'object') {
      return option[valueKey];
    }
    return option;
  };

  const getLabel = (option) => {
    if (labelKey && typeof option === 'object') {
      return option[labelKey];
    }
    return option;
  };

  const handleSelect = (value) => {
    onChange(value);
    onClose();
  };

  if (options.length === 0) {
    return (
      <div className="dt-filter-popover">
        <div className="dt-filter-option" style={{ color: '#999' }}>
          No options available
        </div>
      </div>
    );
  }

  return (
    <div className="dt-filter-popover">
      <div
        className={`dt-filter-option ${selectedValue === null ? 'selected' : ''}`}
        onClick={() => handleSelect(null)}
      >
        All
      </div>
      {options.map((option) => {
        const value = getValue(option);
        const label = getLabel(option);
        const isSelected = selectedValue === value;

        return (
          <div
            key={value}
            className={`dt-filter-option ${isSelected ? 'selected' : ''}`}
            onClick={() => handleSelect(value)}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

export default ColumnFilterPopover;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- ColumnFilterPopover --watchAll=false`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/shared/DataTable/__tests__/ColumnFilterPopover.test.jsx src/components/shared/DataTable/ColumnFilterPopover.jsx
git commit -m "feat(DataTable): add ColumnFilterPopover component with TDD"
```

---

## Task 6: DataTablePagination Component

**Files:**
- Create: `src/components/shared/DataTable/__tests__/DataTablePagination.test.jsx`
- Create: `src/components/shared/DataTable/DataTablePagination.jsx`

**Step 1: Write the failing test**

Create `src/components/shared/DataTable/__tests__/DataTablePagination.test.jsx`:
```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTablePagination from '../DataTablePagination';

describe('DataTablePagination', () => {
  const defaultProps = {
    page: 1,
    rowsPerPage: 25,
    totalCount: 100,
    onPageChange: jest.fn(),
    onRowsPerPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders rows per page selector', () => {
    render(<DataTablePagination {...defaultProps} />);

    expect(screen.getByLabelText(/rows/i)).toBeInTheDocument();
  });

  it('displays current rows per page value', () => {
    render(<DataTablePagination {...defaultProps} rowsPerPage={50} />);

    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    render(<DataTablePagination {...defaultProps} />);

    // Should render page numbers or nav buttons
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('calculates correct page count', () => {
    render(<DataTablePagination {...defaultProps} totalCount={100} rowsPerPage={25} />);

    // 100 items / 25 per page = 4 pages
    // Should be able to navigate to page 4
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('calls onPageChange when page is changed', () => {
    const onPageChange = jest.fn();
    render(<DataTablePagination {...defaultProps} onPageChange={onPageChange} />);

    // Click page 2
    fireEvent.click(screen.getByText('2'));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onRowsPerPageChange when rows per page is changed', () => {
    const onRowsPerPageChange = jest.fn();
    render(<DataTablePagination {...defaultProps} onRowsPerPageChange={onRowsPerPageChange} />);

    // Open select and choose 50
    const select = screen.getByLabelText(/rows/i);
    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByText('50'));

    expect(onRowsPerPageChange).toHaveBeenCalledWith(50);
  });

  it('provides standard row options', () => {
    render(<DataTablePagination {...defaultProps} />);

    const select = screen.getByLabelText(/rows/i);
    fireEvent.mouseDown(select);

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('handles single page correctly', () => {
    render(<DataTablePagination {...defaultProps} totalCount={10} rowsPerPage={25} />);

    // Only 1 page, pagination should show page 1
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('handles zero items', () => {
    render(<DataTablePagination {...defaultProps} totalCount={0} />);

    // Should handle gracefully without errors
    expect(screen.getByLabelText(/rows/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- DataTablePagination --watchAll=false`
Expected: FAIL - Cannot find module '../DataTablePagination'

**Step 3: Write minimal implementation**

Create `src/components/shared/DataTable/DataTablePagination.jsx`:
```jsx
import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import './DataTable.css';

const DataTablePagination = ({
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [25, 50, 100, 200],
}) => {
  const pageCount = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  const handlePageChange = (event, newPage) => {
    onPageChange(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <div className="dt-pagination">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel id="dt-rows-per-page-label">Rows</InputLabel>
          <Select
            labelId="dt-rows-per-page-label"
            id="dt-rows-per-page"
            value={rowsPerPage}
            label="Rows"
            onChange={handleRowsPerPageChange}
            sx={{
              '.MuiSelect-select': { padding: '8px 12px' },
            }}
          >
            {rowsPerPageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Pagination
          count={pageCount}
          page={page}
          onChange={handlePageChange}
          shape="rounded"
          size="medium"
          showFirstButton
          showLastButton
        />
      </Box>
    </div>
  );
};

export default DataTablePagination;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- DataTablePagination --watchAll=false`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/shared/DataTable/__tests__/DataTablePagination.test.jsx src/components/shared/DataTable/DataTablePagination.jsx
git commit -m "feat(DataTable): add DataTablePagination component with TDD"
```

---

## Task 7: DataTableToolbar Component

**Files:**
- Create: `src/components/shared/DataTable/__tests__/DataTableToolbar.test.jsx`
- Create: `src/components/shared/DataTable/DataTableToolbar.jsx`

**Step 1: Write the failing test**

Create `src/components/shared/DataTable/__tests__/DataTableToolbar.test.jsx`:
```jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import DataTableToolbar from '../DataTableToolbar';

describe('DataTableToolbar', () => {
  it('renders left content', () => {
    render(
      <DataTableToolbar
        leftContent={<button>Left Button</button>}
      />
    );

    expect(screen.getByText('Left Button')).toBeInTheDocument();
  });

  it('renders right content', () => {
    render(
      <DataTableToolbar
        rightContent={<button>Right Button</button>}
      />
    );

    expect(screen.getByText('Right Button')).toBeInTheDocument();
  });

  it('renders both left and right content', () => {
    render(
      <DataTableToolbar
        leftContent={<span>Left</span>}
        rightContent={<span>Right</span>}
      />
    );

    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('applies correct layout classes', () => {
    const { container } = render(
      <DataTableToolbar
        leftContent={<span>Left</span>}
        rightContent={<span>Right</span>}
      />
    );

    expect(container.querySelector('.dt-toolbar')).toBeInTheDocument();
    expect(container.querySelector('.dt-toolbar-left')).toBeInTheDocument();
    expect(container.querySelector('.dt-toolbar-right')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <DataTableToolbar className="custom-toolbar" />
    );

    expect(container.querySelector('.custom-toolbar')).toBeInTheDocument();
  });

  it('renders children in left section if no leftContent', () => {
    render(
      <DataTableToolbar>
        <button>Child Button</button>
      </DataTableToolbar>
    );

    expect(screen.getByText('Child Button')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- DataTableToolbar --watchAll=false`
Expected: FAIL - Cannot find module '../DataTableToolbar'

**Step 3: Write minimal implementation**

Create `src/components/shared/DataTable/DataTableToolbar.jsx`:
```jsx
import React from 'react';
import './DataTable.css';

const DataTableToolbar = ({
  leftContent,
  rightContent,
  children,
  className = '',
}) => {
  return (
    <div className={`dt-toolbar ${className}`.trim()}>
      <div className="dt-toolbar-left">
        {leftContent || children}
      </div>
      <div className="dt-toolbar-right">
        {rightContent}
      </div>
    </div>
  );
};

export default DataTableToolbar;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- DataTableToolbar --watchAll=false`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/shared/DataTable/__tests__/DataTableToolbar.test.jsx src/components/shared/DataTable/DataTableToolbar.jsx
git commit -m "feat(DataTable): add DataTableToolbar component with TDD"
```

---

## Task 8: PdfViewerPane Component

**Files:**
- Create: `src/components/shared/DataTable/__tests__/PdfViewerPane.test.jsx`
- Create: `src/components/shared/DataTable/PdfViewerPane.jsx`

**Step 1: Write the failing test**

Create `src/components/shared/DataTable/__tests__/PdfViewerPane.test.jsx`:
```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PdfViewerPane from '../PdfViewerPane';

// Mock PdfWrapper since it's complex
jest.mock('../../PdfWrapper', () => ({ children, ...props }) => (
  <div data-testid="pdf-wrapper" data-url={props.pdfData?.url}>
    {children}
  </div>
));

describe('PdfViewerPane', () => {
  const defaultProps = {
    pdfData: { url: 'https://example.com/test.pdf' },
    title: 'Test Document.pdf',
    onClose: jest.fn(),
    onNavigateUp: jest.fn(),
    onNavigateDown: jest.fn(),
    canNavigateUp: true,
    canNavigateDown: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title', () => {
    render(<PdfViewerPane {...defaultProps} />);

    expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<PdfViewerPane {...defaultProps} />);

    expect(screen.getByTestId('pdf-close')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<PdfViewerPane {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByTestId('pdf-close'));

    expect(onClose).toHaveBeenCalled();
  });

  it('renders navigation buttons', () => {
    render(<PdfViewerPane {...defaultProps} />);

    expect(screen.getByTestId('pdf-nav-up')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-nav-down')).toBeInTheDocument();
  });

  it('calls onNavigateUp when up button is clicked', () => {
    const onNavigateUp = jest.fn();
    render(<PdfViewerPane {...defaultProps} onNavigateUp={onNavigateUp} />);

    fireEvent.click(screen.getByTestId('pdf-nav-up'));

    expect(onNavigateUp).toHaveBeenCalled();
  });

  it('calls onNavigateDown when down button is clicked', () => {
    const onNavigateDown = jest.fn();
    render(<PdfViewerPane {...defaultProps} onNavigateDown={onNavigateDown} />);

    fireEvent.click(screen.getByTestId('pdf-nav-down'));

    expect(onNavigateDown).toHaveBeenCalled();
  });

  it('disables up button when canNavigateUp is false', () => {
    render(<PdfViewerPane {...defaultProps} canNavigateUp={false} />);

    expect(screen.getByTestId('pdf-nav-up')).toBeDisabled();
  });

  it('disables down button when canNavigateDown is false', () => {
    render(<PdfViewerPane {...defaultProps} canNavigateDown={false} />);

    expect(screen.getByTestId('pdf-nav-down')).toBeDisabled();
  });

  it('renders PDF wrapper with correct url', () => {
    render(<PdfViewerPane {...defaultProps} />);

    const pdfWrapper = screen.getByTestId('pdf-wrapper');
    expect(pdfWrapper).toHaveAttribute('data-url', 'https://example.com/test.pdf');
  });

  it('shows loading state when isLoading is true', () => {
    render(<PdfViewerPane {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId('pdf-loading')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- PdfViewerPane --watchAll=false`
Expected: FAIL - Cannot find module '../PdfViewerPane'

**Step 3: Write minimal implementation**

Create `src/components/shared/DataTable/PdfViewerPane.jsx`:
```jsx
import React from 'react';
import PdfWrapper from '../../PdfWrapper';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ReactComponent as CloseIcon } from '../../../assets/images/close-x.svg';
import Loader from '../../Loader';
import './DataTable.css';

const PdfViewerPane = ({
  pdfData,
  title,
  onClose,
  onNavigateUp,
  onNavigateDown,
  canNavigateUp = true,
  canNavigateDown = true,
  isLoading = false,
}) => {
  return (
    <div className="dt-pdf-pane">
      <div className="dt-pdf-header">
        <span className="dt-pdf-title" title={title}>
          {title}
        </span>

        <div className="dt-pdf-nav">
          <button
            data-testid="pdf-nav-up"
            onClick={onNavigateUp}
            disabled={!canNavigateUp || isLoading}
          >
            <ArrowDropUpIcon />
          </button>
          <button
            data-testid="pdf-nav-down"
            onClick={onNavigateDown}
            disabled={!canNavigateDown || isLoading}
          >
            <ArrowDropDownIcon />
          </button>
        </div>

        <button
          className="dt-pdf-close"
          data-testid="pdf-close"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="dt-pdf-content">
        {isLoading && (
          <div data-testid="pdf-loading" className="dt-loading">
            <Loader />
          </div>
        )}
        <PdfWrapper pdfData={pdfData} />
      </div>
    </div>
  );
};

export default PdfViewerPane;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- PdfViewerPane --watchAll=false`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/shared/DataTable/__tests__/PdfViewerPane.test.jsx src/components/shared/DataTable/PdfViewerPane.jsx
git commit -m "feat(DataTable): add PdfViewerPane component with TDD"
```

---

## Task 9: DataTable Main Component

**Files:**
- Create: `src/components/shared/DataTable/__tests__/DataTable.test.jsx`
- Create: `src/components/shared/DataTable/DataTable.jsx`

**Step 1: Write the failing test**

Create `src/components/shared/DataTable/__tests__/DataTable.test.jsx`:
```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable from '../DataTable';

describe('DataTable', () => {
  const mockColumns = [
    { key: 'name', header: 'Name', sortable: true, filterable: true },
    { key: 'category', header: 'Category', sortable: true, filterable: true },
    { key: 'description', header: 'Description', sortable: false, filterable: false },
  ];

  const mockData = [
    { id: 1, name: 'Item A', category: 'Type 1', description: 'Desc A' },
    { id: 2, name: 'Item B', category: 'Type 2', description: 'Desc B' },
    { id: 3, name: 'Item C', category: 'Type 1', description: 'Desc C' },
  ];

  const defaultProps = {
    columns: mockColumns,
    data: mockData,
    rowKey: 'id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders column headers', () => {
      render(<DataTable {...defaultProps} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders data rows', () => {
      render(<DataTable {...defaultProps} />);

      expect(screen.getByText('Item A')).toBeInTheDocument();
      expect(screen.getByText('Item B')).toBeInTheDocument();
      expect(screen.getByText('Item C')).toBeInTheDocument();
    });

    it('renders sort icon for sortable columns', () => {
      render(<DataTable {...defaultProps} />);

      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader.querySelector('[data-testid="sort-icon"]')).toBeInTheDocument();
    });

    it('does not render sort icon for non-sortable columns', () => {
      render(<DataTable {...defaultProps} />);

      const descHeader = screen.getByText('Description').closest('th');
      expect(descHeader.querySelector('[data-testid="sort-icon"]')).not.toBeInTheDocument();
    });

    it('renders filter icon for filterable columns', () => {
      render(<DataTable {...defaultProps} />);

      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader.querySelector('[data-testid="filter-icon"]')).toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
      render(<DataTable {...defaultProps} data={[]} />);

      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('renders loading state', () => {
      render(<DataTable {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId('table-loading')).toBeInTheDocument();
    });
  });

  describe('Row Selection', () => {
    it('calls onRowSelect when row is clicked', () => {
      const onRowSelect = jest.fn();
      render(<DataTable {...defaultProps} onRowSelect={onRowSelect} />);

      fireEvent.click(screen.getByText('Item A'));

      expect(onRowSelect).toHaveBeenCalledWith(mockData[0]);
    });

    it('highlights selected row', () => {
      render(<DataTable {...defaultProps} selectedId={2} />);

      const selectedRow = screen.getByText('Item B').closest('tr');
      expect(selectedRow).toHaveClass('dt-row-selected');
    });
  });

  describe('Sorting', () => {
    it('calls onSort when sort icon is clicked', () => {
      const onSort = jest.fn();
      render(<DataTable {...defaultProps} onSort={onSort} />);

      const nameHeader = screen.getByText('Name').closest('th');
      fireEvent.click(nameHeader.querySelector('[data-testid="sort-icon"]'));

      expect(onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('toggles sort direction on subsequent clicks', () => {
      const onSort = jest.fn();
      render(
        <DataTable
          {...defaultProps}
          onSort={onSort}
          sortColumn="name"
          sortDirection="asc"
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      fireEvent.click(nameHeader.querySelector('[data-testid="sort-icon"]'));

      expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });
  });

  describe('Filtering', () => {
    it('opens filter popover when filter icon is clicked', () => {
      render(
        <DataTable
          {...defaultProps}
          filterOptions={{ name: ['Item A', 'Item B', 'Item C'] }}
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      fireEvent.click(nameHeader.querySelector('[data-testid="filter-icon"]'));

      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('calls onFilter when filter option is selected', () => {
      const onFilter = jest.fn();
      render(
        <DataTable
          {...defaultProps}
          onFilter={onFilter}
          filterOptions={{ name: ['Item A', 'Item B', 'Item C'] }}
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      fireEvent.click(nameHeader.querySelector('[data-testid="filter-icon"]'));
      fireEvent.click(screen.getByText('Item A'));

      expect(onFilter).toHaveBeenCalledWith('name', 'Item A');
    });

    it('shows active filter indicator', () => {
      render(
        <DataTable
          {...defaultProps}
          columnFilters={{ name: 'Item A' }}
          filterOptions={{ name: ['Item A', 'Item B', 'Item C'] }}
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      const filterIcon = nameHeader.querySelector('[data-testid="filter-icon"]');
      expect(filterIcon).toHaveClass('active');
    });
  });

  describe('Custom cell rendering', () => {
    it('uses custom render function when provided', () => {
      const columnsWithRender = [
        {
          key: 'name',
          header: 'Name',
          render: (value, row) => <strong data-testid="custom-cell">{value.toUpperCase()}</strong>,
        },
      ];

      render(<DataTable columns={columnsWithRender} data={mockData} rowKey="id" />);

      expect(screen.getByTestId('custom-cell')).toHaveTextContent('ITEM A');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- DataTable.test --watchAll=false`
Expected: FAIL - Cannot find module '../DataTable'

**Step 3: Write minimal implementation**

Create `src/components/shared/DataTable/DataTable.jsx`:
```jsx
import React, { useState, useRef, useEffect } from 'react';
import ColumnFilterPopover from './ColumnFilterPopover';
import Loader from '../../Loader';
import { SortIcon } from '../icons/sortIcon';
import { FilterIcon } from '../icons/filterIcon';
import './DataTable.css';

const DataTable = ({
  columns = [],
  data = [],
  rowKey = 'id',
  selectedId = null,
  onRowSelect,
  sortColumn = null,
  sortDirection = 'asc',
  onSort,
  columnFilters = {},
  filterOptions = {},
  onFilter,
  isLoading = false,
  emptyMessage = 'No data available',
}) => {
  const [openFilter, setOpenFilter] = useState(null);
  const filterRef = useRef(null);

  // Close filter popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setOpenFilter(null);
      }
    };

    if (openFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFilter]);

  const handleSort = (columnKey) => {
    if (!onSort) return;

    const newDirection =
      sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDirection);
  };

  const handleFilterClick = (columnKey) => {
    setOpenFilter(openFilter === columnKey ? null : columnKey);
  };

  const handleFilterSelect = (columnKey, value) => {
    if (onFilter) {
      onFilter(columnKey, value);
    }
    setOpenFilter(null);
  };

  const getCellValue = (row, column) => {
    const value = row[column.key];
    if (column.render) {
      return column.render(value, row);
    }
    return value;
  };

  if (isLoading) {
    return (
      <div className="dt-wrapper">
        <div className="dt-loading" data-testid="table-loading">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="dt-wrapper">
      <table className="dt-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ width: column.width }}>
                <div className="dt-header-cell">
                  <span>{column.header}</span>

                  {column.sortable && (
                    <span
                      className="dt-sort-icon"
                      data-testid="sort-icon"
                      onClick={() => handleSort(column.key)}
                    >
                      <SortIcon />
                    </span>
                  )}

                  {column.filterable && filterOptions[column.key] && (
                    <span
                      className={`dt-filter-icon ${columnFilters[column.key] ? 'active' : ''}`}
                      data-testid="filter-icon"
                      onClick={() => handleFilterClick(column.key)}
                    >
                      <FilterIcon isActive={!!columnFilters[column.key]} />
                    </span>
                  )}

                  {openFilter === column.key && (
                    <div ref={filterRef} style={{ position: 'relative' }}>
                      <ColumnFilterPopover
                        options={filterOptions[column.key] || []}
                        selectedValue={columnFilters[column.key] || null}
                        onChange={(value) => handleFilterSelect(column.key, value)}
                        onClose={() => setOpenFilter(null)}
                        valueKey={column.filterValueKey}
                        labelKey={column.filterLabelKey}
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="dt-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const rowId = row[rowKey];
              const isSelected = selectedId === rowId;

              return (
                <tr
                  key={rowId}
                  className={isSelected ? 'dt-row-selected' : ''}
                  onClick={() => onRowSelect && onRowSelect(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key}>
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- DataTable.test --watchAll=false`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/shared/DataTable/__tests__/DataTable.test.jsx src/components/shared/DataTable/DataTable.jsx
git commit -m "feat(DataTable): add main DataTable component with TDD"
```

---

## Task 10: Update index.js Exports

**Files:**
- Modify: `src/components/shared/DataTable/index.js`

**Step 1: Update barrel exports**

Update `src/components/shared/DataTable/index.js`:
```javascript
// DataTable shared components
export { default as DataTable } from './DataTable';
export { default as DataTableToolbar } from './DataTableToolbar';
export { default as DataTablePagination } from './DataTablePagination';
export { default as SearchInput } from './SearchInput';
export { default as ExportDropdown } from './ExportDropdown';
export { default as CountDisplay } from './CountDisplay';
export { default as ColumnFilterPopover } from './ColumnFilterPopover';
export { default as PdfViewerPane } from './PdfViewerPane';
```

**Step 2: Run all DataTable tests**

Run: `npm test -- DataTable --watchAll=false`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add src/components/shared/DataTable/index.js
git commit -m "feat(DataTable): update barrel exports"
```

---

## Task 11: Create DrawingsTab Integration Test

**Files:**
- Create: `src/components/Drawings/__tests__/DrawingsTab.test.jsx`

**Step 1: Write the integration test**

Create `src/components/Drawings/__tests__/DrawingsTab.test.jsx`:
```jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DrawingsTab from '../DrawingsTab';
import * as api from '../../../api/Drawings/api';

// Mock the API
jest.mock('../../../api/Drawings/api');

// Mock PdfWrapper
jest.mock('../../PdfWrapper', () => () => <div data-testid="pdf-wrapper" />);

describe('DrawingsTab Integration', () => {
  const mockDrawingNotes = [
    {
      id: 1,
      drawing_file_name: 'Floor Plan.pdf',
      drawing_file_url: 'https://example.com/floor.pdf',
      drawing_file_id: 101,
      category: 'Architectural',
      text: 'Note about floor plan',
      bounding_box: [100, 200, 300, 400],
      page_number: 1,
    },
    {
      id: 2,
      drawing_file_name: 'Electrical.pdf',
      drawing_file_url: 'https://example.com/electrical.pdf',
      drawing_file_id: 102,
      category: 'Electrical',
      text: 'Electrical note',
      bounding_box: [50, 100, 150, 200],
      page_number: 1,
    },
  ];

  const mockApiResponse = {
    data: {
      results: mockDrawingNotes,
      all_filter_vals: {
        category: ['Architectural', 'Electrical'],
        drawing_files: [
          { id: 101, name: 'Floor Plan.pdf' },
          { id: 102, name: 'Electrical.pdf' },
        ],
      },
      total_count: 2,
      processing_status: null,
    },
  };

  const defaultProps = {
    projectId: 1,
    projectVersionId: 1,
    teamId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    api.getDrawingNotes.mockResolvedValue(mockApiResponse);
  });

  describe('Initial Render', () => {
    it('fetches and displays drawing notes', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Floor Plan.pdf')).toBeInTheDocument();
        expect(screen.getByText('Electrical.pdf')).toBeInTheDocument();
      });
    });

    it('displays toolbar with export and upload buttons', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
        expect(screen.getByText(/upload/i)).toBeInTheDocument();
      });
    });

    it('displays count information', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/2 drawing file/i)).toBeInTheDocument();
        expect(screen.getByText(/2 categor/i)).toBeInTheDocument();
      });
    });
  });

  describe('Row Selection', () => {
    it('selects row and shows PDF viewer when clicked', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Floor Plan.pdf')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Floor Plan.pdf'));

      await waitFor(() => {
        expect(screen.getByTestId('pdf-wrapper')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('filters by category when filter is applied', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Category')).toBeInTheDocument();
      });

      // Click filter icon on Category column
      const categoryHeader = screen.getByText('Category').closest('th');
      fireEvent.click(categoryHeader.querySelector('[data-testid="filter-icon"]'));

      // Select a filter option
      fireEvent.click(screen.getByText('Architectural'));

      await waitFor(() => {
        expect(api.getDrawingNotes).toHaveBeenCalledWith(
          1, 1,
          expect.objectContaining({ category: 'Architectural' })
        );
      });
    });
  });

  describe('Sorting', () => {
    it('sorts when column header sort icon is clicked', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Drawing File')).toBeInTheDocument();
      });

      // Click sort icon on Drawing File column
      const drawingFileHeader = screen.getByText('Drawing File').closest('th');
      fireEvent.click(drawingFileHeader.querySelector('[data-testid="sort-icon"]'));

      await waitFor(() => {
        expect(api.getDrawingNotes).toHaveBeenCalledWith(
          1, 1,
          expect.objectContaining({ sortColumn: 'drawing_file_name', sortDirection: 'asc' })
        );
      });
    });
  });

  describe('Search', () => {
    it('searches when search input is used', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText(/search/i), {
        target: { value: 'floor' },
      });

      // Wait for debounce
      await waitFor(() => {
        expect(api.getDrawingNotes).toHaveBeenCalledWith(
          1, 1,
          expect.objectContaining({ search: 'floor' })
        );
      }, { timeout: 500 });
    });
  });

  describe('Pagination', () => {
    it('changes page when pagination is used', async () => {
      api.getDrawingNotes.mockResolvedValue({
        ...mockApiResponse,
        data: {
          ...mockApiResponse.data,
          total_count: 100,
        },
      });

      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Page 2 button
      });

      fireEvent.click(screen.getByText('2'));

      await waitFor(() => {
        expect(api.getDrawingNotes).toHaveBeenCalledWith(
          1, 1,
          expect.objectContaining({ page: 2 })
        );
      });
    });
  });

  describe('Export', () => {
    it('exports to Excel when export option is selected', async () => {
      api.exportDrawingNotesToExcel.mockResolvedValue({
        data: new ArrayBuffer(8),
      });

      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export'));
      fireEvent.click(screen.getByText('Excel'));

      await waitFor(() => {
        expect(api.exportDrawingNotesToExcel).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates between rows using up/down arrows', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Floor Plan.pdf')).toBeInTheDocument();
      });

      // Select first row
      fireEvent.click(screen.getByText('Floor Plan.pdf'));

      await waitFor(() => {
        expect(screen.getByTestId('pdf-nav-down')).toBeInTheDocument();
      });

      // Navigate down
      fireEvent.click(screen.getByTestId('pdf-nav-down'));

      // Should now have second row selected
      await waitFor(() => {
        const selectedRow = screen.getByText('Electrical.pdf').closest('tr');
        expect(selectedRow).toHaveClass('dt-row-selected');
      });
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- DrawingsTab --watchAll=false`
Expected: FAIL - Tests will fail because DrawingsTab hasn't been updated yet

**Step 3: Commit test file**

```bash
git add src/components/Drawings/__tests__/DrawingsTab.test.jsx
git commit -m "test(Drawings): add integration tests for DrawingsTab refactor"
```

---

## Task 12: Update DrawingsTab to Use Shared Components

**Files:**
- Modify: `src/components/Drawings/DrawingsTab.jsx`

**Step 1: Read current DrawingsTab**

Run: Read the file at `src/components/Drawings/DrawingsTab.jsx`

**Step 2: Update DrawingsTab with shared components**

Replace `src/components/Drawings/DrawingsTab.jsx` with the refactored version that uses the shared DataTable components. The key changes:

1. Import shared components from DataTable
2. Add sorting state and handlers
3. Convert filters to column-based filters
4. Add up/down navigation for PDF viewer
5. Update API calls to support sorting and new pagination

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  SearchInput,
  ExportDropdown,
  CountDisplay,
  PdfViewerPane,
} from '../shared/DataTable';
import { getDrawingNotes, exportDrawingNotesToExcel } from '../../api/Drawings/api';
import DrawingsUploadModal from './DrawingsUploadModal';
import DrawingsProcessingIndicator from './DrawingsProcessingIndicator';
import './DrawingsTab.css';

const DrawingsTab = ({ projectId, projectVersionId, teamId }) => {
  // Data state
  const [drawingNotes, setDrawingNotes] = useState([]);
  const [allFilterVals, setAllFilterVals] = useState({
    category: [],
    drawing_files: [],
  });
  const [processingStatus, setProcessingStatus] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Selection state
  const [selectedNote, setSelectedNote] = useState(null);

  // Sorting state
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter state (column-based)
  const [columnFilters, setColumnFilters] = useState({
    drawing_file_id: null,
    category: null,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // PDF viewer state
  const [pdfData, setPdfData] = useState({ url: null });
  const [pdfLoading, setPdfLoading] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Column configuration
  const columns = [
    {
      key: 'drawing_file_name',
      header: 'Drawing File',
      sortable: true,
      filterable: true,
      filterValueKey: 'id',
      filterLabelKey: 'name',
      width: '30%',
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      filterable: true,
      width: '20%',
    },
    {
      key: 'text',
      header: 'Text',
      sortable: true,
      filterable: false,
      width: '50%',
    },
  ];

  // Fetch data
  const fetchDrawingNotes = useCallback(async () => {
    if (!projectId || !projectVersionId) return;

    setIsLoading(true);
    try {
      const response = await getDrawingNotes(projectId, projectVersionId, {
        category: columnFilters.category || undefined,
        drawingFileId: columnFilters.drawing_file_id || undefined,
        search: searchQuery || undefined,
        page,
        limit: rowsPerPage,
        sortColumn: sortColumn || undefined,
        sortDirection: sortColumn ? sortDirection : undefined,
      });

      setDrawingNotes(response?.data?.results || []);
      setAllFilterVals(response?.data?.all_filter_vals || { category: [], drawing_files: [] });
      setTotalCount(response?.data?.total_count ?? response?.data?.count ?? 0);
      setProcessingStatus(response?.data?.processing_status || null);
    } catch (error) {
      console.error('Error fetching drawing notes:', error);
      toast.error('Failed to load drawing notes');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, projectVersionId, columnFilters, searchQuery, page, rowsPerPage, sortColumn, sortDirection]);

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

  // Handlers
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
          scroll_to_x: x1,
          scroll_to_y: y2,
          jump_to_annotation: true,
          page_no: note.page_number,
        },
        docId: note.drawing_file_id,
      });

      // Reset loading after a short delay
      setTimeout(() => setPdfLoading(false), 500);
    }
  };

  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(1);
  };

  const handleFilter = (columnKey, value) => {
    // Map column key to filter key
    const filterKey = columnKey === 'drawing_file_name' ? 'drawing_file_id' : columnKey;
    setColumnFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
    setPage(1);
    setSelectedNote(null);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1);
    setSelectedNote(null);
  };

  const handleClearFilters = () => {
    setColumnFilters({ drawing_file_id: null, category: null });
    setSearchQuery('');
    setPage(1);
    setSelectedNote(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSelectedNote(null);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    setSelectedNote(null);
  };

  const handleExport = async (format) => {
    if (format === 'excel') {
      try {
        const response = await exportDrawingNotesToExcel(projectId, projectVersionId, {
          category: columnFilters.category || undefined,
          drawingFileId: columnFilters.drawing_file_id || undefined,
          search: searchQuery || undefined,
        });

        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'drawing_notes.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
        toast.error('Failed to export drawing notes');
      }
    }
  };

  const handleClosePdf = () => {
    setSelectedNote(null);
    setPdfData({ url: null });
  };

  // Navigation handlers
  const handleNavigateUp = () => {
    if (!selectedNote) return;
    const currentIndex = drawingNotes.findIndex((n) => n.id === selectedNote.id);
    if (currentIndex > 0) {
      handleRowSelect(drawingNotes[currentIndex - 1]);
    }
  };

  const handleNavigateDown = () => {
    if (!selectedNote) return;
    const currentIndex = drawingNotes.findIndex((n) => n.id === selectedNote.id);
    if (currentIndex < drawingNotes.length - 1) {
      handleRowSelect(drawingNotes[currentIndex + 1]);
    }
  };

  const canNavigateUp = selectedNote
    ? drawingNotes.findIndex((n) => n.id === selectedNote.id) > 0
    : false;

  const canNavigateDown = selectedNote
    ? drawingNotes.findIndex((n) => n.id === selectedNote.id) < drawingNotes.length - 1
    : false;

  // Count display data
  const counts = [
    {
      label: 'drawing file',
      labelPlural: 'drawing files',
      count: allFilterVals.drawing_files?.length || 0,
      onClick: () => {
        // Show drawing files modal (implement if needed)
        console.log('Show drawing files');
      },
    },
    {
      label: 'category',
      labelPlural: 'categories',
      count: allFilterVals.category?.length || 0,
      onClick: () => {
        // Show categories modal (implement if needed)
        console.log('Show categories');
      },
    },
  ];

  // Filter options for columns
  const filterOptions = {
    drawing_file_name: allFilterVals.drawing_files || [],
    category: allFilterVals.category || [],
  };

  // Map column filters for DataTable (convert drawing_file_id back to drawing_file_name)
  const tableColumnFilters = {
    drawing_file_name: columnFilters.drawing_file_id,
    category: columnFilters.category,
  };

  const hasActiveFilters =
    columnFilters.drawing_file_id || columnFilters.category || searchQuery;

  const showPdfViewer = selectedNote && pdfData.url;

  return (
    <div className={`drawings-container ${showPdfViewer ? 'side-by-side' : ''}`}>
      <div className="drawings-left-pane">
        {processingStatus?.is_processing && (
          <DrawingsProcessingIndicator status={processingStatus} />
        )}

        <DataTableToolbar
          leftContent={
            <>
              <ExportDropdown
                options={[{ label: 'Excel', value: 'excel' }]}
                onExport={handleExport}
              />
              {hasActiveFilters && (
                <button className="dt-clear-filters-btn" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              )}
              <CountDisplay counts={counts} totalCount={totalCount} totalLabel="notes" />
            </>
          }
          rightContent={
            <>
              <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search drawings..."
                expanded={searchExpanded}
                onExpand={() => setSearchExpanded(true)}
                alwaysExpanded={true}
              />
              <button
                className="dt-upload-btn"
                onClick={() => setUploadModalOpen(true)}
              >
                Upload Drawings
              </button>
            </>
          }
        />

        <DataTable
          columns={columns}
          data={drawingNotes}
          rowKey="id"
          selectedId={selectedNote?.id}
          onRowSelect={handleRowSelect}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          columnFilters={tableColumnFilters}
          filterOptions={filterOptions}
          onFilter={handleFilter}
          isLoading={isLoading}
          emptyMessage="No drawing notes found"
        />

        <DataTablePagination
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>

      {showPdfViewer && (
        <div className="drawings-right-pane">
          <PdfViewerPane
            pdfData={pdfData}
            title={selectedNote.drawing_file_name}
            onClose={handleClosePdf}
            onNavigateUp={handleNavigateUp}
            onNavigateDown={handleNavigateDown}
            canNavigateUp={canNavigateUp}
            canNavigateDown={canNavigateDown}
            isLoading={pdfLoading}
          />
        </div>
      )}

      <DrawingsUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        projectId={projectId}
        projectVersionId={projectVersionId}
        teamId={teamId}
        onUploadComplete={fetchDrawingNotes}
      />
    </div>
  );
};

export default DrawingsTab;
```

**Step 3: Run integration tests**

Run: `npm test -- DrawingsTab --watchAll=false`
Expected: Tests should pass now

**Step 4: Commit**

```bash
git add src/components/Drawings/DrawingsTab.jsx
git commit -m "feat(Drawings): refactor DrawingsTab to use shared DataTable components"
```

---

## Task 13: Update DrawingsTab.css

**Files:**
- Modify: `src/components/Drawings/DrawingsTab.css`

**Step 1: Read current CSS**

Run: Read the file at `src/components/Drawings/DrawingsTab.css`

**Step 2: Update CSS to work with shared components**

Simplify `src/components/Drawings/DrawingsTab.css` since most styling is now in DataTable.css:

```css
/* DrawingsTab - Layout-specific styles */
/* Base table styles are in DataTable.css */

.drawings-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.drawings-container.side-by-side {
  flex-direction: row;
}

.drawings-left-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.drawings-container.side-by-side .drawings-left-pane {
  flex: 0 0 50%;
  max-width: 50%;
  padding-right: 16px;
}

.drawings-right-pane {
  flex: 0 0 50%;
  max-width: 50%;
}

/* Processing indicator spacing */
.drawings-left-pane > .drawings-processing-indicator {
  margin-bottom: 12px;
}
```

**Step 3: Run tests**

Run: `npm test -- DrawingsTab --watchAll=false`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/Drawings/DrawingsTab.css
git commit -m "style(Drawings): simplify CSS to use shared DataTable styles"
```

---

## Task 14: Update API to Support Sorting (if needed)

**Files:**
- Modify: `src/api/Drawings/api.js`

**Step 1: Read current API file**

Run: Read the file at `src/api/Drawings/api.js`

**Step 2: Update API to include sorting parameters**

Ensure the `getDrawingNotes` function accepts and passes sorting parameters:

```javascript
export const getDrawingNotes = async (projectId, projectVersionId, options = {}) => {
  const {
    category,
    drawingFileId,
    search,
    page = 1,
    limit = 25,
    sortColumn,
    sortDirection,
  } = options;

  const params = new URLSearchParams();
  params.append('project_version_id', projectVersionId);

  if (category) params.append('category', category);
  if (drawingFileId) params.append('drawing_file_id', drawingFileId);
  if (search) params.append('search', search);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (sortColumn) params.append('sort_column', sortColumn);
  if (sortDirection) params.append('sort_direction', sortDirection);

  return api.get(`/deliverables/projects/${projectId}/drawing-notes/?${params.toString()}`);
};
```

**Step 3: Run tests**

Run: `npm test -- DrawingsTab --watchAll=false`
Expected: PASS

**Step 4: Commit**

```bash
git add src/api/Drawings/api.js
git commit -m "feat(api): add sorting parameters to getDrawingNotes"
```

---

## Task 15: Manual Testing Checklist

**Step 1: Start development server**

Run: `npm start`

**Step 2: Test each feature manually**

Navigate to the Drawings tab and verify:

- [ ] Table renders with new styling (tighter padding, alternating rows)
- [ ] Export dropdown appears and Excel export works
- [ ] Search input in toolbar works with debounce
- [ ] Clear Filters button appears when filters active
- [ ] Count displays show and are clickable
- [ ] Column header filter icons work
- [ ] Column header sort icons work
- [ ] Row selection highlights row and opens PDF viewer
- [ ] Up/down navigation arrows work in PDF viewer
- [ ] Pagination rows per page selector works
- [ ] Page navigation works
- [ ] Upload button opens upload modal

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(Drawings): complete drawings table refactor with shared DataTable components"
```

---

## Summary

This implementation plan creates 8 shared components in TDD fashion:

1. **SearchInput** - Search input with expand/collapse
2. **ExportDropdown** - Export menu dropdown
3. **CountDisplay** - Clickable count badges
4. **ColumnFilterPopover** - Column filter dropdown
5. **DataTablePagination** - Pagination with rows per page
6. **DataTableToolbar** - Toolbar container
7. **PdfViewerPane** - PDF viewer with navigation
8. **DataTable** - Main table component

The DrawingsTab is then refactored to use these components, providing UI consistency with the submittal table without touching the submittal code.
