/**
 * PDF Export Service
 * Handles exporting PDFs with annotations from Spec View
 */

import {
  QA_COLOR_MAP,
  EXTRACTION_COLOR_MAP,
  DEFAULT_RGB_COLOR,
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

export const exportSections = async (config) => {
  // Implementation coming in next steps
  return null;
};
