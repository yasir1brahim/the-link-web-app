import React, { useState } from 'react';
import './SubmittalHighlights.css';

const SubmittalHighlights = ({ highlights, onHighlightClick }) => {
  const [expandedHighlight, setExpandedHighlight] = useState(null);

  if (!highlights || highlights.length === 0) {
    return (
      <div className="submittal-highlights">
        <div className="highlights-empty">
          <p>No submittal highlights found for this section</p>
        </div>
      </div>
    );
  }

  const handleHighlightClick = (highlight) => {
    if (onHighlightClick) {
      onHighlightClick(highlight);
    }
  };

  const handleHighlightExpand = (highlightId) => {
    setExpandedHighlight(expandedHighlight === highlightId ? null : highlightId);
  };

  return (
    <div className="submittal-highlights">
      <div className="highlights-header">
        <h4>Submittal Highlights</h4>
        <p className="highlights-count">{highlights.length} items found</p>
      </div>

      <div className="highlights-list">
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            className={`highlight-item ${
              expandedHighlight === highlight.id ? 'expanded' : ''
            }`}
          >
            <div
              className="highlight-summary"
              onClick={() => handleHighlightExpand(highlight.id)}
            >
              <div className="highlight-info">
                <span className="highlight-paragraph">
                  {highlight.paragraph_number}
                </span>
                <span className="highlight-method">
                  {highlight.parsing_method}
                </span>
              </div>
              <div className="highlight-actions">
                <button
                  className="highlight-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHighlightClick(highlight);
                  }}
                  title="View in document"
                >
                  📍
                </button>
                <button
                  className="highlight-expand-btn"
                  onClick={() => handleHighlightExpand(highlight.id)}
                >
                  {expandedHighlight === highlight.id ? '▼' : '▶'}
                </button>
              </div>
            </div>

            {expandedHighlight === highlight.id && (
              <div className="highlight-details">
                <div className="highlight-detail-row">
                  <strong>Hierarchical Paragraph:</strong>
                  <span>{highlight.heirarchical_paragraph_number}</span>
                </div>

                <div className="highlight-actions-detail">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleHighlightClick(highlight)}
                  >
                    View in Document
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmittalHighlights;
