import { useState, useEffect } from 'react';

/**
 * Custom hook for managing date input display and calendar selection
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

  const handleDatePickerChange = (date) => {
    onChange(date);
    if (smartInput && date) {
      const formattedDate = date.toISOString().split('T')[0];
      setInputValue(formattedDate);
    }
  };

  return {
    inputValue,
    handleDatePickerChange
  };
};

/**
 * Custom hook for handling keyboard input validation
 * @param {boolean} preventManualInput - Whether to prevent all manual input
 * @param {boolean} smartInput - Whether to enable smart input validation
 * @returns {Function} Key down handler function
 */
export const useDateKeyboardHandler = (preventManualInput, smartInput) => {
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
      const currentValue = e.target?.value || '';
      
      // Allow navigation keys always
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