import React, { useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

const SelectDropdown = ({ ...props }) => {
  // const [selected, setSelected] = useState([]);
  const [focused, setFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  return (
    <div
      className={`has-typehead ${focused ? 'is-focused' : ''} ${
        searchValue.length === 0 ? 'empty' : ''
      }`}
    >
      <Typeahead
        id="basic-example"
        onChange={(e) => {
          props.setSelected(e);
          if (props.onChange) {
            // @ts-ignore
            props.onChange(e[0]);
          }
          if (searchValue === '') setSearchValue(e[0]);
        }}
        labelKey={props.labelKey}
        onFocus={(e) => (focused === e ? '' : setFocused(e))}
        onBlur={(e) => (focused !== e ? '' : setFocused(e))}
        onInputChange={(e) => setSearchValue(e)}
        options={props.options}
        placeholder="Choose a option..."
        selected={props.selected}
        multiple={props.multiple}
        defaultInputValue={props.defaultInputValue}
      />
      <label className="text-label">{props.label}</label>
      <i className="has-icon icon-dropdown"></i>
    </div>
  );
};

export default SelectDropdown;
