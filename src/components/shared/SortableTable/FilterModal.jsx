import React, { useState } from 'react';
import ReactDOM from 'react-dom';
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
 * @param {Function} formatLabel - Optional function to format display labels
 */
const FilterModal = ({
  isOpen,
  onClose,
  columnName,
  availableValues = [],
  selectedValues = [],
  onApply,
  formatLabel = null
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [localSelectedValues, setLocalSelectedValues] = useState([...selectedValues]);

  // Reset local state when modal opens and handle body scroll
  React.useEffect(() => {
    if (isOpen) {
      setLocalSelectedValues([...selectedValues]);
      setSearchValue('');
      
      // Prevent body scrolling when modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, selectedValues]);

  const handleToggleValue = (value, event) => {
    // Prevent any default behavior that might cause scrolling
    event?.preventDefault();
    event?.stopPropagation();
    
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

  // Helper function to get display label for a value
  const getDisplayLabel = (value) => {
    return formatLabel ? formatLabel(value) : value;
  };

  // Filter available values based on search (search both original value and formatted label)
  const filteredValues = availableValues.filter(value => {
    const originalValue = value?.toString().toLowerCase();
    const formattedValue = getDisplayLabel(value)?.toString().toLowerCase();
    const searchTerm = searchValue.toLowerCase();
    
    return originalValue.includes(searchTerm) || formattedValue.includes(searchTerm);
  });

  if (!isOpen) return null;

  // Create portal to render modal outside component tree
  return ReactDOM.createPortal(
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
                  <label 
                    className="filter-checkbox-label"
                    onClick={(e) => handleToggleValue(value, e)}
                  >
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={localSelectedValues.includes(value)}
                      onChange={(e) => handleToggleValue(value, e)}
                      tabIndex={-1} // Remove from tab order since we handle click on label
                    />
                    <span className="filter-checkbox-custom"></span>
                    <span className="filter-value-text">{getDisplayLabel(value)}</span>
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
    </div>,
    document.body // Portal target - renders directly to body
  );
};

FilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  columnName: PropTypes.string.isRequired,
  availableValues: PropTypes.array.isRequired,
  selectedValues: PropTypes.array.isRequired,
  onApply: PropTypes.func.isRequired,
  formatLabel: PropTypes.func,
};

export default FilterModal;
