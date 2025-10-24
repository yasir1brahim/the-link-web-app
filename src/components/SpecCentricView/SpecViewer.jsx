import React, { useState, useEffect } from 'react';
import { getSpecCentricData, getSpecSectionContent } from '../../api/SpecCentricView/api';
import SpecViewerSidebar from './SpecViewerSidebar';
import SubmittalHighlights from './SubmittalHighlights';
import DocumentHighlighter from './DocumentHighlighter';
import HighlightTooltip from './HighlightTooltip';
import HighlightLegend from './HighlightLegend';
import './SpecViewer.css';

const SpecViewer = ({ projectId, projectVersionId, teamId }) => {
  const [specData, setSpecData] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionContent, setSectionContent] = useState(null);
  const [highlightsEnabled, setHighlightsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, highlight: null, position: { x: 0, y: 0 } });
  const [activeFilters, setActiveFilters] = useState(new Set());

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
    console.log('Selected section:', section);
    console.log('PDF URL:', section?.pdf_url);
    console.log('PDF URL type:', typeof section?.pdf_url);
    setSelectedSection(section);
  };

  const handleHighlightsToggle = (enabled) => {
    setHighlightsEnabled(enabled);
  };

  const handleHighlightClick = (highlight) => {
    setTooltip({
      visible: true,
      highlight: highlight,
      position: { x: 100, y: 100 } // This would be calculated from mouse position
    });
  };

  const handleTooltipClose = () => {
    setTooltip({ visible: false, highlight: null, position: { x: 0, y: 0 } });
  };

  const handleViewDetails = (highlight) => {
    console.log('Viewing details for highlight:', highlight);
    // This could open a detailed modal or navigate to a details page
  };

  const handleFilterChange = (newFilters) => {
    console.log('[SPEC_VIEWER_DEBUG] Active filters changed:', newFilters);
    setActiveFilters(newFilters);
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
                  <DocumentHighlighter
                    highlights={sectionContent.submittal_highlights || []}
                    aiLogHighlights={sectionContent.ai_log_highlights || []}
                    highlightsEnabled={highlightsEnabled}
                    onHighlightClick={handleHighlightClick}
                    documentUrl={selectedSection?.pdf_url}
                    documentId={selectedSection?.document_id}
                    activeFilters={activeFilters}
                    projectId= {projectId}
                    projectVersionId={projectVersionId}
                    specSectionId = {selectedSection.id}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="spec-viewer-placeholder">
              <p>Select a spec section to view its content</p>
            </div>
          )}
        </div>
      </div>

      {/* Highlight Tooltip */}
      <HighlightTooltip
        highlight={tooltip.highlight}
        isVisible={tooltip.visible}
        position={tooltip.position}
        onClose={handleTooltipClose}
        onViewDetails={handleViewDetails}
      />
      
      {/* Highlight Color Legend */}
      {highlightsEnabled && selectedSection && sectionContent && (
        <HighlightLegend 
          submittalHighlights={sectionContent.submittal_highlights || []}
          aiLogHighlights={sectionContent.ai_log_highlights || []}
          onFilterChange={handleFilterChange}
        />
      )}
    </div>
  );
};

export default SpecViewer;
