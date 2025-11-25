import React, { useState, useEffect, useCallback } from 'react';
import { getSpecCentricData, getSpecSectionContent, getCustomItemTypes } from '../../api/SpecCentricView/api';
import SpecViewerSidebar from './SpecViewerSidebar';
import DocumentHighlighter from './DocumentHighlighter';
import HighlightTooltip from './HighlightTooltip';
import HighlightLegend from './HighlightLegend';
import ExportButton from './ExportButton';
import ExportModal from './ExportModal';
import { processHighlightsForSection, exportSections, downloadExportResults } from '../../services/pdfExportService';
import { DEFAULT_FILTER_KEYS } from './highlightConstants';
import './SpecViewer.css';

const SpecViewer = ({ projectId, projectVersionId, teamId }) => {
  const [specData, setSpecData] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionContent, setSectionContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, highlight: null, position: { x: 0, y: 0 } });
  // Initialize with all filter types to prevent empty filters from hiding annotations on mount
  const [activeFilters, setActiveFilters] = useState(new Set(DEFAULT_FILTER_KEYS));
  const [customItemTypes, setCustomItemTypes] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);

  const refreshCustomTypes = useCallback(async () => {
    if (!projectId) {
      return;
    }

    try {
      const response = await getCustomItemTypes(projectId);
      setCustomItemTypes(response.data.results || []);
    } catch (err) {
      console.warn('Unable to load custom item types', err);
    }
  }, [projectId]);

  // Load initial spec data
  useEffect(() => {
    const loadSpecData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSpecCentricData(projectId, projectVersionId);
        setSpecData(response.data);

        if (projectId) {
          try {
            const customTypesResponse = await getCustomItemTypes(projectId);
            setCustomItemTypes(customTypesResponse.data.results || []);
          } catch (err) {
            console.warn('Unable to load custom item types', err);
          }
        }

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
  const refreshSectionContent = useCallback(async () => {
    if (!selectedSection) {
      return;
    }

    try {
      setLoading(true);
      const response = await getSpecSectionContent(
        projectId,
        selectedSection.id,
        projectVersionId
      );
      console.log('[NOTE_DEBUG] Section content loaded:', response.data);
      console.log('[NOTE_DEBUG] AI log highlights count:', response.data?.ai_log_highlights?.length || 0);
      if (response.data?.ai_log_highlights) {
        response.data.ai_log_highlights.forEach(item => {
          console.log('[NOTE_DEBUG] Item:', item.id, 'notes:', item.notes?.length || 0, 'notes data:', item.notes);
        });
      }
      setSectionContent(response.data);
    } catch (err) {
      console.error('Error loading section content:', err);
      setError('Failed to load section content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [projectId, projectVersionId, selectedSection]);

  useEffect(() => {
    refreshSectionContent();
  }, [refreshSectionContent]);

  const handleSectionChange = useCallback((section) => {
    setSelectedSection(section);
    setSectionContent(null);
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

  const handleExport = useCallback(async (sectionsToExport) => {
    try {
      setExportProgress({
        status: 'exporting',
        total: sectionsToExport.length,
        message: 'Preparing export...'
      });

      // Build highlights map for selected sections
      const highlightsBySectionId = {};
      for (const section of sectionsToExport) {
        try {
          // Fetch section content for highlights
          const response = await getSpecSectionContent(projectId, section.id, projectVersionId);
          const highlights = processHighlightsForSection(
            response.data,
            activeFilters,
            customItemTypes
          );
          highlightsBySectionId[section.id] = highlights;
        } catch (error) {
          console.error(`Failed to load highlights for section ${section.id}:`, error);
          highlightsBySectionId[section.id] = [];
        }
      }

      // Progress callback
      const progressCallback = (progress) => {
        setExportProgress((prev) => ({
          ...prev,
          ...progress,
        }));
      };

      // Export sections
      const results = await exportSections({
        sections: sectionsToExport,
        highlightsBySectionId,
        activeFilters,
        customItemTypes,
        progressCallback,
        currentSectionId: selectedSection?.id,
        currentViewerContext: null, // Could pass WebViewer instance if available
      });

      // Check for errors
      const hasErrors = results.some((result) => result.error);
      if (hasErrors) {
        const errorCount = results.filter((result) => result.error).length;
        const successCount = results.length - errorCount;
        setExportProgress({
          status: 'complete',
          message: `Export completed with ${errorCount} error(s). ${successCount} section(s) exported successfully.`,
        });
      } else {
        setExportProgress({
          status: 'complete',
          message: 'Export complete!',
        });
      }

      // Download results
      await downloadExportResults(results);

      // Auto-close modal after successful download
      setTimeout(() => {
        setShowExportModal(false);
        setExportProgress(null);
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress({
        status: 'error',
        message: error.message || 'Export failed. Please try again.',
      });
    }
  }, [projectId, projectVersionId, activeFilters, customItemTypes, selectedSection]);

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
          loading={loading}
        />
      </div>
      
      <div className="spec-viewer-main">
        <div className="spec-viewer-content">
          {selectedSection && sectionContent ? (
            <div className="spec-document-container">
              <div className="spec-document-header">
                <div className="spec-document-header-content">
                  <div>
                    <h2>{selectedSection.custom_section_title || selectedSection.masterformat_title}</h2>
                    <p className="spec-section-info">
                      {selectedSection.masterformat_number} - {selectedSection.document_name}
                    </p>
                  </div>
                  <ExportButton onClick={() => setShowExportModal(true)} />
                </div>
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
                    projectId={projectId}
                    projectVersionId={projectVersionId}
                    specSection={selectedSection}
                    onRefreshSectionContent={refreshSectionContent}
                    customItemTypes={customItemTypes}
                    onCustomTypesUpdate={refreshCustomTypes}
                  />
                  {/* Highlight Color Legend - positioned inside viewer area */}
                  <HighlightLegend
                    submittalHighlights={sectionContent.submittal_highlights || []}
                    aiLogHighlights={sectionContent.ai_log_highlights || []}
                    onFilterChange={handleFilterChange}
                    customItemTypes={customItemTypes}
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

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => {
          setShowExportModal(false);
          setExportProgress(null);
        }}
        sections={specData?.spec_sections || []}
        onExport={handleExport}
        exportProgress={exportProgress}
      />
    </div>
  );
};

export default SpecViewer;
