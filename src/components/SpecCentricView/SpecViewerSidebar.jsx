import React from 'react';
import SpecSectionNavigation from './SpecSectionNavigation';
import './SpecViewerSidebar.css';

const SpecViewerSidebar = ({
  specSections,
  selectedSection,
  onSectionChange,
  highlightsEnabled,
  onHighlightsToggle,
  loading
}) => {
  return (
    <div className="spec-viewer-sidebar">
      <div className="sidebar-header">
        <h3>Spec Sections</h3>
        <p className="sidebar-subtitle">
          {specSections ? specSections.length : 0} sections available
        </p>
      </div>

      <div className="sidebar-controls">
        <div className="control-group">
          <label className="control-label">
            <input
              type="checkbox"
              checked={highlightsEnabled}
              onChange={(e) => onHighlightsToggle(e.target.checked)}
              className="control-checkbox"
            />
            <span className="control-text">Show Submittal Highlights</span>
          </label>
          <p className="control-description">
            Toggle highlighting of submittal items within the spec document
          </p>
        </div>
      </div>

      <div className="sidebar-sections">
        <SpecSectionNavigation
          sections={specSections}
          selectedSection={selectedSection}
          onSectionChange={onSectionChange}
          loading={loading}
          compact={true}
        />
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-info">
          <p className="info-text">
            <strong>Selected:</strong> {selectedSection ? selectedSection.masterformat_number : 'None'}
          </p>
          {selectedSection && (
            <p className="info-text">
              <strong>Document:</strong> {selectedSection.document_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecViewerSidebar;
