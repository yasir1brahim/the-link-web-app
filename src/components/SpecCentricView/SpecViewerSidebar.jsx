import React from 'react';
import SpecSectionNavigation from './SpecSectionNavigation';
import './SpecViewerSidebar.css';

const SpecViewerSidebar = ({
  specSections,
  selectedSection,
  onSectionChange,
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

      <div className="sidebar-sections">
        <SpecSectionNavigation
          sections={specSections}
          selectedSection={selectedSection}
          onSectionChange={onSectionChange}
          loading={loading}
          compact={false}
        />
      </div>

    </div>
  );
};

export default SpecViewerSidebar;
