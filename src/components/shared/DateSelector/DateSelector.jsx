import React from 'react';
import DatePicker from 'react-datepicker';
import { useSmartDateInput, useDateKeyboardHandler, useDateFocus } from '../../../hooks/useDateInput';

const DateSelector = ({ preventManualInput = false, smartInput = false, allowManualInput = true, ...props }) => {

  const { focused, handleFocus, handleBlur } = useDateFocus();
  const { 
    inputValue, 
    handleDatePickerChange,
    handleInputChange,
    handleInputBlur
  } = useSmartDateInput(props.selected, props.onChange, smartInput, allowManualInput);

  const handleKeyDown = useDateKeyboardHandler(preventManualInput, smartInput, allowManualInput);
  const handleBlurWithParsing = (e) => {
    handleBlur(e);
    handleInputBlur();
  };

  return (
    <div
      className={`has-calendar ${focused ? 'is-focused' : ''} ${
        props.selected === null ? 'empty' : ''
      }`}
    >
      <DatePicker
        selectsRange={props.selectsRange}
        startDate={props.startDate}
        endDate={props.endDate}
        selected={props.selected}
        onChange={handleDatePickerChange}
        isClearable={props.isClearable}
        onFocus={handleFocus}
        onBlur={handleBlurWithParsing}
        onKeyDown={handleKeyDown}
        onChangeRaw={handleInputChange}
        placeholderText={props.placeholderText}
        minDate={props.minDate}
        dateFormat={props.dateFormat}
        readOnly={preventManualInput}
      />
      <label className="text-label">{props.labelText}</label>
      <i className="has-icon icon-calendar"></i>
    </div>
  );
};

export default DateSelector;
