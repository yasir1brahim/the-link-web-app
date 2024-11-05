import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

const DateSelector = ({ ...props }) => {
  const [focused, setFocused] = useState(false);

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
