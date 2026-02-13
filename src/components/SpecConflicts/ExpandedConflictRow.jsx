import React, { useEffect, useRef, useState, useCallback } from 'react';
import WebViewer from '@pdftron/webviewer';
import './ExpandedConflictRow.css';

/**
 * Strip query parameters from a URL to get the base file path.
 * Pre-signed S3 URLs for the same file share the same path but differ in
 * signature query params — comparing base URLs detects same-file references.
 */
const getBaseUrl = (url) => {
  if (!url) return null;
  try {
    const { origin, pathname } = new URL(url);
    return origin + pathname;
  } catch {
    return url;
  }
};

const ExpandedConflictRow = ({ conflict }) => {
  const drawingContainerRef = useRef(null);
  const specContainerRef = useRef(null);
  const drawingViewerRef = useRef(null);
  const specViewerRef = useRef(null);
  const [drawingLoading, setDrawingLoading] = useState(true);
  const [specLoading, setSpecLoading] = useState(true);

  // Track loaded documents to detect when a new file needs loading.
  // Drawing uses the base URL (path without query params).
  // Spec uses spec_file_s3_key — a stable identifier the API provides that
  // doesn't vary with pre-signed URL format differences.
  const loadedDrawingUrlRef = useRef(null);
  const loadedSpecKeyRef = useRef(null);

  // Keep latest conflict in a ref for use inside async event handlers
  const conflictRef = useRef(conflict);
  useEffect(() => { conflictRef.current = conflict; }, [conflict]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Track annotations we create so we can reliably clear them
  const drawingAnnotationsRef = useRef([]);
  const specAnnotationsRef = useRef([]);

  // Reapply drawing annotations using latest conflict data
  const applyDrawingAnnotations = useCallback((instance) => {
    const c = conflictRef.current;
    const { documentViewer, annotationManager, Annotations } = instance.Core;

    // Must set ReadOnly to false before deletion or annotations won't be removed
    if (drawingAnnotationsRef.current.length > 0) {
      drawingAnnotationsRef.current.forEach(annot => { annot.ReadOnly = false; });
      annotationManager.deleteAnnotations(drawingAnnotationsRef.current);
      drawingAnnotationsRef.current = [];
    }

    if (c.drawing_bounding_box && c.drawing_page_number) {
      const [x1, y1, x2, y2] = c.drawing_bounding_box;
      const rect = new Annotations.RectangleAnnotation({
        PageNumber: c.drawing_page_number,
        X: x1,
        Y: y1,
        Width: x2 - x1,
        Height: y2 - y1,
        StrokeColor: new Annotations.Color(255, 193, 7, 1),
        StrokeThickness: 2,
        FillColor: new Annotations.Color(255, 193, 7, 0.3),
        ReadOnly: true,
      });
      annotationManager.addAnnotation(rect);
      annotationManager.redrawAnnotation(rect);
      documentViewer.setCurrentPage(c.drawing_page_number);
      annotationManager.jumpToAnnotation(rect);
      drawingAnnotationsRef.current = [rect];
    }
  }, []);

  // Reapply spec annotations using latest conflict data
  const applySpecAnnotations = useCallback((instance) => {
    const c = conflictRef.current;
    const { documentViewer, annotationManager, Annotations } = instance.Core;

    // Must set ReadOnly to false before deletion or annotations won't be removed
    if (specAnnotationsRef.current.length > 0) {
      specAnnotationsRef.current.forEach(annot => { annot.ReadOnly = false; });
      annotationManager.deleteAnnotations(specAnnotationsRef.current);
      specAnnotationsRef.current = [];
    }

    if (c.pdf_locations && c.pdf_locations.length > 0) {
      const loc = c.pdf_locations[0];
      const rect = new Annotations.RectangleAnnotation({
        PageNumber: loc.page_no,
        X: loc.x,
        Y: loc.y,
        Width: loc.width,
        Height: loc.height,
        StrokeColor: new Annotations.Color(255, 193, 7, 1),
        StrokeThickness: 2,
        FillColor: new Annotations.Color(255, 193, 7, 0.3),
        ReadOnly: true,
      });
      annotationManager.addAnnotation(rect);
      annotationManager.redrawAnnotation(rect);
      documentViewer.setCurrentPage(loc.page_no);
      annotationManager.jumpToAnnotation(rect);
      specAnnotationsRef.current = [rect];
    }
  }, []);

  // Initialize drawing viewer once on mount
  useEffect(() => {
    if (!drawingContainerRef.current) return;
    let disposed = false;

    const init = async () => {
      try {
        if (!mountedRef.current) return;
        const instance = await WebViewer(
          {
            path: '/webviewer/lib',
            licenseKey:
              'Thelinkai  Inc :PWS:Thelinkai  Inc ::B+2:9D34C842CB60BB40A8EF77436A7DEE579B3C140AD8EFE6EE4ED826BD',
            initialDoc: conflictRef.current.drawing_file_url,
          },
          drawingContainerRef.current
        );

        if (disposed || !mountedRef.current) {
          instance.UI.dispose();
          return;
        }

        drawingViewerRef.current = instance;
        loadedDrawingUrlRef.current = getBaseUrl(conflictRef.current.drawing_file_url);

        instance.Core.documentViewer.addEventListener('documentLoaded', () => {
          if (!mountedRef.current) return;
          // Verify the loaded document still matches the current conflict —
          // the user may have switched conflicts while a document was loading.
          const currentBase = getBaseUrl(conflictRef.current.drawing_file_url);
          if (loadedDrawingUrlRef.current !== currentBase) {
            loadedDrawingUrlRef.current = currentBase;
            instance.Core.documentViewer.loadDocument(conflictRef.current.drawing_file_url);
            return;
          }
          setDrawingLoading(false);
          applyDrawingAnnotations(instance);
        });
      } catch (error) {
        console.error('Failed to initialize drawing viewer:', error);
        if (mountedRef.current) setDrawingLoading(false);
      }
    };

    init();

    return () => {
      disposed = true;
      if (drawingViewerRef.current) {
        drawingViewerRef.current.UI.dispose();
        drawingViewerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize spec viewer once on mount
  useEffect(() => {
    if (!specContainerRef.current) return;
    let disposed = false;

    const init = async () => {
      try {
        if (!mountedRef.current) return;
        const instance = await WebViewer(
          {
            path: '/webviewer/lib',
            licenseKey:
              'Thelinkai  Inc :PWS:Thelinkai  Inc ::B+2:9D34C842CB60BB40A8EF77436A7DEE579B3C140AD8EFE6EE4ED826BD',
            initialDoc: conflictRef.current.spec_file_url,
          },
          specContainerRef.current
        );

        if (disposed || !mountedRef.current) {
          instance.UI.dispose();
          return;
        }

        specViewerRef.current = instance;
        loadedSpecKeyRef.current = conflictRef.current.spec_file_s3_key;

        instance.Core.documentViewer.addEventListener('documentLoaded', () => {
          if (!mountedRef.current) return;
          const currentKey = conflictRef.current.spec_file_s3_key;
          if (loadedSpecKeyRef.current !== currentKey) {
            loadedSpecKeyRef.current = currentKey;
            instance.Core.documentViewer.loadDocument(conflictRef.current.spec_file_url);
            return;
          }
          setSpecLoading(false);
          applySpecAnnotations(instance);
        });
      } catch (error) {
        console.error('Failed to initialize spec viewer:', error);
        if (mountedRef.current) setSpecLoading(false);
      }
    };

    init();

    return () => {
      disposed = true;
      if (specViewerRef.current) {
        specViewerRef.current.UI.dispose();
        specViewerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle conflict changes — drawing viewer
  useEffect(() => {
    const instance = drawingViewerRef.current;
    if (!instance || !conflict.drawing_file_url) return;

    const newBase = getBaseUrl(conflict.drawing_file_url);
    if (loadedDrawingUrlRef.current === newBase) {
      // Same file — just update annotations and navigation
      applyDrawingAnnotations(instance);
    } else {
      // Different file — load it; documentLoaded handler applies annotations
      setDrawingLoading(true);
      loadedDrawingUrlRef.current = newBase;
      instance.Core.documentViewer.loadDocument(conflict.drawing_file_url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conflict.id]);

  // Handle conflict changes — spec viewer
  useEffect(() => {
    const instance = specViewerRef.current;
    if (!instance || !conflict.spec_file_url) return;

    const newKey = conflict.spec_file_s3_key;
    if (loadedSpecKeyRef.current === newKey) {
      // Same file — just update annotations and navigation
      applySpecAnnotations(instance);
    } else {
      // Different file — load it; documentLoaded handler applies annotations
      setSpecLoading(true);
      loadedSpecKeyRef.current = newKey;
      instance.Core.documentViewer.loadDocument(conflict.spec_file_url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conflict.id]);

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
