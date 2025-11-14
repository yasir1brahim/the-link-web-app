import { exportSections, generatePdfFilename, hexToRgb, getHighlightColor, processHighlightsForSection, createZipArchive, triggerDownload, downloadExportResults } from '../pdfExportService';

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

  describe('processHighlightsForSection', () => {
    const sectionContent = {
      submittal_highlights: [
        {
          text_location: {
            page_no: 1,
            x: 100,
            y: 200,
            width: 150,
            height: 20
          },
          additional_text_locations: []
        }
      ],
      ai_log_highlights: [
        {
          item_type: 'inspections',
          extraction_type: 'qa_planner',
          pdf_locations: [
            {
              page_no: 2,
              x: 50,
              y: 100,
              width: 200,
              height: 30
            }
          ]
        }
      ]
    };

    const activeFilters = new Set(['inspections', 'submittal']);

    it('should process highlights into unified format', () => {
      const result = processHighlightsForSection(sectionContent, activeFilters, []);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should filter highlights based on active filters', () => {
      const filteredOut = new Set(['warranties']);
      const result = processHighlightsForSection(sectionContent, filteredOut, []);

      // Should not include inspections highlight
      const hasInspections = result.some(h => h.item_type === 'inspections');
      expect(hasInspections).toBe(false);
    });

    it('should include color data for each highlight', () => {
      const result = processHighlightsForSection(sectionContent, activeFilters, []);
      result.forEach(highlight => {
        expect(highlight.color).toBeDefined();
        expect(highlight.color.r).toBeDefined();
        expect(highlight.color.g).toBeDefined();
        expect(highlight.color.b).toBeDefined();
      });
    });
  });

  describe('exportSingleSection (integration)', () => {
    // Note: This test requires mocking WebViewer, which is complex
    // For now, we'll test the structure without full WebViewer mock

    it('should return error in results if PDF URL is missing', async () => {
      const section = {
        id: 1,
        pdf_url: null,
        masterformat_number: '01 00 00',
        document_name: 'Test.pdf'
      };
      const highlights = [];

      const results = await exportSections({
        sections: [section],
        highlightsBySectionId: { 1: highlights },
        activeFilters: new Set(),
        customItemTypes: []
      });

      expect(results).toHaveLength(1);
      expect(results[0]).toHaveProperty('error');
      expect(results[0].error).toContain('no PDF URL');
    });
  });

  describe('createZipArchive', () => {
    it('should create ZIP from PDF blobs', async () => {
      const files = [
        {
          filename: '01 00 00 - General.pdf',
          blob: new Blob(['fake pdf 1'], { type: 'application/pdf' }),
        },
        {
          filename: '02 00 00 - Site.pdf',
          blob: new Blob(['fake pdf 2'], { type: 'application/pdf' }),
        },
      ];

      const zipBlob = await createZipArchive(files);

      expect(zipBlob).toBeInstanceOf(Blob);
      expect(zipBlob.type).toBe('application/zip');
      expect(zipBlob.size).toBeGreaterThan(0);
    });

    it('should skip files with errors', async () => {
      const files = [
        {
          filename: '01 00 00 - General.pdf',
          blob: new Blob(['fake pdf'], { type: 'application/pdf' }),
        },
        {
          filename: '02 00 00 - Error.pdf',
          error: 'Failed to load',
        },
      ];

      const zipBlob = await createZipArchive(files);
      expect(zipBlob).toBeInstanceOf(Blob);
    });
  });

  describe('triggerDownload', () => {
    let mockAnchor;
    let createElementSpy;
    let originalURL;

    beforeEach(() => {
      mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
        style: {},
      };

      // Save original URL and mock it
      originalURL = global.URL;
      global.URL = {
        createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: jest.fn(),
      };

      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
      global.URL = originalURL;
    });

    it('should trigger download for a blob', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      const filename = 'test.pdf';

      triggerDownload(blob, filename);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(mockAnchor.href).toBe('blob:mock-url');
      expect(mockAnchor.download).toBe(filename);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle cleanup even if download fails', () => {
      const blob = new Blob(['test'], { type: 'application/pdf' });
      mockAnchor.click.mockImplementation(() => {
        throw new Error('Download failed');
      });

      expect(() => triggerDownload(blob, 'test.pdf')).toThrow('Download failed');
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('downloadExportResults', () => {
    let originalURL;
    let mockCreateObjectURL;
    let mockRevokeObjectURL;

    beforeEach(() => {
      // Save original URL and mock it
      originalURL = global.URL;
      mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      mockRevokeObjectURL = jest.fn();
      global.URL = {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      };

      // Mock document methods
      document.createElement = jest.fn().mockReturnValue({
        href: '',
        download: '',
        click: jest.fn(),
        style: {},
      });
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
      global.URL = originalURL;
    });

    it('should download single PDF directly', async () => {
      const results = [
        {
          filename: '01 00 00 - General.pdf',
          blob: new Blob(['pdf content'], { type: 'application/pdf' }),
        },
      ];

      await downloadExportResults(results);

      // Verify triggerDownload was called with correct parameters
      expect(mockCreateObjectURL).toHaveBeenCalledWith(results[0].blob);
      expect(document.createElement).toHaveBeenCalledWith('a');
      const mockAnchor = document.createElement.mock.results[0].value;
      expect(mockAnchor.download).toBe(results[0].filename);
    });

    it('should create ZIP for multiple PDFs', async () => {
      const results = [
        {
          filename: '01 00 00 - General.pdf',
          blob: new Blob(['pdf 1'], { type: 'application/pdf' }),
        },
        {
          filename: '02 00 00 - Site.pdf',
          blob: new Blob(['pdf 2'], { type: 'application/pdf' }),
        },
      ];

      await downloadExportResults(results);

      // Verify a blob was created and downloaded
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
      const downloadedBlob = mockCreateObjectURL.mock.calls[0][0];
      expect(downloadedBlob).toBeInstanceOf(Blob);

      // Verify filename matches ZIP pattern
      const mockAnchor = document.createElement.mock.results[0].value;
      expect(mockAnchor.download).toMatch(/Spec Sections Export - \d{4}-\d{2}-\d{2}\.zip/);
    });

    it('should skip results with errors when creating ZIP', async () => {
      const results = [
        {
          filename: '01 00 00 - General.pdf',
          blob: new Blob(['pdf 1'], { type: 'application/pdf' }),
        },
        {
          filename: '02 00 00 - Error.pdf',
          error: 'Failed to export',
        },
      ];

      await downloadExportResults(results);

      // Verify a blob was created (only from the successful result)
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
      const downloadedBlob = mockCreateObjectURL.mock.calls[0][0];
      expect(downloadedBlob).toBeInstanceOf(Blob);

      // Since there's only 1 successful result, it should download directly (not ZIP)
      const mockAnchor = document.createElement.mock.results[0].value;
      expect(mockAnchor.download).toBe('01 00 00 - General.pdf');
    });
  });
});
