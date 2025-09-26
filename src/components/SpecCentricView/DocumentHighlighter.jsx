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
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [currentHighlights, setCurrentHighlights] = useState([]);
  const [currentHighlightsEnabled, setCurrentHighlightsEnabled] = useState(true);

  console.log('[SPEC_VIEWER_DEBUG] DocumentHighlighter rendered with props:', {
    highlights,
    highlightsEnabled,
    documentUrl,
    documentId,
    highlightsCount: highlights.length,
    documentLoaded
  });

  // Reset document loaded state when URL changes
  useEffect(() => {
    setDocumentLoaded(false);
    setCurrentHighlights([]);
  }, [documentUrl]);

  // Simulate document loaded after a short delay
  useEffect(() => {
    if (documentUrl && !documentLoaded) {
      const timer = setTimeout(() => {
        console.log('[SPEC_VIEWER_DEBUG] Simulating document loaded');
        setDocumentLoaded(true);
        setCurrentHighlights(highlights);
        setCurrentHighlightsEnabled(highlightsEnabled);
      }, 1000); // 1 second delay to let document load

      return () => clearTimeout(timer);
    }
  }, [documentUrl, documentLoaded, highlights, highlightsEnabled]);
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
  
  // ensure highlight locations are in the correct format
  const getHighlightLocations = () => {
    console.log('[SPEC_VIEWER_DEBUG] getAdditionalTextLocations called:', {
      currentHighlightsEnabled: currentHighlightsEnabled,
      currentHighlightsLength: currentHighlights.length,
      documentLoaded
    });
    
    if (!currentHighlightsEnabled || currentHighlights.length <= 1 || !documentLoaded) {
      console.log('[SPEC_VIEWER_DEBUG] No additional locations (disabled, <= 1 highlight, or document not loaded)');
      return [];
    }
    
    // Convert remaining highlights to additionalTextLocations format
    const highlightLocations = currentHighlights.map((highlight, index) => {
      console.log(`[SPEC_VIEWER_DEBUG] Processing highlight ${index + 1}:`, highlight);
      
      if (!highlight.text_location) {
        console.log(`[SPEC_VIEWER_DEBUG] Highlight ${index + 1} has no text_location`);
        return null;
      }
      
      console.log(`[SPEC_VIEWER_DEBUG] Highlight ${index + 1} text_location:`, highlight.text_location);
      const { page, x, y, width, height } = highlight.text_location;
      console.log(`[SPEC_VIEWER_DEBUG] Highlight ${index + 1} extracted values:`, { page, x, y, width, height });
      
      // Try different possible field names for page number
      const pageNumber = page || highlight.text_location.page_no || highlight.text_location.pageNumber || highlight.text_location.page_number || 1;
      console.log(`[SPEC_VIEWER_DEBUG] Highlight ${index + 1} resolved page number:`, pageNumber);
      
      const location = {
        page_no: pageNumber,
        x: x,
        y: y,
        width: width || 100,
        height: height || 30
      };
      
      console.log(`[SPEC_VIEWER_DEBUG] Converted highlight ${index + 1}:`, location);
      return location;
    }).filter(Boolean);
    
    console.log('[SPEC_VIEWER_DEBUG] All highlight locations:', highlightLocations);
    return highlightLocations;
  };
  

  // Only pass highlights after document is loaded
  const highlightLocations = documentLoaded ? getHighlightLocations() : [];

  console.log('[SPEC_VIEWER_DEBUG] Passing to ProjectLogsReader:', {
    url: documentUrl,
    highlightLocations,
    docId: documentId,
    highlightLocationsCount: highlightLocations.length,
    documentLoaded
  });

  return (
    <div className="document-highlighter-container">
      <ProjectLogsReader
        key={`${documentUrl}-${documentLoaded}`} // Force re-render when document loads
        url={documentUrl}
        highlightLocations={highlightLocations}
        docId={documentId}
        setPdfData={() => {}}
        setSubmittalIdParam={() => {}}
        handleAddNewRow={() => {}}
        handleAppendToSelectedRow={() => {}}
        setLogInViewer={() => {}}
        loading={false}
        setLoading={() => {}}
        onError={() => {}}
      />
    </div>
  );
};

export default DocumentHighlighter;