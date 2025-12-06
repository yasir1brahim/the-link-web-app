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

// Sticky note icon vertical offset - Apryse sticky notes anchor from bottom of icon
const STICKY_NOTE_ICON_OFFSET = 20;

// Sticky note appearance configuration
const STICKY_NOTE_SIZE = 1; // Smaller icon size (default is ~25)
const STICKY_NOTE_COLOR = { r: 255, g: 245, b: 120 }; // Lighter yellow

/**
 * Calculate sticky note position based on highlight location
 * Positions the icon at the right side of the highlight, vertically aligned
 */
function calculateStickyPosition(highlightLocation) {
  const { x, y, width } = highlightLocation;

  // Position at the right edge of the highlight, offset upward to align with text
  const calcX = Math.max(0, x + (width || 0));
  const calcY = Math.max(0, y - STICKY_NOTE_ICON_OFFSET);

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
  // Convert to string for comparison since WebViewer's getCustomData may return strings
  const idStr = String(extractedDataId);
  return allAnnotations.find(annot =>
    isExtractionNoteParent(annot) &&
    String(annot.getCustomData('extracted_data_id')) === idStr
  );
}

/**
 * Create sticky note annotations for an ExtractedData item with notes
 */
function createNotesForExtractedData(extractedData, webViewer, currentUserId) {
  const { annotationManager, Annotations } = webViewer.Core;

  // Safety checks
  if (!extractedData.notes || extractedData.notes.length === 0) {
    console.log('[NOTE_DEBUG] No notes for ExtractedData:', extractedData.id);
    return;
  }

  if (!extractedData.pdf_locations || extractedData.pdf_locations.length === 0) {
    console.warn(`[NOTE_DEBUG] ExtractedData ${extractedData.id} has no PDF locations, skipping notes`);
    return;
  }

  console.log('[NOTE_DEBUG] Creating sticky notes for ExtractedData:', extractedData.id, 'with', extractedData.notes.length, 'notes');

  const firstLocation = extractedData.pdf_locations[0];
  const position = calculateStickyPosition(firstLocation);

  // First note becomes the parent sticky (with content), subsequent notes become replies
  const [firstNote, ...remainingNotes] = extractedData.notes;

  // Create parent sticky note with first note's content
  const parentSticky = new Annotations.StickyAnnotation({
    PageNumber: firstLocation.page_no,
    X: position.x,
    Y: position.y,
    SIZE: STICKY_NOTE_SIZE,
    Icon: Annotations.StickyAnnotation.IconNames.COMMENT,
    StrokeColor: new Annotations.Color(STICKY_NOTE_COLOR.r, STICKY_NOTE_COLOR.g, STICKY_NOTE_COLOR.b, 1),
    FillColor: new Annotations.Color(STICKY_NOTE_COLOR.r, STICKY_NOTE_COLOR.g, STICKY_NOTE_COLOR.b, 1),
  });

  parentSticky.setContents(firstNote.text);
  parentSticky.Author = firstNote.created_by_name || 'Unknown';
  parentSticky.setCustomData('extracted_data_id', extractedData.id);
  parentSticky.setCustomData('extraction_note_id', firstNote.id);
  parentSticky.setCustomData('created_by_id', firstNote.created_by_id);
  parentSticky.ReadOnly = firstNote.created_by_id !== currentUserId;

  console.log('[NOTE_DEBUG] Adding parent sticky annotation at page:', firstLocation.page_no, 'position:', position);
  annotationManager.addAnnotation(parentSticky, { imported: true });
  console.log('[NOTE_DEBUG] Parent sticky added with ID:', parentSticky.Id);

  // Create reply annotations for remaining notes (if any)
  const replies = remainingNotes.map(note => {
    const reply = new Annotations.StickyAnnotation({
      PageNumber: firstLocation.page_no,
      X: position.x,
      Y: position.y,
      SIZE: STICKY_NOTE_SIZE,
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

  if (replies.length > 0) {
    console.log('[NOTE_DEBUG] Adding', replies.length, 'reply annotations');
    annotationManager.addAnnotations(replies, { imported: true });
  }
  console.log('[NOTE_DEBUG] Drawing annotations');
  annotationManager.drawAnnotationsFromList([parentSticky, ...replies]);
  console.log('[NOTE_DEBUG] Sticky notes creation complete for ExtractedData:', extractedData.id);
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
  }, [stableHighlightLocations, stableAiLogHighlightLocations, documentLoaded, activeFiltersString, extractedDataItems]);

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
     * Check if current user can edit annotation
     */
    const canEditAnnotation = (annotation, currentUserId) => {
      const createdById = annotation.getCustomData('created_by_id');
      return createdById && createdById === currentUserId;
    };

    /**
     * Check if annotation is an extraction note (parent or reply)
     */
    const isExtractionNote = (annot) => {
      return annot instanceof Annotations.StickyAnnotation &&
             annot.getCustomData('extracted_data_id');
    };

    /**
     * Handle annotation add/modify events
     */
    const handleAnnotationChanged = async (annotations, action, { imported }) => {
      if (imported) return; // Skip annotations loaded from backend

      for (const annot of annotations) {
        // Handle both parent sticky notes and replies
        if (!isExtractionNote(annot)) {
          continue;
        }

        const extractedDataId = annot.getCustomData('extracted_data_id');
        const noteId = annot.getCustomData('extraction_note_id');
        const noteText = annot.getContents();

        // Handle modify action (editing existing note)
        if (action === 'modify' && noteId) {
          // Permission check (safety net - ReadOnly should prevent this)
          if (!canEditAnnotation(annot, currentUserId)) {
            console.error('Unauthorized note modification attempt');
            const previousText = annot._originalContents;
            if (previousText) {
              annot.setContents(previousText);
              annotationManager.redrawAnnotation(annot);
            }
            toast.error('You can only edit your own notes');
            continue;
          }

          const previousText = annot._originalContents || annot.getCustomData('_previous_contents');

          try {
            await api.updateExtractionNote(
              projectId,
              extractedDataId,
              noteId,
              { text: noteText }
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
          continue;
        }

        // Handle new note creation (either new parent with content, or new reply)
        if ((action === 'add' || action === 'modify') && !noteId && noteText && noteText.trim()) {
          try {
            const note = await api.createExtractionNote(
              projectId,
              extractedDataId,
              { text: noteText }
            );

            // Update annotation with backend note ID
            annot.setCustomData('extraction_note_id', note.id);
            annot.setCustomData('created_by_id', note.created_by_id);
            // Lock the annotation after saving
            annot.ReadOnly = note.created_by_id !== currentUserId;
            annotationManager.redrawAnnotation(annot);
          } catch (error) {
            handleError(error, 'Failed to create note');
            // Rollback: delete the annotation without firing events
            annotationManager.deleteAnnotation(annot, false, true);
          }
          continue;
        }

        // Handle empty note (user clicked away without typing)
        if (action === 'modify' && !noteId && (!noteText || !noteText.trim())) {
          // Delete empty sticky notes that were never saved
          annotationManager.deleteAnnotation(annot, false, true);
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

      // Create new sticky note - user will type directly into this
      const extractedData = getExtractedDataById ? getExtractedDataById(extractedDataId) : null;

      if (!extractedData || !extractedData.pdf_locations || extractedData.pdf_locations.length === 0) {
        console.warn(`Cannot create sticky note: ExtractedData ${extractedDataId} has no PDF locations`);
        return;
      }

      const firstLocation = extractedData.pdf_locations[0];
      const position = calculateStickyPosition(firstLocation);

      const newSticky = new Annotations.StickyAnnotation({
        PageNumber: firstLocation.page_no,
        X: position.x,
        Y: position.y,
        SIZE: STICKY_NOTE_SIZE,
        Icon: Annotations.StickyAnnotation.IconNames.COMMENT,
        StrokeColor: new Annotations.Color(STICKY_NOTE_COLOR.r, STICKY_NOTE_COLOR.g, STICKY_NOTE_COLOR.b, 1),
        FillColor: new Annotations.Color(STICKY_NOTE_COLOR.r, STICKY_NOTE_COLOR.g, STICKY_NOTE_COLOR.b, 1),
      });

      newSticky.setContents('');
      newSticky.setCustomData('extracted_data_id', extractedDataId);
      // Not read-only - user will type the first comment directly into this
      newSticky.ReadOnly = false;

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

      // Open notes panel when clicking on a sticky annotation (comment icon)
      if (selectedAnnot instanceof Annotations.StickyAnnotation) {
        webViewer.UI.openElement('notesPanel');
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
              SIZE: STICKY_NOTE_SIZE, 
              InReplyTo: annotCopy.parentId,
              ReplyType: 'Group',
              StrokeColor: new Annotations.Color(STICKY_NOTE_COLOR.r, STICKY_NOTE_COLOR.g, STICKY_NOTE_COLOR.b, 1),
              FillColor: new Annotations.Color(STICKY_NOTE_COLOR.r, STICKY_NOTE_COLOR.g, STICKY_NOTE_COLOR.b, 1),
              Icon: Annotations.StickyAnnotation.IconNames.COMMENT,
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
      // Only create if they don't already exist
      if (extractedDataItems && extractedDataItems.length > 0) {
        console.log('[NOTE_DEBUG] Processing extractedDataItems:', extractedDataItems.length);
        extractedDataItems.forEach(data => {
          console.log('[NOTE_DEBUG] Processing item:', data.id, 'notes:', data.notes?.length || 0);

          // Check if sticky note already exists for this extracted data
          const existingSticky = findStickyNoteForExtractedData(data.id, annotationManager);
          if (existingSticky) {
            console.log('[NOTE_DEBUG] Sticky note already exists for item:', data.id);
            return;
          }

          createNotesForExtractedData(data, tmpViewer, currentUserId);
        });
      } else {
        console.log('[NOTE_DEBUG] No extractedDataItems to process');
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

          // Only show notes panel in spec view mode
          if (isSpecViewMode) {
            // Notes panel starts closed by default - user can open via toggle button

            // Filter notes panel to only show sticky annotations (comments), not highlight rectangles
            _webViewer.UI.setCustomNoteFilter(annot =>
              annot instanceof _webViewer.Core.Annotations.StickyAnnotation
            );

            // Disable reply feature to keep things simple (one comment per highlight)
            _webViewer.UI.disableReplyForAnnotations(() => true);
          }
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
      const elementsToDisable = [
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
      ];

      // Hide notes toggle button when not in spec view mode
      if (!isSpecViewMode) {
        elementsToDisable.push("toggleNotesButton");
      }

      _webViewer.UI.disableElements(elementsToDisable);

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
