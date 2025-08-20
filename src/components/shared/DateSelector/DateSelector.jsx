import React from 'react';
import DatePicker from 'react-datepicker';
import { useSmartDateInput, useDateKeyboardHandler, useDateFocus } from '../../../hooks/useDateInput';

const DateSelector = ({ preventManualInput = false, smartInput = false, ...props }) => {

  const { focused, handleFocus, handleBlur } = useDateFocus();
  
  const { 
    inputValue, 
    isValidCompleteDate, 
    handleInputChange, 
    handleDatePickerChange 
  } = useSmartDateInput(props.selected, props.onChange, smartInput);
  
  const handleKeyDown = useDateKeyboardHandler(preventManualInput, smartInput, isValidCompleteDate);

  return (
    <div
      className={`has-calendar ${focused ? 'is-focused' : ''} ${
        props.selected === null ? 'empty' : ''
      }`}
    >
      {/* @ts-ignore */}
      <DatePicker
        selectsRange={props.selectsRange}
        startDate={props.startDate}
        endDate={props.endDate}
        selected={props.selected}
        onChange={handleDatePickerChange}
        isClearable={props.isClearable}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onChangeRaw={(e) => smartInput && handleInputChange(e.target.value)}
        placeholderText={props.placeholderText}
        minDate={props.minDate}
        dateFormat={props.dateFormat}
        value={smartInput ? inputValue : undefined}
      />
      <label className="text-label">{props.labelText}</label>
      <i className="has-icon icon-calendar"></i>
    </div>
  );
};

export default DateSelector;
