import React, { Fragment, useState, useRef, useEffect, useLayoutEffect } from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ColumnFilterPopover } from '../shared/DataTable';
import ExpandedConflictRow from './ExpandedConflictRow';
import './SpecConflictsTable.css';

const SpecConflictsTable = ({
  conflicts,
  expandedRowId,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  columnFilters,
  filterOptions,
  onFilter,
  isLoading,
}) => {
  // Filter popover state (matches DataTable pattern)
  const [openFilter, setOpenFilter] = useState(null);
  const filterRef = useRef(null);

  // Overlay positioning — keeps ExpandedConflictRow in a stable DOM position
  // while visually appearing inline with the expanded table row.
  const containerRef = useRef(null);
  const spacerRef = useRef(null);
  const [overlayPos, setOverlayPos] = useState(null);

  const selectedConflict = expandedRowId
    ? conflicts.find((c) => c.id === expandedRowId)
    : null;

  // Close filter on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Position the persistent viewer overlay to cover the spacer row
  useLayoutEffect(() => {
    if (!spacerRef.current || !containerRef.current) {
      setOverlayPos(null);
      return;
    }

    const recalc = () => {
      const spacer = spacerRef.current;
      const container = containerRef.current;
      if (!spacer || !container) return;

      const spacerRect = spacer.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setOverlayPos({
        top: spacerRect.top - containerRect.top + container.scrollTop,
        left: spacerRect.left - containerRect.left + container.scrollLeft,
        width: spacerRect.width,
        height: spacerRect.height,
      });
    };

    recalc();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(recalc);
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    }
  }, [expandedRowId, conflicts]);

  const handleFilterClick = (e, columnKey) => {
    e.stopPropagation(); // Prevent sort from triggering
    setOpenFilter(openFilter === columnKey ? null : columnKey);
  };

  const handleFilterSelect = (columnKey, value) => {
    onFilter(columnKey, value);
    setOpenFilter(null);
  };

  const columns = [
    {
      key: 'sheet_number',
      header: 'Drawing #',
      sortable: true,
      filterable: true,
      width: '15%',
      render: (conflict) => (
        <span>
          {conflict.sheet_number || 'Unknown'}
          {conflict.sheet_title && <span className="sheet-title"> - {conflict.sheet_title}</span>}
        </span>
      ),
    },
    {
      key: 'note_text',
      header: 'Drawing Content',
      sortable: true,
      filterable: false,
      width: '22%',
      render: (conflict) => (
        <div className="text-cell">{conflict.note_text}</div>
      ),
    },
    {
      key: 'spec_text',
      header: 'Related Spec Content',
      sortable: true,
      filterable: false,
      width: '22%',
      render: (conflict) => (
        <div className="text-cell">{conflict.spec_text}</div>
      ),
    },
    {
      key: 'spec_masterformat_number',
      header: 'Spec Section',
      sortable: true,
      filterable: true,
      width: '12%',
      render: (conflict) => conflict.spec_masterformat_number || '—',
    },
    {
      key: 'conflict',
      header: 'Conflict?',
      sortable: false,
      filterable: false,
      width: '8%',
      render: () => (
        <WarningAmberIcon className="conflict-icon" titleAccess="Potential conflict" />
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      sortable: true,
      filterable: true,
      width: '21%',
      render: (conflict) => (
        <div className="text-cell">{conflict.reason}</div>
      ),
    },
  ];

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      onSort(columnKey, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(columnKey, 'asc');
    }
  };

  const renderSortIcon = (columnKey) => {
    if (sortColumn !== columnKey) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (isLoading) {
    return (
      <div className="spec-conflicts-table-loading">
        Loading conflicts...
      </div>
    );
  }

  if (conflicts.length === 0) {
    return null; // Empty state handled by parent
  }

  return (
    <div className="spec-conflicts-table-container" ref={containerRef} style={{ position: 'relative' }}>
      <table className="spec-conflicts-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}></th>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={col.sortable ? 'sortable' : ''}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <div className="th-content">
                  <span>{col.header} {renderSortIcon(col.key)}</span>
                  {col.filterable && filterOptions[col.key] && (
                    <span style={{ position: 'relative' }}>
                      <FilterListIcon
                        className={`filter-icon ${columnFilters[col.key] ? 'active' : ''}`}
                        onClick={(e) => handleFilterClick(e, col.key)}
                      />
                      {openFilter === col.key && (
                        <div ref={filterRef} style={{ position: 'absolute', zIndex: 1000 }}>
                          <ColumnFilterPopover
                            options={filterOptions[col.key]}
                            selectedValue={columnFilters[col.key] || null}
                            onChange={(value) => handleFilterSelect(col.key, value)}
                            onClose={() => setOpenFilter(null)}
                          />
                        </div>
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {conflicts.map((conflict) => (
            <Fragment key={conflict.id}>
              <tr
                className={expandedRowId === conflict.id ? 'expanded' : ''}
                onClick={() => onRowClick(conflict.id)}
              >
                <td className="expand-cell">
                  {expandedRowId === conflict.id ? (
                    <KeyboardArrowUpIcon />
                  ) : (
                    <KeyboardArrowDownIcon />
                  )}
                </td>
                {columns.map((col) => (
                  <td key={col.key}>{col.render(conflict)}</td>
                ))}
              </tr>
              {expandedRowId === conflict.id && (
                <tr className="expanded-row">
                  <td colSpan={columns.length + 1} ref={spacerRef}>
                    {/* Height spacer — the real viewer lives in the overlay below */}
                    <div style={{ height: 500 }} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>

      {/* Persistent viewer overlay — stays mounted across conflict switches so
          WebViewer instances aren't destroyed/recreated when the file hasn't changed. */}
      {selectedConflict && overlayPos && (
        <div
          style={{
            position: 'absolute',
            top: overlayPos.top,
            left: overlayPos.left,
            width: overlayPos.width,
            height: overlayPos.height,
            zIndex: 1,
          }}
        >
          <ExpandedConflictRow conflict={selectedConflict} />
        </div>
      )}
    </div>
  );
};

export default SpecConflictsTable;
