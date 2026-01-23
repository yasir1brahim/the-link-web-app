import React from 'react';
import './ExportButton.css';

/**
 * Export Button Component
 * Triggers the PDF export modal
 * Styled to match the SortableTable export button
 */
const ExportButton = ({ onClick, disabled = false }) => {
  return (
    <button
      className="export-button"
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      Export PDF
    </button>
  );
};

export default ExportButton;
