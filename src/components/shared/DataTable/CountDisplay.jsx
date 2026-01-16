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
            className={`dt-count-item ${item.onClick ? 'clickable' : ''}`}
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
