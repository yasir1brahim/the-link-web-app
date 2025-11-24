/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import WebViewer from "@pdftron/webviewer";
import axiosInstance from "../../config/axios";
import { validateS3Link, isS3LinkExpiredError } from "../../utils/s3LinkValidator.js";
import { useS3LinkValidation } from "../../hooks/useS3LinkValidation.js";
import { ReactComponent as AddButton } from "../../assets/images/circle-add.svg";
import * as api from '../../api/SpecCentricView/api';
import { toast } from 'react-toastify';

// Configuration for sticky note positioning
const STICKY_NOTE_POSITION = 'start'; // Options: 'start', 'center', 'end', 'offset'

/**
 * Calculate sticky note position based on highlight location
 */
function calculateStickyPosition(highlightLocation, position = 'start') {
  const { x, y, width, height } = highlightLocation;

  let calcX, calcY;

  switch(position) {
    case 'start':
      calcX = x;
      calcY = y;
      break;
    case 'center':
      calcX = x + (width || 0) / 2;
      calcY = y + (height || 0) / 2;
      break;
    case 'end':
      calcX = x + (width || 0);
      calcY = y + (height || 0);
      break;
    case 'offset':
      calcX = x + (width || 0) + 5;
      calcY = y - 5;
      break;
    default:
      calcX = x;
      calcY = y;
  }

  // Ensure position is within bounds
  calcX = Math.max(0, calcX);
  calcY = Math.max(0, calcY);

  return { x: calcX, y: calcY };
}

/**
 * Check if annotation is an extraction note parent (sticky without parent)
 */
function isExtractionNoteParent(annotation) {
  return annotation.getCustomData('extracted_data_id') &&
         !annotation.InReplyTo;
}

/**
 * Check if annotation is an extraction note reply
 */
function isExtractionNoteReply(annotation) {
  return annotation.getCustomData('extraction_note_id') &&
         annotation.InReplyTo;
}

/**
 * Check if annotation is a highlight rectangle
 */
function isHighlightRectangle(annotation, Annotations) {
  return annotation instanceof Annotations.RectangleAnnotation &&
         annotation.getCustomData('extracted_data_id');
}

/**
 * Find existing sticky note parent for an ExtractedData ID
 */
function findStickyNoteForExtractedData(extractedDataId, annotationManager) {
  const allAnnotations = annotationManager.getAnnotationsList();
  return allAnnotations.find(annot =>
    isExtractionNoteParent(annot) &&
    annot.getCustomData('extracted_data_id') === extractedDataId
  );
}

/**
 * Create sticky note annotations for an ExtractedData item with notes
 */
