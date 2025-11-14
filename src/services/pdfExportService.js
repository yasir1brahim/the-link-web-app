/**
 * PDF Export Service
 * Handles exporting PDFs with annotations from Spec View
 */

import WebViewer from '@pdftron/webviewer';
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

export const exportSections = async (config) => {
  // Implementation coming in next steps
  return null;
};
