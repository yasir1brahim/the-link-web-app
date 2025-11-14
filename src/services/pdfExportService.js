/**
 * PDF Export Service
 * Handles exporting PDFs with annotations from Spec View
 */

import WebViewer from '@pdftron/webviewer';
import JSZip from 'jszip';
import {
  QA_COLOR_MAP,
  EXTRACTION_COLOR_MAP,
  DEFAULT_RGB_COLOR,
  SUBMITTAL_RGB_COLOR,
} from '../components/SpecCentricView/highlightColorMaps';

const DEFAULT_COLOR = DEFAULT_RGB_COLOR;

/**
 * Sanitize filename by removing invalid characters
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[/\\?%*:|"<>]/g, '-');
};

/**
 * Generate PDF filename from spec section data
 * Format: {masterformat_number} - {document_name}.pdf
 */
export const generatePdfFilename = (section) => {
  const number = section.masterformat_number?.trim() || '';
  const name = section.document_name || 'document.pdf';

  // Ensure .pdf extension
  const sanitizedName = sanitizeFilename(name);
  const baseName = sanitizedName.endsWith('.pdf')
    ? sanitizedName
    : `${sanitizedName}.pdf`;

  if (number) {
    return `${number} - ${baseName}`;
  }

  return baseName;
};

/**
 * Convert hex color to RGB object
 */
export const hexToRgb = (hex) => {
  if (typeof hex !== 'string') {
    return null;
  }

  const sanitized = hex.trim().replace(/^#/, '').slice(0, 6);
  if (sanitized.length !== 6) {
    return null;
  }

  const numeric = Number.parseInt(sanitized, 16);
  if (Number.isNaN(numeric)) {
    return null;
  }

  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
};

/**
 * Get color for highlight based on item type, extraction type, or custom color
 */
export const getHighlightColor = (itemType, extractionType, customColorHex) => {
  // Custom color takes priority
  if (customColorHex) {
    const customColor = hexToRgb(customColorHex);
    if (customColor) {
      return customColor;
    }
  }

  // Check QA color map by item type
  if (itemType && QA_COLOR_MAP[itemType]) {
    return QA_COLOR_MAP[itemType];
  }

  // Check extraction color map
  if (extractionType && EXTRACTION_COLOR_MAP[extractionType]) {
    return EXTRACTION_COLOR_MAP[extractionType];
  }

  return DEFAULT_COLOR;
};

/**
 * Check if highlight is a custom type
 */
const isCustomHighlight = (highlight) => {
  return highlight?.extraction_type === 'custom_highlights' ||
         highlight?.custom_item_type?.id != null;
};

/**
 * Process highlights from section content into unified format
 */
export const processHighlightsForSection = (sectionContent, activeFilters, customItemTypes = []) => {
  const highlights = [];

  // Process submittal highlights
  if (sectionContent?.submittal_highlights) {
    sectionContent.submittal_highlights.forEach((highlight) => {
      if (!highlight?.text_location) return;

      const itemType = 'submittal';
      if (activeFilters && activeFilters.size > 0 && !activeFilters.has(itemType)) {
        return;
      }

      const color = SUBMITTAL_RGB_COLOR;

      // Main location
      highlights.push({
        page_no: highlight.text_location.page_no,
        x: highlight.text_location.x,
        y: highlight.text_location.y,
        width: highlight.text_location.width,
        height: highlight.text_location.height,
        color,
        item_type: itemType,
      });

      // Additional locations
      if (highlight.additional_text_locations) {
        highlight.additional_text_locations.forEach((loc) => {
          highlights.push({
            page_no: loc.page_no,
            x: loc.x,
            y: loc.y,
            width: loc.width,
            height: loc.height,
            color,
            item_type: itemType,
          });
        });
      }
    });
  }

  // Process AI log highlights
  if (sectionContent?.ai_log_highlights) {
    sectionContent.ai_log_highlights.forEach((logItem) => {
      if (!logItem?.pdf_locations || !Array.isArray(logItem.pdf_locations)) {
        return;
      }

      const isCustom = isCustomHighlight(logItem);
      let customTypeId = logItem?.custom_item_type?.id;
      if (!customTypeId && logItem?.item_type?.startsWith('custom_')) {
        customTypeId = parseInt(logItem.item_type.replace('custom_', ''), 10);
      }

      const itemTypeKey = customTypeId ? `custom_${customTypeId}` : logItem.item_type;

      // Check filter
      if (activeFilters && activeFilters.size > 0 && !activeFilters.has(itemTypeKey)) {
        return;
      }

      const matchedType = customTypeId
        ? customItemTypes.find((type) => type.id === customTypeId)
        : null;

      const highlightColorHex = isCustom
        ? logItem?.custom_item_type?.color || matchedType?.color || logItem?.color
        : logItem?.color;

      const color = getHighlightColor(
        logItem.item_type,
        logItem.extraction_type,
        highlightColorHex
      );

      logItem.pdf_locations.forEach((location) => {
        highlights.push({
          page_no: location.page_no,
          x: location.x,
          y: location.y,
          width: location.width,
          height: location.height,
          color,
          item_type: itemTypeKey,
          extraction_type: logItem.extraction_type,
        });
      });
    });
  }

  return highlights;
};

/**
 * Create a hidden WebViewer instance for exporting
 */
const createHiddenWebViewer = async (pdfUrl) => {
  // Create hidden container
  const container = document.createElement('div');
  container.style.display = 'none';
  container.style.width = '1px';
  container.style.height = '1px';
  document.body.appendChild(container);

  try {
    const instance = await WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: pdfUrl,
        disabledElements: ['ribbons'],
      },
      container
    );

    // Wait for document to load
    await new Promise((resolve, reject) => {
      const { documentViewer } = instance.Core;

      if (documentViewer.getDocument()) {
        resolve();
      } else {
        documentViewer.addEventListener('documentLoaded', resolve);
        documentViewer.addEventListener('error', reject);
      }
    });

    return { instance, container };
  } catch (error) {
    // Clean up container if WebViewer creation fails
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    throw error;
  }
};

