import { exportSections, generatePdfFilename } from '../pdfExportService';

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
});
