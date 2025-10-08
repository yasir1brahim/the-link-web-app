import React, { useState, useEffect, useRef } from 'react';
import './HighlightTooltip.css';

const HighlightTooltip = ({ 
  highlight, 
  isVisible, 
  position, 
  onClose,
  onViewDetails 
}) => {
  const tooltipRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState(position);

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      // Adjust horizontal position if tooltip would go off screen
      if (newX + rect.width > viewportWidth - 20) {
        newX = viewportWidth - rect.width - 20;
      }
      if (newX < 20) {
        newX = 20;
      }

      // Adjust vertical position if tooltip would go off screen
      if (newY + rect.height > viewportHeight - 20) {
        newY = position.y - rect.height - 10;
      }
      if (newY < 20) {
        newY = 20;
      }

      setTooltipPosition({ x: newX, y: newY });
    }
  }, [isVisible, position]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible || !highlight) {
    return null;
  }

  return (
    <div
      ref={tooltipRef}
      className="highlight-tooltip"
      style={{
        position: 'fixed',
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        zIndex: 1000
      }}
    >
      <div className="tooltip-header">
        <div className="tooltip-title">
          <span className="paragraph-number">{highlight.paragraph_number}</span>
          <span className="parsing-method">{highlight.parsing_method}</span>
        </div>
        <button 
          className="tooltip-close"
          onClick={onClose}
          aria-label="Close tooltip"
        >
          ×
        </button>
      </div>

      <div className="tooltip-content">
        <div className="tooltip-section">
          <strong>Hierarchical Paragraph:</strong>
          <span>{highlight.heirarchical_paragraph_number}</span>
        </div>

        {highlight.text_location && (
          <div className="tooltip-section">
            <strong>Location:</strong>
            <span>
              Page {highlight.text_location.page || 'N/A'}
              {highlight.text_location.x && highlight.text_location.y && (
                <span> at ({highlight.text_location.x}, {highlight.text_location.y})</span>
              )}
            </span>
          </div>
        )}

        {highlight.additional_text_locations && highlight.additional_text_locations.length > 0 && (
          <div className="tooltip-section">
            <strong>Additional Locations:</strong>
            <span>{highlight.additional_text_locations.length} found</span>
          </div>
        )}

        <div className="tooltip-section">
          <strong>Parsing Version:</strong>
          <span>{highlight.parsing_version}</span>
        </div>
      </div>

      <div className="tooltip-actions">
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            onViewDetails(highlight);
            onClose();
          }}
        >
          View Details
        </button>
        <button
          className="btn btn-sm btn-secondary"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="tooltip-arrow"></div>
    </div>
  );
};

export default HighlightTooltip;
