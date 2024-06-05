import React from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

const SelectDropDownV2 = ({ ...props }) => {
  return (
    <div style={{ marginTop: "20px" }}>
      <Typeahead
        labelKey={(option) => `${option.name}`}
        id="select-dropdown-v2"
        options={props.options}
        onChange={props.onChange}
        placeholder={"Choose an option..."}
        defaultInputValue={props.defaultInputValue}
      />

      <label className="text-label">{props.label}</label>
      <i className="has-icon icon-dropdown"></i>
    </div>
  );
};

export default SelectDropDownV2;
