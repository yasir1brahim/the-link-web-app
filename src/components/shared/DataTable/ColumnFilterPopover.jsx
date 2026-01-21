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
