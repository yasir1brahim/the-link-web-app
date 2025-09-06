import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './FilterModal.scss';

/**
 * FilterModal - A reusable modal component for filtering table data
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback to close the modal
 * @param {string} columnName - Name of the column being filtered
 * @param {Array} availableValues - Array of available values for the column
 * @param {Array} selectedValues - Array of currently selected filter values
 * @param {Function} onApply - Callback when filter is applied
 */
const FilterModal = ({
  isOpen,
  onClose,
  columnName,
  availableValues = [],
  selectedValues = [],
  onApply
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [localSelectedValues, setLocalSelectedValues] = useState([...selectedValues]);

  // Reset local state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalSelectedValues([...selectedValues]);
      setSearchValue('');
    }
  }, [isOpen, selectedValues]);

  const handleToggleValue = (value) => {
    if (localSelectedValues.includes(value)) {
      setLocalSelectedValues(localSelectedValues.filter(v => v !== value));
    } else {
      setLocalSelectedValues([...localSelectedValues, value]);
    }
  };

  const handleClear = () => {
    setLocalSelectedValues([]);
  };

  const handleApply = () => {
    onApply(columnName, localSelectedValues);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedValues([...selectedValues]);
    setSearchValue('');
    onClose();
  };

  // Filter available values based on search
  const filteredValues = availableValues.filter(value =>
    value?.toString().toLowerCase().includes(searchValue.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="filter-modal-overlay" onClick={handleCancel}>
      <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h5>Filter By {columnName}</h5>
          <button className="filter-modal-close" onClick={handleCancel}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L13 13M13 1L1 13" stroke="#6c757d" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className="filter-modal-body">
          {/* Search input */}
          <div className="filter-search-container">
            <input
              type="text"
              className="filter-search-input"
              placeholder={`Search ${columnName} values...`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="filter-actions">
            <span className="filter-clear-link" onClick={handleClear}>
              Clear All
            </span>
            <span className="filter-selected-count">
              {localSelectedValues.length} selected
            </span>
          </div>

          {/* Values list */}
          <div className="filter-values-list">
            {filteredValues.length > 0 ? (
              filteredValues.map((value, index) => (
                <div key={index} className="filter-value-item">
                  <label className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={localSelectedValues.includes(value)}
                      onChange={() => handleToggleValue(value)}
                    />
                    <span className="filter-checkbox-custom"></span>
                    <span className="filter-value-text">{value}</span>
                  </label>
                </div>
              ))
            ) : (
              <div className="filter-no-values">
                {searchValue ? 'No matching values found' : 'No values available'}
              </div>
            )}
          </div>
        </div>

        <div className="filter-modal-footer">
          <button className="filter-btn filter-btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button className="filter-btn filter-btn-primary" onClick={handleApply}>
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

FilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  columnName: PropTypes.string.isRequired,
  availableValues: PropTypes.array.isRequired,
  selectedValues: PropTypes.array.isRequired,
  onApply: PropTypes.func.isRequired,
};

export default FilterModal;
