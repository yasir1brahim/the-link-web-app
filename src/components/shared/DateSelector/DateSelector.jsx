import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

const DateSelector = ({ preventManualInput = false, ...props }) => {
  const [focused, setFocused] = useState(false);

  const handleKeyDown = (e) => {
    if (preventManualInput) {
      if (!['Tab', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }
    }
  };

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
        onChange={(e) => props.onChange(e)}
        isClearable={props.isClearable}
        onFocus={(e) => (focused === true ? '' : setFocused(true))}
        onBlur={(e) => (focused === false ? '' : setFocused(false))}
        onKeyDown={handleKeyDown}
        placeholderText={props.placeholderText}
        minDate={props.minDate}
        dateFormat={props.dateFormat}
      />
      <label className="text-label">{props.labelText}</label>
      <i className="has-icon icon-calendar"></i>
    </div>
  );
};

export default DateSelector;
