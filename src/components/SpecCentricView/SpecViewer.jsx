import React, { useState, useEffect } from 'react';
import { getSpecCentricData, getSpecSectionContent } from '../../api/SpecCentricView/api';
import SpecViewerSidebar from './SpecViewerSidebar';
import SpecSectionNavigation from './SpecSectionNavigation';
import SubmittalHighlights from './SubmittalHighlights';
import './SpecViewer.css';

const SpecViewer = ({ projectId, projectVersionId, teamId }) => {
  const [specData, setSpecData] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionContent, setSectionContent] = useState(null);
  const [highlightsEnabled, setHighlightsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial spec data
  useEffect(() => {
    const loadSpecData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSpecCentricData(projectId, projectVersionId);
        setSpecData(response.data);
        
        // Select first section by default
        if (response.data.spec_sections && response.data.spec_sections.length > 0) {
          setSelectedSection(response.data.spec_sections[0]);
        }
      } catch (err) {
        console.error('Error loading spec data:', err);
        setError('Failed to load spec data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadSpecData();
    }
  }, [projectId, projectVersionId]);

  // Load section content when section changes
  useEffect(() => {
    const loadSectionContent = async () => {
      if (selectedSection) {
        try {
          setLoading(true);
          const response = await getSpecSectionContent(
            projectId, 
            selectedSection.id, 
            projectVersionId
          );
          setSectionContent(response.data);
        } catch (err) {
          console.error('Error loading section content:', err);
          setError('Failed to load section content. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    loadSectionContent();
  }, [selectedSection, projectId, projectVersionId]);

  const handleSectionChange = (section) => {
    setSelectedSection(section);
  };

  const handleHighlightsToggle = (enabled) => {
    setHighlightsEnabled(enabled);
  };

  if (loading && !specData) {
    return (
      <div className="spec-viewer-loading">
        <div className="loading-spinner"></div>
        <p>Loading spec data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="spec-viewer-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!specData || !specData.spec_sections || specData.spec_sections.length === 0) {
    return (
      <div className="spec-viewer-empty">
        <h3>No Spec Sections Found</h3>
        <p>No spec sections are available for this project.</p>
      </div>
    );
  }

  return (
    <div className="spec-viewer-container">
      <div className="spec-viewer-sidebar">
        <SpecViewerSidebar
          specSections={specData.spec_sections}
          selectedSection={selectedSection}
          onSectionChange={handleSectionChange}
          highlightsEnabled={highlightsEnabled}
          onHighlightsToggle={handleHighlightsToggle}
          loading={loading}
        />
      </div>
      
      <div className="spec-viewer-main">
        <div className="spec-viewer-header">
          <SpecSectionNavigation
            sections={specData.spec_sections}
            selectedSection={selectedSection}
            onSectionChange={handleSectionChange}
          />
        </div>
        
        <div className="spec-viewer-content">
          {selectedSection && sectionContent ? (
            <div className="spec-document-container">
              <div className="spec-document-header">
                <h2>{selectedSection.custom_section_title || selectedSection.masterformat_title}</h2>
                <p className="spec-section-info">
                  {selectedSection.masterformat_number} - {selectedSection.document_name}
                </p>
              </div>
              
              <div className="spec-document-content">
                <div className="spec-document-viewer">
                  {/* Placeholder for actual document viewer */}
                  <div className="document-placeholder">
                    <p>Document viewer will be implemented here</p>
                    <p>This will show the actual spec document with highlights</p>
                  </div>
                </div>
                
                {highlightsEnabled && sectionContent.submittal_highlights && (
                  <SubmittalHighlights
                    highlights={sectionContent.submittal_highlights}
                    onHighlightClick={(highlight) => {
                      console.log('Highlight clicked:', highlight);
                      // Handle highlight interaction
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="spec-viewer-placeholder">
              <p>Select a spec section to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecViewer;
