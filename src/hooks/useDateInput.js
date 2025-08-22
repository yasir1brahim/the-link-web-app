import { useState, useEffect } from 'react';

/**
 * Custom hook for managing smart date input validation and formatting
 * @param {Date} selectedDate - The currently selected date
 * @param {Function} onChange - Callback function when date changes
 * @param {boolean} smartInput - Whether to enable smart input features
 * @returns {Object} 
 */
export const useSmartDateInput = (selectedDate, onChange, smartInput = false) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (selectedDate && smartInput) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setInputValue(formattedDate);
    } else if (!selectedDate && smartInput) {
      setInputValue('');
    }
  }, [selectedDate, smartInput]);

  const isValidCompleteDate = (dateString) => {
    // Check if it matches YYYY-MM-DD format and is a valid date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    
    const date = new Date(dateString + 'T00:00:00');
    return date instanceof Date && !isNaN(date.getTime()) && 
           date.toISOString().split('T')[0] === dateString;
  };

  const handleInputChange = (value) => {
    if (!smartInput) return;

    let formattedValue = value;
    
    // Auto-format as user types
    if (value.length === 4 && !value.includes('-')) {
      formattedValue = value + '-';
    } else if (value.length === 7 && value.split('-').length === 2) {
      formattedValue = value + '-';
    }

    setInputValue(formattedValue);

    // If it's a complete valid date, update the DatePicker
    if (isValidCompleteDate(formattedValue)) {
      const date = new Date(formattedValue + 'T00:00:00');
      onChange(date);
    }
  };

  const handleDatePickerChange = (date) => {
    onChange(date);
    if (smartInput && date) {
      const formattedDate = date.toISOString().split('T')[0];
      setInputValue(formattedDate);
    }
  };

  return {
    inputValue,
    setInputValue,
    isValidCompleteDate,
    handleInputChange,
    handleDatePickerChange
  };
};

/**
 * Custom hook for handling keyboard input validation
 * @param {boolean} preventManualInput - Whether to prevent all manual input
 * @param {boolean} smartInput - Whether to enable smart input validation
 * @param {Function} isValidCompleteDate - Function to check if date is complete and valid
 * @returns {Function} Key down handler function
 */
export const useDateKeyboardHandler = (preventManualInput, smartInput, isValidCompleteDate) => {
  const handleKeyDown = (e) => {
    // Handle preventManualInput mode
    if (preventManualInput) {
      if (!['Tab', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }
      return;
    }

    // Handle smartInput mode
    if (smartInput) {
      const currentValue = e.target.value;
      
      // If we already have a complete valid date, prevent further input
      if (isValidCompleteDate(currentValue) && 
          !['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        return;
      }

      // Allow navigation keys
      if (['Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'].includes(e.key)) {
        return;
      }

      // Allow numbers and dash
      if (/[0-9-]/.test(e.key)) {
        // Prevent more than 10 characters (YYYY-MM-DD)
        if (currentValue.length >= 10) {
          e.preventDefault();
          return;
        }

        // Auto-add dashes at correct positions
        const newValue = currentValue + e.key;
        if ((newValue.length === 4 || newValue.length === 7) && e.key !== '-') {
          // Don't auto-add dash if they're typing a dash
          return;
        }
      } else {
        // Block all other characters (alphabets, special characters)
        e.preventDefault();
      }
    }
  };

  return handleKeyDown;
};

/**
 * Custom hook for managing focus state
 * @returns {Object} Focus state and handlers
 */
export const useDateFocus = () => {
  const [focused, setFocused] = useState(false);

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);

  return {
    focused,
    handleFocus,
    handleBlur
  };
}; 