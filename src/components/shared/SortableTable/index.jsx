import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SortIcon } from '../icons/sortIcon';
import { FilterIcon } from '../icons/filterIcon';
import FilterModal from './FilterModal';
import './SortableTable.scss';
import './FilterModal.scss';

/**
 * SortableTable - A reusable table component with sorting, filtering, search, and pagination capabilities
 * 
 * @param {Array} data - Array of data objects to display
 * @param {Array} columns - Array of column definitions
 * @param {Function} onSort - Callback function for sorting
 * @param {Object} sorting - Current sorting state { column: string, order: 'asc'|'desc' }
 * @param {Function} onFilter - Callback function for filtering
 * @param {Object} filterValues - Current filter values
 * @param {Function} onPageChange - Callback function for pagination
 * @param {Object} pagination - Pagination state { currentPage: number, pageSize: number, totalItems: number, totalPages: number }
 * @param {Function} onSearch - Callback function for search
 * @param {string} searchValue - Current search value
 * @param {boolean} enableSearch - Enable/disable search functionality
 * @param {string} searchPlaceholder - Placeholder text for search input
 * @param {boolean} enableExpansion - Enable/disable text expansion functionality
 * @param {string} className - Additional CSS classes
 * @param {Object} props - Additional props
 */
const SortableTable = ({
  data,
  columns,
  onSort,
  sorting = { column: '', order: 'desc' },
  onFilter,
  filterValues = {},
  onPageChange,
  pagination = null,
  onSearch,
  searchValue = '',
  enableSearch = false,
  searchPlaceholder = 'Search...',
  availableFilterValues = {}, // New prop for filter values from backend
  enableExpansion = true, // New prop to control expansion functionality
  className = '',
  ...props
}) => {
  const [filterModal, setFilterModal] = useState(false);
  const [filterColumn, setFilterColumn] = useState('');
  const [tableWidths, setTableWidths] = useState({});
  const [showMore, setShowMore] = useState([]);
  const [shouldShowExpansionButton, setShouldShowExpansionButton] = useState([]);
  
  const tableRef = useRef(null);
  const parentRef = useRef(null);
  const rowRefs = useRef([]);

  // Initialize showMore state when data changes (only if expansion is enabled)
  useEffect(() => {
    if (enableExpansion) {
      setShowMore(Array(data.length).fill(false));
      rowRefs.current = Array(data.length).fill(null);
    }
  }, [data, enableExpansion]);


  // Check for text overflow and show expansion buttons (only if expansion is enabled)
  useEffect(() => {
    if (!enableExpansion) return;
    
    const hasClamping = (el) => {
      if (!el) return false;
      const { clientHeight, scrollHeight } = el;
      return clientHeight !== scrollHeight;
    };

    const checkButtonAvailability = () => {
      setTimeout(() => {
        const newShowExpansionButton = rowRefs.current.map((ref) =>
          ref ? hasClamping(ref) : false
        );
        setShouldShowExpansionButton(newShowExpansionButton);
      }, 0);
    };

    checkButtonAvailability();
    window.addEventListener('resize', checkButtonAvailability);

    return () => {
      window.removeEventListener('resize', checkButtonAvailability);
    };
  }, [data, enableExpansion]);

  // Use fixed column widths to prevent layout shifts
  useEffect(() => {
    if (columns.length > 0) {
      const fixedWidths = {};
      columns.forEach((col, index) => {
        // Use minWidth as fixed width to prevent any changes
        fixedWidths[index] = col.minWidth || 150;
      });
      setTableWidths(fixedWidths);
    }
  }, [columns]);

  // Disable column resizing to prevent layout shifts
  const handleMouseDown = (e, colIndex) => {
    // Disabled to prevent layout shifts
    return;
  };

  // Handle sorting
  const handleSorting = (columnName) => {
    if (!onSort) {
      return;
    }
    
    let sortingOrder = sorting.column === columnName ? sorting.order : "desc";
    const newOrder = sortingOrder === "desc" ? "asc" : "desc";
    
    onSort(columnName, newOrder);
  };

  // Handle filtering
  const handleFilterClick = (columnName) => {
    if (!onFilter) return;
    
    setFilterColumn(columnName);
    setFilterModal(true);
  };

  // Handle filter apply
  const handleFilterApply = (columnName, selectedValues) => {
    if (onFilter) {
      onFilter(columnName, selectedValues);
    }
  };

  // Handle filter modal close
  const handleFilterModalClose = () => {
    setFilterModal(false);
    setFilterColumn('');
  };

  // Handle search
  const handleSearchChange = (event) => {
    const value = event.target.value;
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch(searchValue);
    }
  };

  const handleClearSearch = () => {
    if (onSearch) {
      onSearch('');
    }
  };

  // Format cell value based on column configuration
  const formatCellValue = (value, column, row) => {
    if (column.format) {
      return column.format(value, row);
    }
    return value;
  };

  // Render table header
  const renderTableHeader = () => {
    return (
    <thead>
      <tr>
        {columns.map((column, index) => {
          return (
          <th
            key={column.key}
            className={`small-font ${column.className || ''}`}
            style={{ width: `${tableWidths[index]}px` }}
          >
            <div className="d-flex">
                      <span>{column.label}</span>
            {column.sortable && (
              <span
                style={{ cursor: "pointer", marginLeft: "6px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSorting(column.key);
                }}
              >
                <SortIcon />
              </span>
            )}
            {column.filterable && (
              <span
                style={{ cursor: "pointer", marginLeft: "6px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterClick(column.key);
                }}
              >
                <FilterIcon 
                  isActive={filterValues[column.key] && filterValues[column.key].length > 0}
                />
              </span>
            )}
              {column.resizable !== false && (
                <div
                  className="resizer"
                  onMouseDown={(e) => handleMouseDown(e, index)}
                >
                  |
                </div>
              )}
            </div>
          </th>
          );
        })}
      </tr>
    </thead>
    );
  };

  // Render table body
  const renderTableBody = () => (
    <tbody style={{ fontSize: "12px" }}>
      {data.map((row, rowIndex) => (
        <tr
          key={rowIndex}
          className={row.className || ''}
          style={row.style || {}}
        >
          {columns.map((column, colIndex) => (
            <td
              key={`${rowIndex}-${column.key}`}
              className={`reduce-height ${column.cellClassName || ''}`}
              style={column.cellStyle || {}}
            >
              {column.render ? (
                column.render(row[column.key], row, rowIndex)
              ) : (
                <div
                  className={enableExpansion && column.expandable ? 'log-desc' : ''}
                  style={{ 
                    whiteSpace: 'pre-wrap', // Always allow text wrapping
                    overflow: 'visible', // Always show full content
                    textOverflow: 'clip' // No ellipsis
                  }}
                  ref={enableExpansion && column.expandable ? (element) => (rowRefs.current[rowIndex] = element) : null}
                >
                  {formatCellValue(row[column.key], column, row)}
                  {enableExpansion && column.expandable && shouldShowExpansionButton[rowIndex] && (
                    <span
                      className='showmore-wrap'
                      onClick={() =>
                        setShowMore((prev) =>
                          prev.map((val, i) => (i === rowIndex ? !val : val))
                        )
                      }
                    >
                      {showMore[rowIndex] ? '▼' : '▶'}
                    </span>
                  )}
                </div>
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  return (
    <div
      className={`sortable-table-wrapper l-table-wrapper ${className}`}
      style={{
        maxHeight: "calc(100vh - 240px)",
      }}
      ref={parentRef}
      {...props}
    >
      {/* Search Bar */}
      {enableSearch && (
        <div className="table-search-bar">
          <div className="search-input-container">
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="search-input"
              value={searchValue}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
            />
            <div className="search-icons">
              <span className="search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="6" stroke="#6c757d" strokeWidth="1.5" />
                  <path d="M19 19L16 16" stroke="#6c757d" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              {searchValue && (
                <span className="clear-search-icon" onClick={handleClearSearch}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5 5L15 15"
                      stroke="#6c757d"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 5L5 15"
                      stroke="#6c757d"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <table className="table logs-table" ref={tableRef}>
        {renderTableHeader()}
        {renderTableBody()}
      </table>
      
      {/* Pagination controls */}
      {pagination && onPageChange && (
        <div className="pagination-controls">
          <div className="pagination-info">
            Showing {((pagination.current_page - 1) * pagination.page_size) + 1} to {Math.min(pagination.current_page * pagination.page_size, pagination.total_items)} of {pagination.total_items} items
          </div>
          <div className="pagination-buttons">
            <button
              className="pagination-btn"
              disabled={!pagination.has_previous}
              onClick={() => onPageChange(pagination.previous_page)}
            >
              Previous
            </button>
            <span className="pagination-page-info">
              Page {pagination.current_page} of {pagination.total_pages}
            </span>
            <button
              className="pagination-btn"
              disabled={!pagination.has_next}
              onClick={() => onPageChange(pagination.next_page)}
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Filter Modal */}
      <FilterModal
        isOpen={filterModal}
        onClose={handleFilterModalClose}
        columnName={filterColumn}
        availableValues={availableFilterValues[filterColumn] || []}
        selectedValues={filterValues[filterColumn] || []}
        onApply={handleFilterApply}
      />
    </div>
  );
};

SortableTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      filterable: PropTypes.bool,
      resizable: PropTypes.bool,
      width: PropTypes.number, // percentage
      minWidth: PropTypes.number,
      className: PropTypes.string,
      cellClassName: PropTypes.string,
      cellStyle: PropTypes.object,
      expandable: PropTypes.bool,
      format: PropTypes.func,
      render: PropTypes.func,
    })
  ).isRequired,
  onSort: PropTypes.func,
  sorting: PropTypes.shape({
    column: PropTypes.string,
    order: PropTypes.oneOf(['asc', 'desc']),
  }),
  onFilter: PropTypes.func,
  filterValues: PropTypes.object,
  onPageChange: PropTypes.func,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number,
    pageSize: PropTypes.number,
    totalItems: PropTypes.number,
    totalPages: PropTypes.number,
    hasNext: PropTypes.bool,
    hasPrevious: PropTypes.bool,
    nextPage: PropTypes.number,
    previousPage: PropTypes.number,
  }),
  onSearch: PropTypes.func,
  searchValue: PropTypes.string,
  enableSearch: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  availableFilterValues: PropTypes.object,
  enableExpansion: PropTypes.bool,
  className: PropTypes.string,
};

export default SortableTable;
