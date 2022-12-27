import React, { useState } from 'react';
import { Hint, Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

const SelectDropDownV2 = ({ ...props }) => {

  return (
    <div
    >
      <Typeahead
      labelKey={option => `${option.name}`}
        id="basic-example-v2"
        options={props.options}
        onChange={props.onChange}
        placeholder="Choose an option..."
      />

      <label className="text-label">{props.label}</label>
      <i className="has-icon icon-dropdown"></i>
    </div>
  );
};

export default SelectDropDownV2;
