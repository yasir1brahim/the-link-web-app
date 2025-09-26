import React, { useState, useEffect } from 'react';
import ProjectLogsReader from '../PdfReader/projectLogsReader';
import './DocumentHighlighter.css';

const DocumentHighlighter = ({ 
  highlights = [], 
  highlightsEnabled = true, 
  onHighlightClick,
  documentUrl = null,
  documentId = null
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

  const [currentHighlights, setCurrentHighlights] = useState(mapHighlightLocations(highlights));
  const [currentHighlightsEnabled, setCurrentHighlightsEnabled] = useState(highlightsEnabled);

  // Update highlights when the highlights prop changes
  useEffect(() => {
    console.log('[SPEC_VIEWER_DEBUG] DocumentHighlighter highlights changed:', highlights);
    const newHighlights = mapHighlightLocations(highlights);
    setCurrentHighlights(newHighlights);
  }, [highlights]);

  // Update highlights enabled state when prop changes
  useEffect(() => {
    console.log('[SPEC_VIEWER_DEBUG] DocumentHighlighter highlightsEnabled changed:', highlightsEnabled);
    setCurrentHighlightsEnabled(highlightsEnabled);
  }, [highlightsEnabled]);


  if (!documentUrl) {
    return (
      <div className="document-highlighter-container">
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
    <div className="document-highlighter-container">
      <ProjectLogsReader
        key={`${documentUrl}-${JSON.stringify(currentHighlights)}`} // Force re-render when document or highlights change
        url={documentUrl}
        highlightLocations={currentHighlights}
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
      />
    </div>
  );
};

export default DocumentHighlighter;