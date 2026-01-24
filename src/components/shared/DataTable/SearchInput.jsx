import React from 'react';
import { ReactComponent as SearchIcon } from '../../../assets/images/search-icon.svg';
import { ReactComponent as CloseIcon } from '../../../assets/images/close-x.svg';
import './DataTable.css';

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  expanded = true,
  onExpand,
  alwaysExpanded = false,
}) => {
  const isExpanded = alwaysExpanded || expanded;

  if (!isExpanded) {
    return (
      <div
        className="dt-search-collapsed"
        data-testid="search-expand"
        onClick={onExpand}
      >
        <SearchIcon />
      </div>
    );
  }

  return (
    <div className="dt-search">
      <span className="dt-search-icon">
        <SearchIcon />
      </span>
      <input
        type="text"
        className="dt-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <span
          className="dt-search-clear"
          data-testid="search-clear"
          onClick={() => onChange('')}
        >
          <CloseIcon />
        </span>
      )}
    </div>
  );
};

export default SearchInput;
