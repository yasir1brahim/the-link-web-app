import React, { useState, useRef, useEffect } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

const SelectDropdown = ({ ...props }) => {
  const [focused, setFocused] = useState(false);
  const typeaheadRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      typeaheadRef.current
    ) {
      setFocused(false);
      const element = document.getElementById(typeaheadRef.current.props.id);
      if (element) {
        element.style.display = 'none';
      }
    }
  };

  useEffect(() => {
    if (focused) {
    document.addEventListener("mousedown", handleClickOutside);
    const element = document.getElementById(typeaheadRef.current.props.id);
    if (element) {
      element.style.display = 'block';
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      setFocused(false);
    };
    }
  }, [focused]);

  return (
    <div
      ref={dropdownRef}
      className={`has-typehead ${focused ? "is-focused" : ""} ${
        props.searchValue?.length === 0 ? "empty" : ""
      }`}
    >
      <Typeahead
        id={`select-dropdown${props.label.replace(/\s+/g, '')}`}
        ref={typeaheadRef}
        onChange={(e) => {
          props.setSelected(e);
          if (props.onChange) {
            props.onChange(e[0]);
          }
        }}
        labelKey={props.labelKey}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onInputChange={(e) => {
          props.setSelected({});
          props.setSearchValue && props.setSearchValue(e);
        }}
        options={props.options}
        placeholder="Choose an option..."
        selected={props.selected}
        multiple={props.multiple}
        defaultSelected={props.defaultSelected}
        defaultInputValue={props.defaultInputValue}
      />
      <label className="text-label">{props.label}</label>
      <i className="has-icon icon-dropdown"></i>
    </div>
  );
};

export default SelectDropdown;
