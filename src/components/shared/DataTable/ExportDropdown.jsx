import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { ReactComponent as DownloadIcon } from '../../../assets/images/file-download.svg';
import './DataTable.css';

const ExportDropdown = ({
  options = [],
  onExport,
  buttonLabel = 'Export',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (value) => {
    onExport(value);
    setIsOpen(false);
  };

  return (
    <Dropdown isOpen={isOpen} toggle={toggle}>
      <DropdownToggle
        caret
        className="dt-export-btn"
        disabled={disabled}
      >
        <DownloadIcon style={{ width: 16, height: 16 }} />
        {buttonLabel}
      </DropdownToggle>
      <DropdownMenu
        style={{
          minWidth: '120px',
          backgroundColor: 'white',
        }}
      >
        {options.map((option) => (
          <DropdownItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'white',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0eaf7')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            {option.icon && (
              <span style={{ marginRight: 8 }}>{option.icon}</span>
            )}
            {option.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default ExportDropdown;
