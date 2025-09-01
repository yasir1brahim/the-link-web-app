import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SortIcon } from '../icons/sortIcon';
import { FilterIcon } from '../icons/filterIcon';
import './SortableTable.scss';

/**
 * SortableTable - A reusable table component with sorting and filtering capabilities
 * 
 * @param {Array} data - Array of data objects to display
 * @param {Array} columns - Array of column definitions
 * @param {Function} onSort - Callback function for sorting
 * @param {Object} sorting - Current sorting state { column: string, order: 'asc'|'desc' }
 * @param {Function} onFilter - Callback function for filtering
 * @param {Object} filterValues - Current filter values
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

  // Initialize showMore state when data changes
  useEffect(() => {
    setShowMore(Array(data.length).fill(false));
    rowRefs.current = Array(data.length).fill(null);
  }, [data]);

  // Check for text overflow and show expansion buttons
  useEffect(() => {
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
  }, [data]);

  // Calculate table column widths
  useEffect(() => {
    if (parentRef.current && columns.length > 0) {
      const parentWidth = parentRef.current.offsetWidth;
      const minWidths = columns.reduce((acc, col, index) => {
        acc[index] = col.minWidth || 100;
        return acc;
      }, {});

      const newWidths = {};
      columns.forEach((col, index) => {
        const percentage = col.width || (100 / columns.length);
        newWidths[index] = Math.max(
          Math.round(parentWidth * (percentage / 100)),
          minWidths[index]
        );
      });

      setTableWidths(newWidths);
    }
  }, [parentRef.current, columns]);

  // Handle column resizing
  const handleMouseDown = (e, colIndex) => {
    const startX = e.clientX;
    const startWidth = tableRef.current.querySelectorAll("th")[colIndex].offsetWidth;
    const minWidth = columns[colIndex]?.minWidth || 100;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(
        startWidth + (e.clientX - startX),
        minWidth
      );
      tableRef.current.querySelectorAll("th")[colIndex].style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle sorting
  const handleSorting = (columnName) => {
    console.log('🔍 SortableTable: handleSorting called with columnName:', columnName);
    if (!onSort) {
      console.log('🔍 SortableTable: onSort function is not provided');
      return;
    }
    
    let sortingOrder = sorting.column === columnName ? sorting.order : "desc";
    const newOrder = sortingOrder === "desc" ? "asc" : "desc";
    
    console.log('🔍 SortableTable: Calling onSort with:', { columnName, newOrder });
    onSort(columnName, newOrder);
  };

  // Handle filtering
  const handleFilterClick = (columnName) => {
    if (!onFilter) return;
    
    setFilterColumn(columnName);
    setFilterModal(true);
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
    console.log('🔍 SortableTable: Rendering headers with columns:', columns.map(col => ({ key: col.key, label: col.label })));
    
    return (
    <thead>
      <tr>
        {columns.map((column, index) => {
          console.log('🔍 SortableTable: Rendering header for column:', { key: column.key, label: column.label, index });
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
            console.log('🔍 SortableTable: Sort icon clicked for column:', column.key);
            e.stopPropagation();
            handleSorting(column.key);
          }}
        >
                  <SortIcon />
                </span>
              )}
              {column.filterable && (
                <span
                  className="ml-1"
                  onClick={() => handleFilterClick(column.key)}
                >
                  <FilterIcon
                    isActive={
                      filterValues[column.key]?.length > 0 ? true : false
                    }
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
                  className={`${column.expandable ? 'log-desc' : ''} ${
                    showMore[rowIndex] ? 'show-content' : 'text-overflow'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                  ref={column.expandable ? (element) => (rowRefs.current[rowIndex] = element) : null}
                >
                  {formatCellValue(row[column.key], column, row)}
                  {column.expandable && shouldShowExpansionButton[rowIndex] && (
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
      className={`l-table-wrapper ${className}`}
      style={{
        maxHeight: "calc(100vh - 240px)",
      }}
      ref={parentRef}
      {...props}
    >
      <table className="table logs-table" ref={tableRef}>
        {renderTableHeader()}
        {renderTableBody()}
      </table>
      
      {/* Filter modal would be rendered here if needed */}
      {filterModal && onFilter && (
        <div className="filter-modal">
          {/* Filter modal implementation would go here */}
          <button onClick={() => setFilterModal(false)}>Close</button>
        </div>
      )}
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
  className: PropTypes.string,
};

export default SortableTable;
