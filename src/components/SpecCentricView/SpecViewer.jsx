import { useState, useEffect, useCallback } from 'react';
import { getSpecCentricData, getSpecSectionContent } from '../../api/SpecCentricView/api';
import { toast } from 'react-toastify';
import SpecViewerSidebar from './SpecViewerSidebar';
import DocumentHighlighter from './DocumentHighlighter';
import HighlightTooltip from './HighlightTooltip';
import HighlightLegend from './HighlightLegend';
import { DEFAULT_FILTER_KEYS } from './highlightConstants';
import './SpecViewer.css';

const SpecViewer = ({ projectId, projectVersionId, onNavigateToDocuments }) => {
  const [specData, setSpecData] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionContent, setSectionContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, highlight: null, position: { x: 0, y: 0 } });
  // Initialize with all filter types to prevent empty filters from hiding annotations on mount
  const [activeFilters, setActiveFilters] = useState(new Set(DEFAULT_FILTER_KEYS));

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

  const handleSectionChange = useCallback((section) => {
    setSelectedSection(section);
  }, []);

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

  const handleFilterChange = useCallback((newFilters) => {
    setActiveFilters(newFilters);
  }, []);

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
        <div className="empty-state-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3>No Spec Sections Found</h3>
        <p className="empty-state-description">
          This project's documents were processed before spec sections were available.
          To view the spec-centric view, you'll need to reprocess the documents.
        </p>
        <div className="empty-state-actions">
          <p className="empty-state-instructions">
            <strong>How to fix this:</strong>
          </p>
          <ol className="empty-state-steps">
            <li>Go to the <strong>Documents</strong> tab</li>
            <li>Select the spec documents you want to view</li>
            <li>Click the <strong>Reprocess</strong> button</li>
            <li>Return here once processing is complete</li>  
          </ol>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (onNavigateToDocuments) {
                onNavigateToDocuments();
              } else {
                toast.info('Please go to the Documents tab to reprocess your spec documents.');
              }
            }}
          >
            Go to Documents Tab
          </button>
        </div>
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
                    onHighlightClick={handleHighlightClick}
                    documentUrl={selectedSection?.pdf_url}
                    documentId={selectedSection?.document_id}
                    activeFilters={activeFilters}
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
      {selectedSection && sectionContent && (
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
