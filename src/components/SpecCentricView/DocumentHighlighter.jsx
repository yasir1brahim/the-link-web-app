import React, { useState, useEffect } from 'react';
import ProjectLogsReader from '../PdfReader/projectLogsReader';
import './DocumentHighlighter.css';

const DocumentHighlighter = ({ 
  highlights = [], 
  aiLogHighlights = [],
  highlightsEnabled = true, 
  onHighlightClick,
  documentUrl = null,
  documentId = null,
  activeFilters = new Set()
}) => {

  // ensure highlight locations are in the correct format
  const mapHighlightLocations = (highlights) => {
    const highlightLocations = [];
    for (const highlight of highlights) {
      console.log('[SPEC_VIEWER_DEBUG] Mapping highlight locations:', highlight);

      if (!highlight.text_location) {
        continue;
      }
      
      const { page_no, x, y, width, height } = highlight.text_location;
      highlightLocations.push({
        page_no: page_no,
        x: x,
        y: y,
        width: width,
        height: height
      });

      for (const additionalHighlight of highlight.additional_text_locations) {
        highlightLocations.push({
          page_no: additionalHighlight.page_no,
          x: additionalHighlight.x,
          y: additionalHighlight.y,
          width: additionalHighlight.width,
          height: additionalHighlight.height
        });
      }
    }
    return highlightLocations;
  };

  // Map AI log highlights to location format with type information
  const mapAiLogHighlightLocations = (aiLogHighlights) => {
    const highlightLocations = [];
    for (const logItem of aiLogHighlights) {
      console.log('[SPEC_VIEWER_DEBUG] Mapping AI log highlight locations:', logItem);

      if (!logItem.pdf_locations || !Array.isArray(logItem.pdf_locations)) {
        continue;
      }
      
      // Add all pdf_locations for this log item with type information
      for (const location of logItem.pdf_locations) {
        highlightLocations.push({
          page_no: location.page_no,
          x: location.x,
          y: location.y,
          width: location.width,
          height: location.height,
          // Include type information for color coding
          extraction_type: logItem.extraction_type, // e.g., 'qa_planner', 'inspection_log'
          item_type: logItem.item_type, // e.g., 'inspections', 'warranties', 'certificates'
          requirement_text: logItem.requirement_text
        });
      }
    }
    console.log('[SPEC_VIEWER_DEBUG] Mapped AI log highlights with types:', highlightLocations);
    return highlightLocations;
  };

  const [currentHighlights, setCurrentHighlights] = useState(mapHighlightLocations(highlights));
  const [currentAiLogHighlights, setCurrentAiLogHighlights] = useState(mapAiLogHighlightLocations(aiLogHighlights));
  const [currentHighlightsEnabled, setCurrentHighlightsEnabled] = useState(highlightsEnabled);

  // Update highlights when the highlights prop changes
  useEffect(() => {
    console.log('[SPEC_VIEWER_DEBUG] DocumentHighlighter highlights changed:', {
      highlightsLength: highlights?.length || 0,
      highlights: highlights
    });
    const newHighlights = mapHighlightLocations(highlights);
    console.log('[SPEC_VIEWER_DEBUG] Mapped highlights:', {
      newHighlightsLength: newHighlights?.length || 0,
      newHighlights: newHighlights
    });
    setCurrentHighlights(newHighlights);
  }, [highlights]);

  // Update AI log highlights when the prop changes
  useEffect(() => {
    console.log('[SPEC_VIEWER_DEBUG] DocumentHighlighter AI log highlights changed:', {
      aiLogHighlightsLength: aiLogHighlights?.length || 0,
      aiLogHighlights: aiLogHighlights
    });
    const newAiLogHighlights = mapAiLogHighlightLocations(aiLogHighlights);
    console.log('[SPEC_VIEWER_DEBUG] Mapped AI log highlights:', {
      newAiLogHighlightsLength: newAiLogHighlights?.length || 0,
      newAiLogHighlights: newAiLogHighlights
    });
    setCurrentAiLogHighlights(newAiLogHighlights);
  }, [aiLogHighlights]);

  // Update highlights enabled state when prop changes
  useEffect(() => {
    console.log('[SPEC_VIEWER_DEBUG] DocumentHighlighter highlightsEnabled changed:', highlightsEnabled);
    setCurrentHighlightsEnabled(highlightsEnabled);
  }, [highlightsEnabled]);


  if (!documentUrl) {
    return (
      <div className="document-highlighter-container spec-viewer-pdf-wrapper">
        <div className="document-placeholder">
          <div className="placeholder-content">
            <h3>Document Viewer</h3>
            <p>Select a spec section to view its document.</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="document-highlighter-container spec-viewer-pdf-wrapper">
      <ProjectLogsReader
        key={`${documentUrl}-${JSON.stringify(currentHighlights)}-${JSON.stringify(currentAiLogHighlights)}`} // Force re-render only when document or highlights change, not filters
        url={documentUrl}
        highlightLocations={currentHighlights}
        aiLogHighlightLocations={currentAiLogHighlights}
        docId={documentId}
        setPdfData={() => {}}
        setSubmittalIdParam={() => {}}
        handleAddNewRow={() => {}}
        handleAppendToSelectedRow={() => {}}
        setLogInViewer={() => {}}
        loading={false}
        setLoading={() => {}}
        onError={() => {}}
        highlightsEnabled={currentHighlightsEnabled}
        activeFilters={activeFilters}
      />
    </div>
  );
};

export default DocumentHighlighter;