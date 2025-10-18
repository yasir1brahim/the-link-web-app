/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import WebViewer from "@pdftron/webviewer";
import axiosInstance from "../../config/axios";
import { validateS3Link, isS3LinkExpiredError } from "../../utils/s3LinkValidator.js";
import { useS3LinkValidation } from "../../hooks/useS3LinkValidation.js";

const ProjectLogsReader = ({
  url,
  highlightLocations,
  aiLogHighlightLocations = [],
  docId,
  setPdfData,
  setSubmittalIdParam,
  handleAddNewRow,
  handleAppendToSelectedRow,
  setLogInViewer,
  loading,
  setLoading,
  onError,
  highlightsEnabled = true,
  activeFilters = new Set(),
}) => {
  const [webViewer, setWebViewer] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const { handleError, ErrorModal } = useS3LinkValidation();
  const previousHighlightLocation = useRef(null);
  
  // Convert activeFilters Set to a stable string representation for dependency tracking
  const activeFiltersString = React.useMemo(() => {
    return Array.from(activeFilters).sort().join(',');
  }, [activeFilters]);
  
  // Create stable references for highlight locations to prevent infinite re-renders
  // Only update when the actual content changes, not just the array reference
  const stableHighlightLocations = React.useMemo(() => {
    return highlightLocations;
  }, [JSON.stringify(highlightLocations)]);
  
  const stableAiLogHighlightLocations = React.useMemo(() => {
    return aiLogHighlightLocations;
  }, [JSON.stringify(aiLogHighlightLocations)]);

  console.log('[SPEC_VIEWER_DEBUG] ProjectLogsReader props:', {
    url,
    highlightLocationsLength: highlightLocations?.length || 0,
    aiLogHighlightLocationsLength: aiLogHighlightLocations?.length || 0,
    highlightLocations,
    docId,
    setPdfData,
    setSubmittalIdParam,
  });

  useEffect(() => {
    if (url) {
      (async () => {
        // Clean up existing PDF viewer
        const pdfViewer = document.getElementById("pdf-div");
        if (pdfViewer) {
          pdfViewer.innerHTML = '';
        }

        setCurrentUrl(url);
        setDocumentLoaded(false); // Reset document loaded state
        previousHighlightLocation.current = null; // Reset previous location for new document
        await loadPDF();
      })();
    }
  }, [url]);

  useEffect(() => {
    console.log('[SPEC_VIEWER_DEBUG] Highlight locations, document loaded, highlights enabled, or filters changed:', {
      url,
      currentUrl,
      hasWebViewer: !!webViewer,
      documentLoaded,
      highlightLocationsLength: stableHighlightLocations?.length,
      aiLogHighlightLocationsLength: stableAiLogHighlightLocations?.length,
      highlightLocations: stableHighlightLocations,
      aiLogHighlightLocations: stableAiLogHighlightLocations,
      highlightsEnabled,
      activeFilters: Array.from(activeFilters),
      activeFiltersString
    });
    
    if (url === currentUrl && webViewer && documentLoaded) {
      console.log('[SPEC_VIEWER_DEBUG] Conditions met, calling updateTxtView');
      updateTxtView();
    } else {
      console.log('[SPEC_VIEWER_DEBUG] Conditions not met for updateTxtView:', {
        urlMatch: url === currentUrl,
        hasWebViewer: !!webViewer,
        documentLoaded
      });
    }
  }, [stableHighlightLocations, stableAiLogHighlightLocations, documentLoaded, highlightsEnabled, activeFiltersString]);

  const handleClose = () => {
    setLogInViewer(null);
    setPdfData({
      url: "",
      textLoc: {},
      index: "",
      docId: null,
      submittalId: null,
      additionalTextLocations: [],
    });
    setSubmittalIdParam(null);
  };

  const handleDocumentLoaded = async (annotationManager) => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: "post",
        url: `/pdf/v2/getMetadata`,
        data: {
          doc_id: docId,
        },
      });
      if (response.status === 200) {
        console.log('[SPEC_VIEWER_DEBUG] Loading server annotations:', response.data.data?.length || 0);
        response.data.data?.map(async (item) => {
          const annotations = await annotationManager.importAnnotationCommand(
            item.xfdf_string
          );
          console.log('[SPEC_VIEWER_DEBUG] Imported server annotations:', annotations.length);
          annotations.forEach((annotation) => {
            annotationManager.redrawAnnotation(annotation);
          });
        });
      }
    };
    fetchData().catch((error) => {
      console.log(error);
    });
  };

  const getInitialPageLocation = (highlightLocations, aiLogHighlightLocations) => {
    // Combine both arrays, filtering out any null/undefined items and invalid page numbers
    const allLocations = [
      ...(highlightLocations || []),
      ...(aiLogHighlightLocations || [])
    ].filter(location => 
      location && 
      typeof location.page_no === 'number' && 
      location.page_no > 0 // PDF pages are 1-indexed, filter out 0 or negative
    );
    
    if (allLocations.length === 0) {
      console.warn('[SPEC_VIEWER_DEBUG] No valid page locations found (all page numbers were 0 or invalid)');
      return null;
    }
    
    // Find the object with the lowest page_no
    const lowestPageObject = allLocations.reduce((lowest, current) => {
      return (current.page_no < lowest.page_no) ? current : lowest;
    });
    
    console.log('[SPEC_VIEWER_DEBUG] Found valid initial location with page_no:', lowestPageObject.page_no);
    return lowestPageObject;
  };

  const updateTxtView = (_webViewer) => {
    try {
      let tmpViewer = _webViewer ?? webViewer;

      console.log('[SPEC_VIEWER_DEBUG] updateTxtView called with:', {
        highlightLocations: stableHighlightLocations,
        highlightLocationsLength: stableHighlightLocations?.length,
        hasViewer: !!tmpViewer,
        highlightsEnabled
      });

      // Safety check to ensure WebViewer is fully initialized
      if (!tmpViewer || !tmpViewer.Core || !tmpViewer.Core.annotationManager) {
        console.log('[SPEC_VIEWER_DEBUG] WebViewer not fully initialized, skipping highlights');
        return;
      }

      // Additional safety check for document viewer
      if (!tmpViewer.Core.documentViewer) {
        console.log('[SPEC_VIEWER_DEBUG] Document viewer not available, skipping highlights');
        return;
      }

      // Delete all annotations (both our created ones and server-loaded ones)
      const allAnnotations = tmpViewer.Core.annotationManager.getAnnotationsList();
      console.log('[SPEC_VIEWER_DEBUG] Deleting all annotations:', allAnnotations.length);
      tmpViewer.Core.annotationManager.deleteAnnotations(allAnnotations);

      // If highlights are disabled, just clear existing annotations and return
      if (!highlightsEnabled) {
        console.log('[SPEC_VIEWER_DEBUG] Highlights disabled, clearing annotations');
        setAnnotations([]);
        return;
      }

      const highlightsAreAvailable = stableHighlightLocations && stableHighlightLocations.length > 0 && stableHighlightLocations[0]?.page_no && stableHighlightLocations[0]?.x && stableHighlightLocations[0]?.y;
      const aiLogHighlightsAreAvailable = stableAiLogHighlightLocations && stableAiLogHighlightLocations.length > 0;
      console.log('[SPEC_VIEWER_DEBUG] Highlights are available:', highlightsAreAvailable);
      console.log('[SPEC_VIEWER_DEBUG] AI log highlights are available:', aiLogHighlightsAreAvailable);

    if (tmpViewer && (highlightsAreAvailable || aiLogHighlightsAreAvailable)) {
      const initialLocation = getInitialPageLocation(stableHighlightLocations, stableAiLogHighlightLocations);
      console.log('[SPEC_VIEWER_DEBUG] setting initial page location:', initialLocation);
      
      // Check if document is loaded before trying to access it
      if (tmpViewer.Core.documentViewer && tmpViewer.Core.documentViewer.getDocument() && tmpViewer.Core.documentViewer.getPageCount() > 0) {
        console.log('[SPEC_VIEWER_DEBUG] Document is loaded, proceeding with highlights');
        
        // Check if the highlight location has changed
        const prevLocation = previousHighlightLocation.current;
        const locationHasChanged = !prevLocation || 
          prevLocation.page_no !== initialLocation.page_no ||
          prevLocation.x !== initialLocation.x ||
          prevLocation.y !== initialLocation.y;
        
        if (locationHasChanged && initialLocation && initialLocation.page_no > 0) {
          tmpViewer.Core.documentViewer.displayPageLocation(
            initialLocation.page_no,
            initialLocation.x,
            initialLocation.y
          );
          previousHighlightLocation.current = {
            page_no: initialLocation.page_no,
            x: initialLocation.x,
            y: initialLocation.y
          };
          console.log('[SPEC_VIEWER_DEBUG] Highlight location changed, scrolled to new position');
        } else {
          console.log('[SPEC_VIEWER_DEBUG] Highlight location unchanged, skipping scroll');
        }
      } else {
        console.log('[SPEC_VIEWER_DEBUG] Document not loaded yet, skipping highlights');
        return;
      }

      // Add rectangular highlight annotations
      const _annotations = [];
      const annotationManager = tmpViewer.Core.annotationManager;
      const Annotations = tmpViewer.Core.Annotations;
      
      // Safety check for annotation creation
      if (!annotationManager || !Annotations || !Annotations.RectangleAnnotation) {
        console.log('[SPEC_VIEWER_DEBUG] Annotation manager or Annotations not available, skipping annotation creation');
        setAnnotations([]);
        return;
      }
      
      // Add submittal highlights (yellow/green color)
      // Apply filter: only show if 'submittal' is in the active filter set
      const shouldShowSubmittals = activeFilters.has('submittal');
      if (shouldShowSubmittals) {
        for (let i = 0; i < stableHighlightLocations?.length; i++) {
          const rectangleAnnot = new Annotations.RectangleAnnotation({
            PageNumber: stableHighlightLocations[i]?.page_no,
            X: stableHighlightLocations[i]?.x,
            Y: stableHighlightLocations[i]?.y,
            Width: stableHighlightLocations[i]?.width ?? 10000,
            Height: stableHighlightLocations[i]?.height ?? 30,
            Color: new Annotations.Color(213, 231, 62, 0.25),
            FillColor: new Annotations.Color(213, 231, 62, 0.25),
          });
          rectangleAnnot.Subject = 'Submittal Highlight';
          rectangleAnnot.CustomData = {
            item_type: 'submittal',
            extraction_type: 'submittal'
          };
          _annotations.push(rectangleAnnot);
          annotationManager.addAnnotation(rectangleAnnot);
          annotationManager.redrawAnnotation(rectangleAnnot);
        }
        console.log('[SPEC_VIEWER_DEBUG] Created submittal annotations:', stableHighlightLocations?.length || 0);
      } else {
        console.log('[SPEC_VIEWER_DEBUG] Submittal annotations filtered out by active filters');
      }
      
      // Helper function to get color based on AI log item type
      const getColorForItemType = (itemType, extractionType) => {
        // QA Planner item types with distinct colors
        const qaColorMap = {
          'inspections': { r: 255, g: 99, b: 71 },         // Tomato red
          'warranties': { r: 60, g: 179, b: 113 },         // Medium sea green
          'certificates': { r: 255, g: 165, b: 0 },        // Orange
          'closeout_submittals': { r: 138, g: 43, b: 226 }, // Blue violet
          'test_reports': { r: 30, g: 144, b: 255 },       // Dodger blue
          'commissioning': { r: 255, g: 20, b: 147 },      // Deep pink
          'delegated_design': { r: 75, g: 0, b: 130 },     // Indigo
          'mock_ups_sample_construction': { r: 218, g: 165, b: 32 }, // Goldenrod
          'pre_installation_meetings': { r: 32, g: 178, b: 170 }, // Light sea green
        };
        
        // Extraction type colors (fallback if item type not found)
        const extractionColorMap = {
          'qa_planner': { r: 100, g: 149, b: 237 },        // Cornflower blue (default)
          'inspection_log': { r: 255, g: 127, b: 80 },     // Coral
          'owner_deliverables_log': { r: 147, g: 112, b: 219 }, // Medium purple
        };
        
        // Try to get color from item type first, then extraction type, then default
        let color = qaColorMap[itemType] || extractionColorMap[extractionType] || { r: 100, g: 149, b: 237 };
        
        return new Annotations.Color(color.r, color.g, color.b, 0.25);
      };
      
      // Add AI log highlights with different colors based on type
      // Apply filter: only show highlights whose item_type is in the active filter set
      let filteredCount = 0;
      let addedCount = 0;
      for (let i = 0; i < stableAiLogHighlightLocations?.length; i++) {
        const location = stableAiLogHighlightLocations[i];
        const itemType = location?.item_type;
        
        // Check if this highlight should be shown based on active filters
        const shouldShow = activeFilters.has(itemType);
        
        if (!shouldShow) {
          filteredCount++;
          console.log('[SPEC_VIEWER_DEBUG] Filtering out AI log highlight with item_type:', itemType);
          continue;
        }
        
        console.log('[SPEC_VIEWER_DEBUG] Adding AI log highlight:', location);
        const color = getColorForItemType(location?.item_type, location?.extraction_type);
        
        const rectangleAnnot = new Annotations.RectangleAnnotation({
          PageNumber: location?.page_no,
          X: location?.x,
          Y: location?.y,
          Width: location?.width ?? 10000,
          Height: location?.height ?? 30,
          Color: color,
          FillColor: color,
        });
        rectangleAnnot.Subject = `AI Log Highlight - ${location?.item_type || location?.extraction_type || 'Unknown'}`;
        rectangleAnnot.CustomData = {
          item_type: location?.item_type,
          extraction_type: location?.extraction_type,
          requirement_text: location?.requirement_text
        };
        _annotations.push(rectangleAnnot);
        annotationManager.addAnnotation(rectangleAnnot);
        annotationManager.redrawAnnotation(rectangleAnnot);
        addedCount++;
      }
      console.log('[SPEC_VIEWER_DEBUG] Created AI log annotations with color coding:', addedCount, 'filtered out:', filteredCount);
      
      setAnnotations(_annotations);
      console.log('[SPEC_VIEWER_DEBUG] All annotations created and set:', _annotations.length);
    } else {
      console.log('[SPEC_VIEWER_DEBUG] No highlights to display - clearing annotations');
      setAnnotations([]);
    }
    } catch (error) {
      console.error('[SPEC_VIEWER_DEBUG] Error in updateTxtView:', error);
      // Don't re-throw the error to prevent component crashes
    }
  };

  const loadPDF = async () => {
    // Simple S3 validation
    try {
      const isValid = await validateS3Link(url);
      if (!isValid) {
        handleError({ message: 'The document link has expired. Please refresh the page to get a new link and try again.' });
        return;
      }
    } catch (error) {
      console.log('S3 validation failed, continuing with PDF load');
    }

    try {
      setLoading(true);
      setDocumentLoaded(false); // Reset document loaded state
      
      const pdfViewer = document.getElementById("pdf-div");
      const newPdfViewer = document.createElement("div");
      newPdfViewer.style.height = "calc(100vh - 240px)";
      newPdfViewer.style.position = "relative";
      newPdfViewer.style.overflow = "hidden";
      newPdfViewer.style.width = "100%";

      const viewer = pdfViewer.appendChild(newPdfViewer);

      const _webViewer = await WebViewer(
        {
          path: "/webviewer/lib",
          licenseKey:
            'Thelinkai  Inc :PWS:Thelinkai  Inc ::B+2:9D34C842CB60BB40A8EF77436A7DEE579B3C140AD8EFE6EE4ED826BD',
          initialDoc: url,
          extension: "pdf",
          css: "./index.css",
        },
        viewer
      );
      
      // Wait a bit for WebViewer to fully initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify WebViewer is properly initialized before setting it
      if (_webViewer && _webViewer.Core && _webViewer.Core.documentViewer) {
        setWebViewer(_webViewer);
      } else {
        console.error('[SPEC_VIEWER_DEBUG] WebViewer failed to initialize properly');
        throw new Error('WebViewer initialization failed');
      }

      _webViewer.UI.enableFeatures([_webViewer.UI.Feature.InlineComment]);
      handleDocumentLoaded(_webViewer.Core.annotationManager);
      _webViewer.UI.setZoomLevel("100%");

      _webViewer.Core.documentViewer.addEventListener("documentLoaded", () => {
        setDocumentLoaded(true);
        // Add a small delay to ensure WebViewer is fully ready
        setTimeout(() => {
          updateTxtView(_webViewer);
        }, 200);
        setLoading(false);
      });

      // Error handling
      _webViewer.Core.documentViewer.addEventListener("documentError", (error) => {
        if (isS3LinkExpiredError(error)) {
          handleError({ message: 'The document link has expired. Please refresh the page to get a new link and try again.' });
        } else {
          handleError({ message: 'Unable to load the PDF document. Please try again.' });
        }
      });

      // UI Customization - Hide extra toolbar elements
      _webViewer.UI.disableElements([
        "downloadButton",
        "printButton",
        "viewControlsDivider2",
        "rotateHeader",
        "rotateCounterClockwiseButton",
        "rotateClockwiseButton",
        "toolbarGroup-View",
        "toolbarGroup-Shapes",
        "toolbarGroup-Edit",
        "toolbarGroup-FillAndSign",
        "toolbarGroup-Forms",
        "underlineToolGroupButton",
        "shapeToolGroupButton",
        "freeHandHighlightToolGroupButton",
        "freeHandToolGroupButton",
        "stickyToolGroupButton",
        "squigglyToolGroupButton",
        "strikeoutToolGroupButton",
        "toolbarGroup-Insert",
        "toolsHeader",
        "ribbons",
        "textUnderlineToolButton",
        "textSquigglyToolButton",
        "textStrikeoutToolButton",
        "linkButton",
        "toggleNotesButton",
      ]);

      // Custom close button
      const closeButton = () => {
        return (
          <div
            onClick={() => {
              setWebViewer(null);
              handleClose();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              columnGap: "5px",
              marginRight: "10px",
            }}
          >
            Close
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon icon-tabler icon-tabler-xbox-x"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#2c3e50"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 21a9 9 0 0 0 9 -9a9 9 0 0 0 -9 -9a9 9 0 0 0 -9 9a9 9 0 0 0 9 9z" />
              <path d="M9 8l6 8" />
              <path d="M15 8l-6 8" />
            </svg>
          </div>
        );
      };

      const customCloseButton = {
        type: "customElement",
        render: closeButton,
      };

      const newDivider = {
        type: "divider",
        hidden: ["mobile"],
      };

      _webViewer.UI.setHeaderItems((header) => {
        header.push(newDivider);
      });

      _webViewer.UI.setHeaderItems((header) => {
        header.push(customCloseButton);
      });

      _webViewer.UI.disableElements(["textHighlightToolButton"]);
      _webViewer.UI.disableElements(["copyTextButton"]);

      // Custom context menu items
      const contextMenuItems = _webViewer.UI.textPopup.getItems();
      const lastItem = contextMenuItems[contextMenuItems.length - 1];
      _webViewer.UI.textPopup.add(
        {
          type: "actionButton",
          label: "Add New Row",
          img: `<svg
                width="20"
                height="20"
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
              >
                <g
                  transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)"
                  fill="#000000"
                  stroke="none"
                >
                  <path
                    d="M50 250 l0 -110 30 0 c29 0 30 -1 30 -52 0 -51 0 -51 -20 -33 -34 31 -36 6 -2 -28 l32 -32 32 32 c34 34 32 59 -2 28 -20 -18 -20 -18 -20 33 l0 52 80 0 c47 0 80 4 80 10 0 6 -43 10 -110 10 l-110 0 0 90 0 90 180 0 180 0 0 -65 c0 -37 4 -65 10 -65 6 0 10 32 10 75 l0 75 -200 0 -200 0 0 -110z"
                  />
                  <path
                    d="M351 186 c-87 -48 -50 -186 49 -186 51 0 100 49 100 99 0 75 -83 124 -149 87z m104 -31 c50 -49 15 -135 -55 -135 -41 0 -80 39 -80 80 0 70 86 105 135 55z"
                  />
                  <path
                    d="M390 135 c0 -20 -5 -25 -25 -25 -14 0 -25 -4 -25 -10 0 -5 11 -10 25 -10 20 0 25 -5 25 -25 0 -14 5 -25 10 -25 6 0 10 11 10 25 0 20 5 25 25 25 14 0 25 5 25 10 0 6 -11 10 -25 10 -20 0 -25 5 -25 25 0 14 -4 25 -10 25 -5 0 -10 -11 -10 -25z"
                  />
                </g>
              </svg>`,
          onClick: () =>
            handleAddNewRow(_webViewer.Core.documentViewer.getSelectedText()),
        },
        lastItem.dataElement
      );
      _webViewer.UI.textPopup.add(
        {
          type: "actionButton",
          label: "Append to Selected Row",
          img: `<svg
                width="20"
                height="20"
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
              >
                <g
                  transform="translate(0.000000,50.000000) scale(0.100000,-0.100000)"
                  fill="#000000"
                  stroke="none"
                >
                  <path
                    d="M85 470 c-31 -33 -27 -54 5 -25 20 18 20 18 20 -33 0 -51 -1 -52 -30 -52 l-30 0 0 -110 0 -110 120 0 c73 0 120 4 120 10 0 6 -43 10 -110 10 l-110 0 0 90 0 90 180 0 180 0 0 -65 c0 -37 4 -65 10 -65 6 0 10 32 10 75 l0 75 -160 0 -160 0 0 52 c0 51 0 51 20 33 32 -29 36 -8 5 25 -16 17 -32 30 -35 30 -3 0 -19 -13 -35 -30z"
                  />
                  <path
                    d="M351 186 c-87 -48 -50 -186 49 -186 51 0 100 49 100 99 0 75 -83 124 -149 87z m104 -31 c50 -49 15 -135 -55 -135 -41 0 -80 39 -80 80 0 70 86 105 135 55z"
                  />
                  <path
                    d="M390 135 c0 -20 -5 -25 -25 -25 -14 0 -25 -4 -25 -10 0 -5 11 -10 25 -10 20 0 25 -5 25 -25 0 -14 5 -25 10 -25 6 0 10 11 10 25 0 20 5 25 25 25 14 0 25 5 25 10 0 6 -11 10 -25 10 -20 0 -25 5 -25 25 0 14 -4 25 -10 25 -5 0 -10 -11 -10 -25z"
                  />
                </g>
              </svg>`,
          onClick: () =>
            handleAppendToSelectedRow(
              _webViewer.Core.documentViewer.getSelectedText()
            ),
        },
        lastItem.dataElement
      );
    } catch (error) {
      setLoading(false);
      handleError({ message: 'Failed to load PDF viewer.' });
    }
  };

  return (
    <>
      <ErrorModal />
      <div 
        id="pdf-div" 
        style={{
          height: 'calc(100vh - 240px)',
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      ></div>
    </>
  );
};

export default ProjectLogsReader;