function createNotesForExtractedData(extractedData, webViewer, currentUserId) {
  const { annotationManager, Annotations } = webViewer.Core;

  // Safety checks
  if (!extractedData.notes || extractedData.notes.length === 0) {
    return;
  }

  if (!extractedData.pdf_locations || extractedData.pdf_locations.length === 0) {
    console.warn(`ExtractedData ${extractedData.id} has no PDF locations, skipping notes`);
    return;
  }

  const firstLocation = extractedData.pdf_locations[0];
  const position = calculateStickyPosition(firstLocation, STICKY_NOTE_POSITION);

  // Create parent sticky note
  const parentSticky = new Annotations.StickyAnnotation({
    PageNumber: firstLocation.page_no,
    X: position.x,
    Y: position.y,
    Icon: Annotations.StickyAnnotation.IconNames.Comment,
    StrokeColor: new Annotations.Color(255, 200, 100, 1),
  });

  parentSticky.setContents('');
  parentSticky.setOpenInitially(true);
  parentSticky.setCustomData('extracted_data_id', extractedData.id);
  parentSticky.ReadOnly = true; // Parent is not editable

  annotationManager.addAnnotation(parentSticky, { imported: true });

  // Create reply annotations for each note
  const replies = extractedData.notes.map(note => {
    const reply = new Annotations.StickyAnnotation({
      PageNumber: firstLocation.page_no,
      X: position.x,
      Y: position.y,
      InReplyTo: parentSticky.Id,
      ReplyType: 'Group',
    });

    reply.setContents(note.text);
    reply.Author = note.created_by_name || 'Unknown';
    reply.setCustomData('extraction_note_id', note.id);
    reply.setCustomData('extracted_data_id', extractedData.id);
    reply.setCustomData('created_by_id', note.created_by_id);
    reply.ReadOnly = note.created_by_id !== currentUserId;

    return reply;
  });

  annotationManager.addAnnotations(replies, { imported: true });
  annotationManager.drawAnnotationsFromList([parentSticky, ...replies]);
}

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
  activeFilters = new Set(),
  useFiltering = false,
  isSpecViewMode = false,
  onRequestAddHighlight = null,
  extractedDataItems = [],
  getExtractedDataById = null,
  currentUserId = null,
  projectId = null,
}) => {
  const [webViewer, setWebViewer] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const { handleError, ErrorModal } = useS3LinkValidation();
  const previousHighlightLocation = useRef(null);
  const annotationsCreated = useRef(false);
  const annotationsRef = useRef([]);
  
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
  
  // Reset annotations flag when highlight data changes
  useEffect(() => {
    annotationsCreated.current = false;
  }, [stableHighlightLocations, stableAiLogHighlightLocations]);

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
        annotationsCreated.current = false; // Reset annotations flag for new document
        await loadPDF();
      })();
    }
  }, [url]);

  useEffect(() => {
    if (url === currentUrl && webViewer && documentLoaded) {
      updateTxtView();
    }
  }, [stableHighlightLocations, stableAiLogHighlightLocations, documentLoaded, activeFiltersString]);

  // Set up annotation event listeners for note management
  useEffect(() => {
    if (!webViewer || !webViewer.Core || !projectId) {
      return;
    }

    const { annotationManager, Annotations } = webViewer.Core;

    /**
     * Display error notification to user
     */
    const handleError = (error, context = '') => {
      const message = error?.response?.data?.message || error.message || 'An error occurred';
      console.error(`${context}:`, error);
      toast.error(`${context}: ${message}`);
    };

    /**
     * Handle annotation add/modify events
     */
    const handleAnnotationChanged = async (annotations, action, { imported }) => {
      if (imported) return; // Skip annotations loaded from backend

      for (const annot of annotations) {
        if (!isExtractionNoteReply(annot)) {
          continue;
        }

        if (action === 'add') {
          const extractedDataId = annot.getCustomData('extracted_data_id');
          const noteText = annot.getContents();

          // Skip empty notes and show warning
          if (!noteText || !noteText.trim()) {
            annotationManager.deleteAnnotation(annot, false, true);
            toast.warning('Cannot create empty note');
            continue;
          }

          try {
            const note = await api.createExtractionNote(
              projectId,
              extractedDataId,
              { text: noteText }
            );

            // Update annotation with backend note ID
            annot.setCustomData('extraction_note_id', note.id);
            annot.setCustomData('created_by_id', note.created_by_id);
            annotationManager.redrawAnnotation(annot);
          } catch (error) {
            handleError(error, 'Failed to create note');
            // Rollback: delete the annotation without firing events
            annotationManager.deleteAnnotation(annot, false, true);
          }

          continue;
        }

        if (action === 'modify') {
          const noteId = annot.getCustomData('extraction_note_id');
          const extractedDataId = annot.getCustomData('extracted_data_id');
          const newText = annot.getContents();
          const previousText = annot._originalContents || annot.getCustomData('_previous_contents');

          try {
            await api.updateExtractionNote(
              projectId,
              extractedDataId,
              noteId,
              { text: newText }
            );

            // Clear cached original
            delete annot._originalContents;
          } catch (error) {
            handleError(error, 'Failed to update note');

            // Rollback: restore previous text
            if (typeof previousText === 'string') {
              annot.setContents(previousText);
              annotationManager.redrawAnnotation(annot);
            }
          }
        }
      }
    };

    /**
     * Handle click on highlight rectangle to open/create notes
     */
    const handleHighlightClick = (extractedDataId) => {
      // Check if sticky note already exists
      const existingSticky = findStickyNoteForExtractedData(extractedDataId, annotationManager);

      if (existingSticky) {
        // Open existing sticky note
        webViewer.UI.openElement('notesPanel');
        annotationManager.selectAnnotation(existingSticky);
        return;
      }

      // Create new sticky note
      const extractedData = getExtractedDataById ? getExtractedDataById(extractedDataId) : null;

      if (!extractedData || !extractedData.pdf_locations || extractedData.pdf_locations.length === 0) {
        console.warn(`Cannot create sticky note: ExtractedData ${extractedDataId} has no PDF locations`);
        return;
      }

      const firstLocation = extractedData.pdf_locations[0];
      const position = calculateStickyPosition(firstLocation, STICKY_NOTE_POSITION);

      const newSticky = new Annotations.StickyAnnotation({
        PageNumber: firstLocation.page_no,
        X: position.x,
        Y: position.y,
        Icon: Annotations.StickyAnnotation.IconNames.Comment,
        StrokeColor: new Annotations.Color(255, 200, 100, 1),
      });

      newSticky.setContents('');
      newSticky.setOpenInitially(true);
      newSticky.setCustomData('extracted_data_id', extractedDataId);
      newSticky.ReadOnly = true; // Parent is not editable

      annotationManager.addAnnotation(newSticky);
      annotationManager.redrawAnnotation(newSticky);

      // Open notes panel and select the new sticky note
      webViewer.UI.openElement('notesPanel');
      annotationManager.selectAnnotation(newSticky);
    };

    /**
     * Cache original note contents when selected for edit rollback
     */
    const handleAnnotationSelected = (annotations) => {
      const selectedAnnot = annotations[0];

      if (!selectedAnnot) return;

      // Cache original contents for edit rollback
      if (isExtractionNoteReply(selectedAnnot)) {
        selectedAnnot._originalContents = selectedAnnot.getContents();
      }

      // Handle highlight rectangle clicks
      if (isHighlightRectangle(selectedAnnot, Annotations)) {
        const extractedDataId = selectedAnnot.getCustomData('extracted_data_id');
        if (extractedDataId) {
          handleHighlightClick(extractedDataId);
        }
      }
    };

    /**
     * Handle annotation deletion with backend sync and rollback
     */
    const handleAnnotationDeleted = async (annotations, { imported }) => {
      if (imported) return;

      for (const annot of annotations) {
        // Handle reply deletion
        if (isExtractionNoteReply(annot)) {
          const noteId = annot.getCustomData('extraction_note_id');
          const extractedDataId = annot.getCustomData('extracted_data_id');

          // Clone annotation for potential rollback
          const annotCopy = {
            contents: annot.getContents(),
            author: annot.Author,
            customData: { ...annot.CustomData },
            position: {
              x: annot.X,
              y: annot.Y,
              page: annot.PageNumber
            },
            parentId: annot.InReplyTo
          };

          try {
            await api.deleteExtractionNote(
              projectId,
              extractedDataId,
              noteId
            );
          } catch (error) {
            handleError(error, 'Failed to delete note');

            // Rollback: recreate the annotation
            const restored = new Annotations.StickyAnnotation({
              PageNumber: annotCopy.position.page,
              X: annotCopy.position.x,
              Y: annotCopy.position.y,
              InReplyTo: annotCopy.parentId,
              ReplyType: 'Group',
            });

            restored.setContents(annotCopy.contents);
            restored.Author = annotCopy.author;
            Object.keys(annotCopy.customData).forEach(key => {
              restored.setCustomData(key, annotCopy.customData[key]);
            });

            annotationManager.addAnnotation(restored, { imported: true });
            annotationManager.drawAnnotationsFromList([restored]);
          }

          continue;
        }

        // Handle parent sticky deletion (deletes all child notes)
        if (isExtractionNoteParent(annot)) {
          const extractedDataId = annot.getCustomData('extracted_data_id');
          const replies = annotationManager.getAnnotationsList().filter(a =>
            a.InReplyTo === annot.Id && isExtractionNoteReply(a)
          );

          if (replies.length > 0) {
            // Show warning
            toast.info(`Deleting ${replies.length} note(s) from highlight`);
          }

          // Delete all notes from backend
          for (const reply of replies) {
            const noteId = reply.getCustomData('extraction_note_id');
            if (noteId) {
              try {
                await api.deleteExtractionNote(projectId, extractedDataId, noteId);
              } catch (error) {
                console.error('Failed to delete note from backend:', error);
              }
            }
          }
        }
      }
    };

    // Register event listeners
    annotationManager.addEventListener('annotationChanged', handleAnnotationChanged);
    annotationManager.addEventListener('annotationSelected', handleAnnotationSelected);
    annotationManager.addEventListener('annotationDeleted', handleAnnotationDeleted);

    // Cleanup function to remove listeners
    return () => {
      annotationManager.removeEventListener('annotationChanged', handleAnnotationChanged);
      annotationManager.removeEventListener('annotationSelected', handleAnnotationSelected);
      annotationManager.removeEventListener('annotationDeleted', handleAnnotationDeleted);
    };
  }, [webViewer, projectId]);

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

  const buildSelectionPayload = React.useCallback((documentViewer) => {
    if (!documentViewer || typeof documentViewer.getSelectedText !== "function") {
      return null;
    }

    const selectedText = documentViewer.getSelectedText();
    if (!selectedText || !selectedText.trim()) {
      return null;
    }

    const normalizePageNumber = (entry) => {
      if (typeof entry?.pageNumber === "number") {
        return entry.pageNumber;
      }
      if (typeof entry?.pageIndex === "number") {
        return entry.pageIndex + 1;
      }
      if (typeof entry === "number") {
        return entry + 1;
      }
      return null;
    };

    const applyQuad = (pageNumber, quad) => {
      if (!quad) {
        return null;
      }

      const xs = [quad.x1, quad.x2, quad.x3, quad.x4].filter((value) => typeof value === "number");
      const ys = [quad.y1, quad.y2, quad.y3, quad.y4].filter((value) => typeof value === "number");

      if (xs.length === 0 || ys.length === 0) {
        return null;
      }

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) {
        return null;
      }

      return {
        page_no: pageNumber,
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    };

    const quadsSource =
      typeof documentViewer.getSelectedTextQuads === "function"
        ? documentViewer.getSelectedTextQuads()
        : null;

    const locations = [];

    if (Array.isArray(quadsSource)) {
      quadsSource.forEach((entry) => {
        const pageNumber = normalizePageNumber(entry);
        if (!pageNumber || !Array.isArray(entry?.quads)) {
          return;
        }

        entry.quads.forEach((quad) => {
          const location = applyQuad(pageNumber, quad);
          if (location) {
            locations.push(location);
          }
        });
      });
    } else if (quadsSource && typeof quadsSource === "object") {
      Object.keys(quadsSource).forEach((key) => {
        const pageIdx = Number(key);
        const pageNumber = Number.isNaN(pageIdx) ? null : pageIdx;
        if (!pageNumber || !Array.isArray(quadsSource[key])) {
          return;
        }

        quadsSource[key].forEach((quad) => {
          const location = applyQuad(pageNumber, quad);
          if (location) {
            locations.push(location);
          }
        });
      });
    }

    if (locations.length === 0) {
      return null;
    }

    return {
      selectedText: selectedText.trim(),
      locations,
    };
  }, []);

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

      // Safety check to ensure WebViewer is fully initialized
      if (!tmpViewer || !tmpViewer.Core || !tmpViewer.Core.annotationManager) {
        return;
      }

      // Additional safety check for document viewer
      if (!tmpViewer.Core.documentViewer) {
        return;
      }

      const highlightsAreAvailable = stableHighlightLocations && stableHighlightLocations.length > 0 && stableHighlightLocations[0]?.page_no && stableHighlightLocations[0]?.x && stableHighlightLocations[0]?.y;
      const aiLogHighlightsAreAvailable = stableAiLogHighlightLocations && stableAiLogHighlightLocations.length > 0;
      
      const annotationManager = tmpViewer.Core.annotationManager;
      const Annotations = tmpViewer.Core.Annotations;

      const createAnnotationColor = (colorData) => new Annotations.Color(colorData.r, colorData.g, colorData.b, 0.25);
      const getColorDataForHighlight = (itemType, extractionType) => {
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

        const extractionColorMap = {
          'qa_planner': { r: 100, g: 149, b: 237 },        // Cornflower blue (default)
          'inspection_log': { r: 255, g: 127, b: 80 },     // Coral
          'owner_deliverables_log': { r: 147, g: 112, b: 219 }, // Medium purple
        };

        return qaColorMap[itemType] || extractionColorMap[extractionType] || { r: 100, g: 149, b: 237 };
      };
      const SUBMITTAL_COLOR = { r: 213, g: 231, b: 62 };

      if (annotationsCreated.current && annotationsRef.current.length > 0) {

        // Batch hide/show annotations based on active filters (if filtering enabled)
        const annotationsToUpdate = [];
        annotationsRef.current.forEach(annot => {
          const itemType = annot.CustomData?.item_type;
          const shouldShow = !useFiltering || activeFilters.has(itemType);
          let needsRedraw = false;

          if (annot.Hidden === shouldShow) { // Only update if state needs to change
            annot.Hidden = !shouldShow;
            needsRedraw = true;
          }

          if (annot.CustomData?.source === 'ai' && Array.isArray(stableAiLogHighlightLocations)) {
            const locationIndex = annot.CustomData.index;
            const location = stableAiLogHighlightLocations[locationIndex];
            if (location) {
              const colorData = location?.color || annot.CustomData.color || getColorDataForHighlight(location?.item_type, location?.extraction_type);
              const existingColor = annot.CustomData.color;
              if (
                !existingColor ||
                existingColor.r !== colorData.r ||
                existingColor.g !== colorData.g ||
                existingColor.b !== colorData.b
              ) {
                const nextColor = createAnnotationColor(colorData);
                annot.Color = nextColor;
                annot.FillColor = nextColor;
                annot.CustomData.color = colorData;
                needsRedraw = true;
              }
            }
          }

          if (needsRedraw) {
            annotationsToUpdate.push(annot);
          }
        });

        if (annotationsToUpdate.length > 0) {
          // Batch redraw for better performance - use redraw instead of draw for existing annotations
          annotationsToUpdate.forEach(annot => annotationManager.redrawAnnotation(annot));
        }
        return;
      }

      // Remove only previously created highlight annotations before adding new ones
      if (annotationsRef.current.length > 0) {
        annotationManager.deleteAnnotations(annotationsRef.current);
        annotationsRef.current = [];
      }

    if (tmpViewer && (highlightsAreAvailable || aiLogHighlightsAreAvailable)) {
      const initialLocation = getInitialPageLocation(stableHighlightLocations, stableAiLogHighlightLocations);

      // Check if document is loaded before trying to access it
      if (tmpViewer.Core.documentViewer && tmpViewer.Core.documentViewer.getDocument() && tmpViewer.Core.documentViewer.getPageCount() > 0) {
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
        }
      } else {
        return;
      }

      // Add rectangular highlight annotations
      const _annotations = [];
      
      // Safety check for annotation creation
      if (!annotationManager || !Annotations || !Annotations.RectangleAnnotation) {
        annotationsRef.current = [];
        setAnnotations([]);
        return;
      }

      // Add submittal highlights (yellow/green color)
      // Create all annotations, set Hidden based on active filters (if filtering is enabled)
      const shouldShowSubmittals = !useFiltering || activeFilters.has('submittal');
      for (let i = 0; i < stableHighlightLocations?.length; i++) {
        const annotationColor = createAnnotationColor(SUBMITTAL_COLOR);
        const rectangleAnnot = new Annotations.RectangleAnnotation({
          PageNumber: stableHighlightLocations[i]?.page_no,
          X: stableHighlightLocations[i]?.x,
          Y: stableHighlightLocations[i]?.y,
          Width: stableHighlightLocations[i]?.width ?? 10000,
          Height: stableHighlightLocations[i]?.height ?? 30,
          Color: annotationColor,
          FillColor: annotationColor,
        });
        rectangleAnnot.Subject = 'Submittal Highlight';
        rectangleAnnot.CustomData = {
          item_type: 'submittal',
          extraction_type: 'submittal',
          color: SUBMITTAL_COLOR,
          source: 'submittal',
          index: i,
        };
        rectangleAnnot.Hidden = !shouldShowSubmittals;
        _annotations.push(rectangleAnnot);
      }

      // Add AI log highlights with different colors based on type
      // Create all annotations, set Hidden based on active filters (if filtering is enabled)
      for (let i = 0; i < stableAiLogHighlightLocations?.length; i++) {
        const location = stableAiLogHighlightLocations[i];
        const itemType = location?.item_type;

        const shouldShow = !useFiltering || activeFilters.has(itemType);

        const colorData = location?.color || getColorDataForHighlight(location?.item_type, location?.extraction_type);
        const color = createAnnotationColor(colorData);
        
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
          extracted_data_id: location?.extracted_data_id, // CRITICAL for linking to notes
          item_type: location?.item_type,
          extraction_type: location?.extraction_type,
          requirement_text: location?.requirement_text,
          color: colorData,
          source: 'ai',
          index: i,
        };
        rectangleAnnot.Hidden = !shouldShow;
        _annotations.push(rectangleAnnot);
      }

      // Add all annotations in batch for better performance
      annotationManager.addAnnotations(_annotations);
      annotationManager.drawAnnotationsFromList(_annotations);

      // Keep ref in sync with state to avoid closure issues
      annotationsRef.current = _annotations;

      // Create sticky notes for ExtractedData items with notes
      if (extractedDataItems && extractedDataItems.length > 0) {
        extractedDataItems.forEach(data => {
          createNotesForExtractedData(data, tmpViewer, currentUserId);
        });
      }
      setAnnotations(_annotations);
      annotationsCreated.current = true;
    } else {
      annotationsRef.current = [];
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
      const insertionReference =
        contextMenuItems.length > 0
          ? contextMenuItems[contextMenuItems.length - 1].dataElement
          : null;

      const addPlusIconSvg = ReactDOMServer.renderToStaticMarkup(<AddButton />);

      if (isSpecViewMode && typeof onRequestAddHighlight === "function") {
        _webViewer.UI.textPopup.add(
          {
            type: "actionButton",
            label: "Add New Highlight",
            dataElement: "specViewAddHighlightButton",
            img: addPlusIconSvg,
            onClick: () => {
              const documentViewer = _webViewer.Core?.documentViewer;
              const selectionPayload = buildSelectionPayload(documentViewer);
              if (!selectionPayload) {
                console.warn("[SPEC_VIEWER_DEBUG] No valid selection for manual highlight creation");
                return;
              }
              onRequestAddHighlight(selectionPayload);
            },
          },
          insertionReference
        );
      } else {
        if (typeof handleAddNewRow === "function") {
          _webViewer.UI.textPopup.add(
            {
              type: "actionButton",
              label: "Add New Row",
              img: addPlusIconSvg,
              onClick: () =>
                handleAddNewRow(_webViewer.Core.documentViewer.getSelectedText()),
            },
            insertionReference
          );
        }

        if (typeof handleAppendToSelectedRow === "function") {
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
            insertionReference
          );
        }
      }
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
