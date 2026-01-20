import React from 'react';
import './DataTable.css';

const DataTableToolbar = ({
  leftContent,
  rightContent,
  children,
  className = '',
}) => {
  return (
    <div className={`dt-toolbar ${className}`.trim()}>
      <div className="dt-toolbar-left">
        {leftContent || children}
      </div>
      <div className="dt-toolbar-right">
        {rightContent}
      </div>
    </div>
  );
};

export default DataTableToolbar;
