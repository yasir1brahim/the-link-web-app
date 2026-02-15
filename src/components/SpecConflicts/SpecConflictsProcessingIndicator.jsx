import React from 'react';
import './SpecConflictsProcessingIndicator.css';

const SpecConflictsProcessingIndicator = ({ comparison }) => {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="spec-conflicts-processing">
      <div className="spec-conflicts-processing-spinner" />
      <div className="spec-conflicts-processing-text">
        <strong>Comparison in progress...</strong>
        {comparison?.triggered_by && (
          <span>
            Started by {comparison.triggered_by.display_name} at {formatTime(comparison.started_at)}
          </span>
        )}
      </div>
    </div>
  );
};

export default SpecConflictsProcessingIndicator;