/**
 * Destroy WebViewer instance and clean up DOM
 */
const destroyWebViewer = (instance, container) => {
  try {
    if (instance?.UI?.dispose) {
      instance.UI.dispose();
    }
  } catch (error) {
    console.warn('Error disposing WebViewer:', error);
  }

  try {
    if (container?.parentNode) {
      container.parentNode.removeChild(container);
    }
  } catch (error) {
    console.warn('Error removing container:', error);
  }
};

/**
 * Create Apryse annotations from highlight data
 */
const createAnnotationsFromHighlights = (instance, highlights) => {
  const { Annotations } = instance.Core;
  const annotationManager = instance.Core.annotationManager;
  const createdAnnotations = [];

  highlights.forEach((highlight) => {
    try {
      // Create annotation
      const annotation = new Annotations.TextHighlightAnnotation();

      // Set page (Apryse uses 1-based page numbers)
      annotation.PageNumber = highlight.page_no;

      // Create quad from highlight bounds
      const quad = new Annotations.Quad();
      quad.x1 = highlight.x;
      quad.y1 = highlight.y;
      quad.x2 = highlight.x + highlight.width;
      quad.y2 = highlight.y;
      quad.x3 = highlight.x + highlight.width;
      quad.y3 = highlight.y + highlight.height;
      quad.x4 = highlight.x;
      quad.y4 = highlight.y + highlight.height;

      annotation.Quads = [quad];

      // Set color (with alpha for visibility)
      annotation.StrokeColor = new Annotations.Color(
        highlight.color.r,
        highlight.color.g,
        highlight.color.b,
        0.25
      );
      annotation.FillColor = new Annotations.Color(
        highlight.color.r,
        highlight.color.g,
        highlight.color.b,
        0.25
      );

      // Add metadata
      annotation.Subject = highlight.item_type || 'highlight';

      // Add to annotation manager
      annotationManager.addAnnotation(annotation);
      createdAnnotations.push(annotation);
    } catch (error) {
      console.warn('Failed to create annotation:', error, highlight);
    }
  });

  // Trigger redraw
  annotationManager.drawAnnotationsFromList(createdAnnotations);

  return createdAnnotations;
};

/**
 * Export a single section PDF with annotations
 */
