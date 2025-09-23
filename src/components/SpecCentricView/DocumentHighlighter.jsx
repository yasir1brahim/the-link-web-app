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

  // Convert highlights to the format expected by ProjectLogsReader
  const getTextLoc = () => {
    console.log('[SPEC_VIEWER_DEBUG] getTextLoc called:', {
      currentHighlightsEnabled: currentHighlightsEnabled,
      currentHighlightsLength: currentHighlights.length,
      currentHighlights: currentHighlights,
      documentLoaded
    });
    
    if (!currentHighlightsEnabled || currentHighlights.length === 0 || !documentLoaded) {
      console.log('[SPEC_VIEWER_DEBUG] No highlights to show (disabled, empty, or document not loaded)');
      return null;
    }
    
    // Use the first highlight as the main textLoc
    const firstHighlight = currentHighlights[0];
    console.log('[SPEC_VIEWER_DEBUG] First highlight:', firstHighlight);
    console.log('[SPEC_VIEWER_DEBUG] First highlight text_location:', firstHighlight.text_location);
    
    if (!firstHighlight.text_location) {
      console.log('[SPEC_VIEWER_DEBUG] First highlight has no text_location');
      return null;
    }
    
    const { page, x, y, width, height } = firstHighlight.text_location;
    console.log('[SPEC_VIEWER_DEBUG] Extracted values:', { page, x, y, width, height });
    console.log('[SPEC_VIEWER_DEBUG] Raw text_location keys:', Object.keys(firstHighlight.text_location));
    console.log('[SPEC_VIEWER_DEBUG] Raw text_location values:', Object.values(firstHighlight.text_location));
    
    // Try different possible field names for page number
    const pageNumber = page || firstHighlight.text_location.page_no || firstHighlight.text_location.pageNumber || firstHighlight.text_location.page_number || 1;
    console.log('[SPEC_VIEWER_DEBUG] Resolved page number:', pageNumber);
    
    const textLoc = {
      page_no: pageNumber,
      x: x,
      y: y,
      width: width || 100,
      height: height || 30
    };
    
    console.log('[SPEC_VIEWER_DEBUG] Converted textLoc:', textLoc);
    return textLoc;
  };

  const getAdditionalTextLocations = () => {
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
    const additionalLocations = currentHighlights.slice(1).map((highlight, index) => {
      console.log(`[SPEC_VIEWER_DEBUG] Processing additional highlight ${index + 2}:`, highlight);
      
      if (!highlight.text_location) {
        console.log(`[SPEC_VIEWER_DEBUG] Additional highlight ${index + 2} has no text_location`);
        return null;
      }
      
      console.log(`[SPEC_VIEWER_DEBUG] Additional highlight ${index + 2} text_location:`, highlight.text_location);
      const { page, x, y, width, height } = highlight.text_location;
      console.log(`[SPEC_VIEWER_DEBUG] Additional highlight ${index + 2} extracted values:`, { page, x, y, width, height });
      
      // Try different possible field names for page number
      const pageNumber = page || highlight.text_location.page_no || highlight.text_location.pageNumber || highlight.text_location.page_number || 1;
      console.log(`[SPEC_VIEWER_DEBUG] Additional highlight ${index + 2} resolved page number:`, pageNumber);
      
      const location = {
        page_no: pageNumber,
        x: x,
        y: y,
        width: width || 100,
        height: height || 30
      };
      
      console.log(`[SPEC_VIEWER_DEBUG] Converted additional location ${index + 2}:`, location);
      return location;
    }).filter(Boolean);
    
    console.log('[SPEC_VIEWER_DEBUG] All additional locations:', additionalLocations);
    return additionalLocations;
  };

  const textLoc = getTextLoc();
  const additionalTextLocations = getAdditionalTextLocations();
  
  console.log('[SPEC_VIEWER_DEBUG] Passing to ProjectLogsReader:', {
    url: documentUrl,
    textLoc,
    docId: documentId,
    additionalTextLocations,
    additionalTextLocationsCount: additionalTextLocations.length
  });

  // Only pass highlights after document is loaded
  const textLoc = documentLoaded ? getTextLoc() : null;
  const additionalTextLocations = documentLoaded ? getAdditionalTextLocations() : [];

  console.log('[SPEC_VIEWER_DEBUG] Passing to ProjectLogsReader:', {
    url: documentUrl,
    textLoc,
    docId: documentId,
    additionalTextLocations,
    additionalTextLocationsCount: additionalTextLocations.length,
    documentLoaded
  });

  return (
    <div className="document-highlighter-container">
      <ProjectLogsReader
        key={`${documentUrl}-${documentLoaded}`} // Force re-render when document loads
        url={documentUrl}
        textLoc={textLoc}
        docId={documentId}
        additionalTextLocations={additionalTextLocations}
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