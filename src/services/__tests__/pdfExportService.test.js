import { exportSections, generatePdfFilename, hexToRgb, getHighlightColor } from '../pdfExportService';

describe('PdfExportService', () => {
  describe('exportSections', () => {
    it('should be a function', () => {
      expect(typeof exportSections).toBe('function');
    });
  });

  describe('generatePdfFilename', () => {
    it('should generate filename with masterformat number and document name', () => {
      const section = {
        masterformat_number: '03 30 00',
        document_name: 'Cast-in-Place Concrete.pdf'
      };
      const result = generatePdfFilename(section);
      expect(result).toBe('03 30 00 - Cast-in-Place Concrete.pdf');
    });

    it('should handle sections without masterformat number', () => {
      const section = {
        masterformat_number: '',
        document_name: 'General.pdf'
      };
      const result = generatePdfFilename(section);
      expect(result).toBe('General.pdf');
    });

    it('should sanitize invalid filename characters', () => {
      const section = {
        masterformat_number: '01 00 00',
        document_name: 'Test/File:Name*.pdf'
      };
      const result = generatePdfFilename(section);
      expect(result).toBe('01 00 00 - Test-File-Name-.pdf');
    });
  });

  describe('hexToRgb', () => {
    it('should convert hex color to RGB object', () => {
      const result = hexToRgb('#FF0000');
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle hex without # prefix', () => {
      const result = hexToRgb('00FF00');
      expect(result).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should return null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('')).toBeNull();
    });
  });

  describe('getHighlightColor', () => {
    it('should return color for known item type', () => {
      const result = getHighlightColor('inspections', null, null);
      expect(result).toEqual({ r: 255, g: 99, b: 71 });
    });

    it('should return color for extraction type', () => {
      const result = getHighlightColor(null, 'qa_planner', null);
      expect(result).toEqual({ r: 100, g: 149, b: 237 });
    });

    it('should prioritize custom color from hex', () => {
      const result = getHighlightColor('inspections', 'qa_planner', '#FF00FF');
      expect(result).toEqual({ r: 255, g: 0, b: 255 });
    });

    it('should return default color if no match', () => {
      const result = getHighlightColor(null, null, null);
      expect(result).toEqual({ r: 59, g: 130, b: 246 });
    });
  });
});