const exportSingleSection = async (
  section,
  highlights,
  { reuseExisting = false, instance: existingInstance = null } = {},
  progressCallback
) => {
  if (!section?.pdf_url) {
    throw new Error(`Section ${section?.id} has no PDF URL`);
  }

  const sectionLabel = `${section.masterformat_number || ''} ${section.custom_section_title || section.masterformat_title || ''}`.trim();

  if (progressCallback) {
    progressCallback({
      status: 'loading',
      message: `Loading ${sectionLabel || 'section'}...`,
    });
  }

  let instance = existingInstance;
  let container = null;
  let createdInstance = false;
  let annotationsToCleanup = [];

  try {
    if (!instance) {
      ({ instance, container } = await createHiddenWebViewer(section.pdf_url));
      createdInstance = true;
    }

    if (progressCallback) {
      progressCallback({
        status: 'processing',
        message: `Preparing annotations for ${sectionLabel || 'section'}...`,
      });
    }

    // Create annotations and remember what we added so we can clean up if reused
    annotationsToCleanup = createAnnotationsFromHighlights(instance, highlights) || [];

    if (progressCallback) {
      progressCallback({
        status: 'exporting',
        message: `Exporting ${sectionLabel || 'section'}...`,
      });
    }

    const doc = instance.Core.documentViewer.getDocument();
    const data = await doc.getFileData({ downloadType: 'pdf' });
    const blob = new Blob([data], { type: 'application/pdf' });

    return {
      filename: generatePdfFilename(section),
      blob,
      section,
    };
  } finally {
    if (reuseExisting && instance?.Core?.annotationManager && annotationsToCleanup.length > 0) {
      try {
        instance.Core.annotationManager.deleteAnnotations(annotationsToCleanup);
      } catch (cleanupError) {
        console.warn('Failed to clean up annotations after export:', cleanupError);
      }
    }

    if (createdInstance && instance && container) {
      destroyWebViewer(instance, container);
    }
  }
};

/**
 * Main export function
 * @param {Object} config - Export configuration
 * @param {Array} config.sections - Array of spec sections to export
 * @param {Object} config.highlightsBySectionId - Map of section ID to highlights array
 * @param {Set} config.activeFilters - Active filter set
 * @param {Array} config.customItemTypes - Custom item types
 * @param {Function} config.progressCallback - Progress callback function
 * @param {number} config.currentSectionId - ID of the section currently loaded in the viewer
 * @param {Object} config.currentViewerContext - Active WebViewer instance/context for the current section
 */
export const exportSections = async (config) => {
  const {
    sections,
    highlightsBySectionId,
    activeFilters,
    customItemTypes = [],
    progressCallback,
    currentSectionId = null,
    currentViewerContext = null,
  } = config;

  if (!sections || sections.length === 0) {
    throw new Error('No sections provided for export');
  }

  const results = [];

  // Export sections sequentially to manage memory
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const highlights = highlightsBySectionId[section.id] || [];
    const isActiveSection = currentSectionId != null && section.id === currentSectionId && currentViewerContext?.instance;

    if (progressCallback) {
      progressCallback({
        status: 'progress',
        current: i + 1,
        total: sections.length,
        section,
      });
    }

    try {
      const result = await exportSingleSection(
        section,
        highlights,
        isActiveSection
          ? { reuseExisting: true, instance: currentViewerContext.instance }
          : {},
        progressCallback
      );
      results.push(result);
    } catch (error) {
      console.error(`Failed to export section ${section.id}:`, error);

      // Record error but continue with other sections
      results.push({
        filename: generatePdfFilename(section),
        error: error.message,
        section,
      });
    }
  }

  return results;
};

/**
 * Create ZIP archive from multiple PDF files
 */
export const createZipArchive = async (files) => {
  const zip = new JSZip();

  files.forEach((file) => {
    // Skip files with errors
    if (file.error || !file.blob) {
      return;
    }

    zip.file(file.filename, file.blob);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
};

/**
 * Generate ZIP filename with timestamp
 */
export const generateZipFilename = () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `Spec Sections Export - ${dateStr}.zip`;
};

/**
 * Trigger browser download for a blob
 */
export const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // Clean up the object URL
    URL.revokeObjectURL(url);
  }
};

/**
 * Handle download for export results
 * - Single file: Download PDF directly
 * - Multiple files: Create and download ZIP
 */
export const downloadExportResults = async (results) => {
  // Filter out results with errors
  const successfulResults = results.filter((result) => result.blob && !result.error);

  if (successfulResults.length === 0) {
    throw new Error('No successful exports to download');
  }

  if (successfulResults.length === 1) {
    // Single file - download directly
    triggerDownload(successfulResults[0].blob, successfulResults[0].filename);
  } else {
    // Multiple files - create ZIP
    const zipBlob = await createZipArchive(successfulResults);
    const zipFilename = generateZipFilename();
    triggerDownload(zipBlob, zipFilename);
  }
};
