import React, { useState, useRef, useEffect } from 'react';
import ColumnFilterPopover from './ColumnFilterPopover';
import Loader from '../Loader/Loader';
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
