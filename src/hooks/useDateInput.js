import { useState, useEffect } from 'react';

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date 
 * @returns {string} 
 */
const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Custom hook for parsing manual date input
 * @param {string} inputValue 
 * @returns {Date|null} 
 */
const parseManualDateInput = (inputValue) => {
  if (!inputValue || inputValue.trim() === '') {
    return null;
  }
  const trimmedValue = inputValue.trim();
  if (/^\d{8}$/.test(trimmedValue)) {
    const year = parseInt(trimmedValue.substring(0, 4));
    const month = parseInt(trimmedValue.substring(4, 6)) - 1; 
    const day = parseInt(trimmedValue.substring(6, 8));
  
    const date = new Date(year, month, day);     
    if (date.getFullYear() === year && 
        date.getMonth() === month && 
        date.getDate() === day) {
      return date;
    }
  }
  
  if (/^\d{4}\s+\d{1,2}\s+\d{1,2}$/.test(trimmedValue)) {
    const parts = trimmedValue.split(/\s+/);
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; 
    const day = parseInt(parts[2]);   
    const date = new Date(year, month, day);   
    if (date.getFullYear() === year && 
        date.getMonth() === month && 
        date.getDate() === day) {
      return date;
    }
  } 
  const dateFormats = [
    
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
    
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
    
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
  ];

  for (const format of dateFormats) {
    const match = trimmedValue.match(format);
    if (match) {
      let year, month, day;
      
      if (format.source.includes('^\\d{4}')) {       
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1; 
        day = parseInt(match[3]);
      } else {       
        const firstNum = parseInt(match[1]);
        const secondNum = parseInt(match[2]);
        year = parseInt(match[3]);       
        if (firstNum > 12 && secondNum <= 12) {         
          day = firstNum;
          month = secondNum - 1;
        } else if (secondNum > 12 && firstNum <= 12) {      
          month = firstNum - 1;
          day = secondNum;
        } else {          
          month = firstNum - 1;
          day = secondNum;
        }
      }   
      const date = new Date(year, month, day);       
      if (date.getFullYear() === year && 
          date.getMonth() === month && 
          date.getDate() === day) {
        return date;
      }
    }
  }
  return null;
};

/**
 * Custom hook for managing date input display and calendar selection
 * @param {Date} selectedDate 
 * @param {Function} onChange 
 * @param {boolean} smartInput 
 * @param {boolean} allowManualInput 
 * @returns {Object} 
 */
export const useSmartDateInput = (selectedDate, onChange, smartInput = false, allowManualInput = false) => {
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastCalendarDate, setLastCalendarDate] = useState(null);

  useEffect(() => {
    if (selectedDate && (smartInput || allowManualInput)) {
      const formattedDate = formatDateToYYYYMMDD(selectedDate);
      setInputValue(formattedDate);
      setLastCalendarDate(selectedDate);
    }
  }, []);
  useEffect(() => {
    if (selectedDate && (smartInput || allowManualInput)) {
      const formattedDate = formatDateToYYYYMMDD(selectedDate);
      
      if (selectedDate.getTime() !== lastCalendarDate?.getTime()) {
        setInputValue(formattedDate);
        setLastCalendarDate(selectedDate);
        setIsEditing(false);
      } else if (!isEditing && inputValue !== formattedDate) {
        setInputValue(formattedDate);
      } else {
      }
    }
  }, [selectedDate, smartInput, allowManualInput, isEditing, lastCalendarDate, inputValue]);

  const handleDatePickerChange = (date) => {
    onChange(date);
    if ((smartInput || allowManualInput) && date) {
      const formattedDate = formatDateToYYYYMMDD(date);
      setInputValue(formattedDate);
      setLastCalendarDate(date);
      setIsEditing(false);
    } else if (!date) {
      setInputValue('');
      setLastCalendarDate(null);
      setIsEditing(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target?.value || '';
    
    if (!isEditing) {
      setIsEditing(true);
    }
    if (allowManualInput || smartInput) {
      const digitsOnly = value.replace(/\D/g, '');
      
      if (digitsOnly.length === 8) {
        const formattedValue = digitsOnly.substring(0, 4) + '-' + digitsOnly.substring(4, 6) + '-' + digitsOnly.substring(6, 8);
        e.target.value = formattedValue;
        
        const parsedDate = parseManualDateInput(formattedValue);
        if (parsedDate) {
          onChange(parsedDate);
          setIsEditing(false);
        }
      } else if (digitsOnly.length <= 4) {
      } else if (digitsOnly.length <= 6) {
      } else {
      }
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    
    if (allowManualInput || smartInput) {
      const parsedDate = parseManualDateInput(inputValue);
      if (parsedDate) {
        const formattedDate = formatDateToYYYYMMDD(parsedDate);
        setInputValue(formattedDate);
        onChange(parsedDate);
      } else if (inputValue.trim() !== '') {
        const digitsOnly = inputValue.replace(/\D/g, '');
        
        if (digitsOnly.length >= 4) {
          let year = parseInt(digitsOnly.substring(0, 4));
          let month = 1;
          let day = 1;
          
          if (digitsOnly.length >= 6) {
            month = parseInt(digitsOnly.substring(4, 6));
            if (month < 1 || month > 12) month = 1;
          }
          
          if (digitsOnly.length >= 8) {
            day = parseInt(digitsOnly.substring(6, 8));
            if (day < 1 || day > 31) day = 1;
          }
          
          const date = new Date(year, month - 1, day);
          if (date.getFullYear() === year && 
              date.getMonth() === month - 1 && 
              date.getDate() === day) {
            const formattedDate = formatDateToYYYYMMDD(date);
            setInputValue(formattedDate);
            onChange(date);
          } else {
            setInputValue(inputValue);
          }
        } else {
          setInputValue(inputValue);
        }
      }
    }
  };
  return {
    inputValue,
    handleDatePickerChange,
    handleInputChange,
    handleInputBlur
  };
};

/**
 * Custom hook for handling keyboard input validation
 * @param {boolean} preventManualInput 
 * @param {boolean} smartInput 
 * @param {boolean} allowManualInput 
 * @returns {Function} 
 */
export const useDateKeyboardHandler = (preventManualInput, smartInput, allowManualInput = false) => {
  const handleKeyDown = (e) => {
    
    if (preventManualInput) {
      if (!['Tab', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }
      return;
    }

    if (allowManualInput) {
      const currentValue = e.target?.value || '';
      
      if (['Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'].includes(e.key)) {
        return;
      }
      if (/[0-9-]/.test(e.key)) {
        if (currentValue.length >= 10) {
          e.preventDefault();
          return;
        }
      } else {
        e.preventDefault();
      }
      return;
    }

    if (smartInput) {
      const currentValue = e.target?.value || '';
      
      if (['Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'].includes(e.key)) {
        return;
      }

      if (/[0-9-]/.test(e.key)) {
        if (currentValue.length >= 10) {
          e.preventDefault();
          return;
        }
      } else {
        e.preventDefault();
      }
    }
  };
  return handleKeyDown;
};

/**
 * Custom hook for managing focus state
 * @returns {Object} 
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