import React, { useEffect, useRef, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import './ExpandedConflictRow.css';

const ExpandedConflictRow = ({ conflict }) => {
  const drawingContainerRef = useRef(null);
  const specContainerRef = useRef(null);
  const drawingViewerRef = useRef(null);
  const specViewerRef = useRef(null);
  const [drawingLoading, setDrawingLoading] = useState(true);
  const [specLoading, setSpecLoading] = useState(true);

  // Race condition guards
  const drawingInitializingRef = useRef(false);
  const specInitializingRef = useRef(false);
  const mountedRef = useRef(true);

  // Track mounted state for async operations
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Initialize drawing PDF viewer
  useEffect(() => {
    if (!drawingContainerRef.current || !conflict.drawing_file_url) return;
    if (drawingInitializingRef.current) return; // Prevent duplicate init

    let instance = null;
    drawingInitializingRef.current = true;

    const initDrawingViewer = async () => {
      try {
        if (!mountedRef.current) return; // Check if still mounted
        instance = await WebViewer(
          {
            path: '/webviewer/lib',
            licenseKey: process.env.REACT_APP_PDFTRON_LICENSE,
            initialDoc: conflict.drawing_file_url,
          },
          drawingContainerRef.current
        );

        drawingViewerRef.current = instance;

        const { documentViewer, annotationManager, Annotations } = instance.Core;

        documentViewer.addEventListener('documentLoaded', () => {
          if (!mountedRef.current) return; // Exit early if unmounted
          setDrawingLoading(false);

          // Add highlight annotation if bounding box exists
          if (conflict.drawing_bounding_box && conflict.drawing_page_number) {
            const [x1, y1, x2, y2] = conflict.drawing_bounding_box;
            const rect = new Annotations.RectangleAnnotation({
              PageNumber: conflict.drawing_page_number,
              X: x1,
              Y: y1,
              Width: x2 - x1,
              Height: y2 - y1,
              StrokeColor: new Annotations.Color(255, 193, 7, 1),
              StrokeThickness: 2,
              FillColor: new Annotations.Color(255, 193, 7, 0.3),
            });
            annotationManager.addAnnotation(rect);
            annotationManager.redrawAnnotation(rect);

            // Jump to annotation
            documentViewer.setCurrentPage(conflict.drawing_page_number);
            annotationManager.jumpToAnnotation(rect);
          }
        });
      } catch (error) {
        console.error('Failed to initialize drawing viewer:', error);
        if (mountedRef.current) setDrawingLoading(false);
      } finally {
        drawingInitializingRef.current = false;
      }
    };

    initDrawingViewer();

    return () => {
      if (drawingViewerRef.current) {
        drawingViewerRef.current.UI.dispose();
        drawingViewerRef.current = null;
      }
      drawingInitializingRef.current = false;
    };
  }, [conflict.drawing_file_url, conflict.drawing_bounding_box, conflict.drawing_page_number]);

  // Initialize spec PDF viewer
  useEffect(() => {
    if (!specContainerRef.current || !conflict.spec_file_url) return;
    if (specInitializingRef.current) return; // Prevent duplicate init

    let instance = null;
    specInitializingRef.current = true;

    const initSpecViewer = async () => {
      try {
        if (!mountedRef.current) return; // Check if still mounted
        instance = await WebViewer(
          {
            path: '/webviewer/lib',
            licenseKey: process.env.REACT_APP_PDFTRON_LICENSE,
            initialDoc: conflict.spec_file_url,
          },
          specContainerRef.current
        );

        specViewerRef.current = instance;

        const { documentViewer, annotationManager, Annotations } = instance.Core;

        documentViewer.addEventListener('documentLoaded', () => {
          if (!mountedRef.current) return; // Exit early if unmounted
          setSpecLoading(false);

          // Add highlight annotation if pdf_locations exists
          if (conflict.pdf_locations && conflict.pdf_locations.length > 0) {
            const loc = conflict.pdf_locations[0];
            const rect = new Annotations.RectangleAnnotation({
              PageNumber: loc.page_no,
              X: loc.x,
              Y: loc.y,
              Width: loc.width,
              Height: loc.height,
              StrokeColor: new Annotations.Color(255, 193, 7, 1),
              StrokeThickness: 2,
              FillColor: new Annotations.Color(255, 193, 7, 0.3),
            });
            annotationManager.addAnnotation(rect);
            annotationManager.redrawAnnotation(rect);

            // Jump to annotation
            documentViewer.setCurrentPage(loc.page_no);
            annotationManager.jumpToAnnotation(rect);
          }
        });
      } catch (error) {
        console.error('Failed to initialize spec viewer:', error);
        if (mountedRef.current) setSpecLoading(false);
      } finally {
        specInitializingRef.current = false;
      }
    };

    initSpecViewer();

    return () => {
      if (specViewerRef.current) {
        specViewerRef.current.UI.dispose();
        specViewerRef.current = null;
      }
      specInitializingRef.current = false;
    };
  }, [conflict.spec_file_url, conflict.pdf_locations]);

  const drawingTitle = [conflict.sheet_number, conflict.sheet_title]
    .filter(Boolean)
    .join(' - ') || 'Drawing';

  const specTitle = `Spec ${conflict.spec_masterformat_number || ''} (p. ${conflict.spec_page_number || '?'})`;

  return (
    <div className="expanded-conflict-row">
      <div className="pdf-pane">
        <div className="pdf-pane-header">{drawingTitle}</div>
        <div className="pdf-pane-content">
          {drawingLoading && <div className="pdf-pane-loading">Loading drawing...</div>}
          <div ref={drawingContainerRef} className="pdf-viewer-container" />
        </div>
      </div>
      <div className="pdf-pane">
        <div className="pdf-pane-header">{specTitle}</div>
        <div className="pdf-pane-content">
          {specLoading && <div className="pdf-pane-loading">Loading spec...</div>}
          <div ref={specContainerRef} className="pdf-viewer-container" />
        </div>
      </div>
    </div>
  );
};

export default ExpandedConflictRow;
