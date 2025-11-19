import React from 'react';
import './ExportButton.css';

/**
 * Export Button Component
 * Triggers the PDF export modal
 */
const ExportButton = ({ onClick, disabled = false }) => {
  return (
    <button
      className="export-button btn btn-primary btn-sm"
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      Export PDF
    </button>
  );
};

export default ExportButton;
