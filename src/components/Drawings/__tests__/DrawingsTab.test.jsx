import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DrawingsTab from '../DrawingsTab';
import * as api from '../../../api/Drawings/api';

// Mock the API
jest.mock('../../../api/Drawings/api');

// Mock PdfWrapper
jest.mock('../../../pdfWrapper', () => ({ pdfData }) => (
  <div data-testid="pdf-wrapper" data-url={pdfData?.url}>
    PDF Viewer
  </div>
));

// Mock Loader
jest.mock('../../shared/Loader/Loader', () => () => <div data-testid="loader">Loading...</div>);

// Mock DrawingsUploadModal
jest.mock('../DrawingsUploadModal', () => ({ isOpen, toggle }) => (
  isOpen ? <div data-testid="upload-modal">Upload Modal</div> : null
));

// Mock DrawingsProcessingIndicator
jest.mock('../DrawingsProcessingIndicator', () => ({ processingStatus }) => (
  processingStatus?.is_processing ? (
    <div data-testid="processing-indicator">Processing...</div>
  ) : null
));

describe('DrawingsTab Integration', () => {
  const mockDrawingNotes = [
    {
      id: 1,
      sheet_number: 'A101',
      sheet_title: 'Floor Plan - Level 1',
      drawing_file_url: 'https://example.com/floor.pdf',
      drawing_file_id: 101,
      category: 'Architectural',
      text: 'Note about floor plan',
      bounding_box: [100, 200, 300, 400],
      page_number: 1,
    },
    {
      id: 2,
      sheet_number: 'E201',
      sheet_title: 'Electrical Layout',
      drawing_file_url: 'https://example.com/electrical.pdf',
      drawing_file_id: 102,
      category: 'Electrical',
      text: 'Electrical note',
      bounding_box: [50, 100, 150, 200],
      page_number: 1,
    },
  ];

  const mockApiResponse = {
    data: {
      results: mockDrawingNotes,
      all_filter_vals: {
        category: ['Architectural', 'Electrical'],
        drawing_files: [
          { id: 101, name: 'Floor Plan.pdf' },
          { id: 102, name: 'Electrical.pdf' },
        ],
        sheet_numbers: ['A101', 'E201'],
        sheet_titles: ['Floor Plan - Level 1', 'Electrical Layout'],
        has_null_sheet_number: false,
        has_null_sheet_title: false,
      },
      total_count: 2,
      processing_status: null,
    },
  };

  const defaultProps = {
    projectId: 1,
    projectVersionId: 1,
    teamId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    api.getDrawingNotes.mockResolvedValue(mockApiResponse);
  });

  describe('Initial Render', () => {
    it('fetches and displays drawing notes', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('A101')).toBeInTheDocument();
        expect(screen.getByText('E201')).toBeInTheDocument();
      });
    });

    it('displays toolbar with export button', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });
    });

    it('displays upload button', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Upload Drawings')).toBeInTheDocument();
      });
    });

    it('displays count information', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        // Check for drawing files count
        expect(screen.getByText(/2 drawing file/i)).toBeInTheDocument();
      });
    });

    it('calls API with correct parameters', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(api.getDrawingNotes).toHaveBeenCalledWith(
          1,
          1,
          expect.objectContaining({
            page: 1,
            limit: 25,
          })
        );
      });
    });
  });

  describe('Row Selection', () => {
    it('selects row and shows PDF viewer when clicked', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('A101')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('A101'));

      await waitFor(() => {
        expect(screen.getByTestId('pdf-wrapper')).toBeInTheDocument();
      });
    });

    it('highlights selected row', async () => {
      const { container } = render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('A101')).toBeInTheDocument();
      });

      // Click on the row in the table
      const tableRow = container.querySelector('tbody tr');
      fireEvent.click(tableRow);

      await waitFor(() => {
        expect(tableRow).toHaveClass('dt-row-selected');
      });
    });
  });

  describe('Search', () => {
    it('renders search input', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });
    });

    it('searches when search input is used', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText(/search/i), {
        target: { value: 'floor' },
      });

      // Wait for debounce (300ms) + state updates + re-render + API call
      // The component has a 300ms debounce, then React state updates trigger a new fetch
      await new Promise(resolve => setTimeout(resolve, 500));

      await waitFor(() => {
        // Check if any call included the search term
        const calls = api.getDrawingNotes.mock.calls;
        const hasSearchCall = calls.some(
          call => call[2]?.search === 'floor'
        );
        expect(hasSearchCall).toBe(true);
      });
    });
  });

  describe('Pagination', () => {
    it('displays pagination controls', async () => {
      api.getDrawingNotes.mockResolvedValue({
        ...mockApiResponse,
        data: {
          ...mockApiResponse.data,
          total_count: 100,
        },
      });

      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
    });

    it('changes page when pagination is used', async () => {
      api.getDrawingNotes.mockResolvedValue({
        ...mockApiResponse,
        data: {
          ...mockApiResponse.data,
          total_count: 100,
        },
      });

      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('2'));

      await waitFor(() => {
        expect(api.getDrawingNotes).toHaveBeenCalledWith(
          1,
          1,
          expect.objectContaining({ page: 2 })
        );
      });
    });
  });

  describe('Export', () => {
    it('exports to Excel when export option is selected', async () => {
      api.exportDrawingNotesToExcel.mockResolvedValue({
        data: new ArrayBuffer(8),
      });

      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:test');
      global.URL.revokeObjectURL = jest.fn();

      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export'));

      await waitFor(() => {
        expect(screen.getByText('Excel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Excel'));

      await waitFor(() => {
        expect(api.exportDrawingNotesToExcel).toHaveBeenCalled();
      });
    });
  });

  describe('Upload', () => {
    it('opens upload modal when upload button is clicked', async () => {
      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Upload Drawings')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Upload Drawings'));

      await waitFor(() => {
        expect(screen.getByTestId('upload-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Processing Status', () => {
    it('shows processing indicator when processing', async () => {
      api.getDrawingNotes.mockResolvedValue({
        ...mockApiResponse,
        data: {
          ...mockApiResponse.data,
          processing_status: { is_processing: true },
        },
      });

      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('processing-indicator')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('shows empty message when no data', async () => {
      api.getDrawingNotes.mockResolvedValue({
        data: {
          results: [],
          all_filter_vals: {
            category: [],
            drawing_files: [],
            sheet_numbers: [],
            sheet_titles: [],
            has_null_sheet_number: false,
            has_null_sheet_title: false,
          },
          total_count: 0,
          processing_status: null,
        },
      });

      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/no.*data|no.*found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading state while fetching', async () => {
      // Make API call hang
      api.getDrawingNotes.mockImplementation(() => new Promise(() => {}));

      render(<DrawingsTab {...defaultProps} />);

      expect(screen.getByTestId('table-loading')).toBeInTheDocument();
    });
  });

  describe('Sheet Number and Title Filtering', () => {
    const mockDataWithNulls = [
      {
        id: 1,
        sheet_number: 'A101',
        sheet_title: 'Floor Plan',
        drawing_file_url: 'https://example.com/floor.pdf',
        drawing_file_id: 101,
        category: 'Architectural',
        text: 'Note 1',
        bounding_box: [100, 200, 300, 400],
        page_number: 1,
      },
      {
        id: 2,
        sheet_number: null,
        sheet_title: null,
        drawing_file_url: 'https://example.com/other.pdf',
        drawing_file_id: 102,
        category: 'General',
        text: 'Note 2',
        bounding_box: [50, 100, 150, 200],
        page_number: 1,
      },
    ];

    const mockResponseWithNulls = {
      data: {
        results: mockDataWithNulls,
        all_filter_vals: {
          category: ['Architectural', 'General'],
          drawing_files: [
            { id: 101, name: 'Floor Plan.pdf' },
            { id: 102, name: 'Other.pdf' },
          ],
          sheet_numbers: ['A101'],
          sheet_titles: ['Floor Plan'],
          has_null_sheet_number: true,
          has_null_sheet_title: true,
        },
        total_count: 2,
        processing_status: null,
      },
    };

    // Helper to get filter icon by column index (0-based)
    const getFilterIconByColumnIndex = (container, index) => {
      const filterIcons = container.querySelectorAll('[data-testid="filter-icon"]');
      return filterIcons[index];
    };

    it('shows Unknown Number option when has_null_sheet_number is true', async () => {
      api.getDrawingNotes.mockResolvedValue(mockResponseWithNulls);

      const { container } = render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(container.querySelector('tbody tr')).toBeInTheDocument();
      });

      // Click the filter icon for Sheet Number column (first filterable column, index 0)
      const filterIcon = getFilterIconByColumnIndex(container, 0);
      fireEvent.click(filterIcon);

      await waitFor(() => {
        const popover = document.querySelector('.dt-filter-popover');
        expect(popover).toBeInTheDocument();
        expect(popover.textContent).toContain('Unknown Number');
      });
    });

    it('shows Unknown Title option when has_null_sheet_title is true', async () => {
      api.getDrawingNotes.mockResolvedValue(mockResponseWithNulls);

      const { container } = render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(container.querySelector('tbody tr')).toBeInTheDocument();
      });

      // Click the filter icon for Sheet Title column (second filterable column, index 1)
      const filterIcon = getFilterIconByColumnIndex(container, 1);
      fireEvent.click(filterIcon);

      await waitFor(() => {
        const popover = document.querySelector('.dt-filter-popover');
        expect(popover).toBeInTheDocument();
        expect(popover.textContent).toContain('Unknown Title');
      });
    });

    it('filters by unknown sheet number when selected', async () => {
      api.getDrawingNotes.mockResolvedValue(mockResponseWithNulls);

      const { container } = render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(container.querySelector('tbody tr')).toBeInTheDocument();
      });

      // Click the filter icon for Sheet Number column
      const filterIcon = getFilterIconByColumnIndex(container, 0);
      fireEvent.click(filterIcon);

      await waitFor(() => {
        const popover = document.querySelector('.dt-filter-popover');
        expect(popover).toBeInTheDocument();
      });

      // Select "Unknown Number" from the popover
      const popover = document.querySelector('.dt-filter-popover');
      const unknownNumberOption = Array.from(popover.querySelectorAll('.dt-filter-option'))
        .find(el => el.textContent === 'Unknown Number');
      fireEvent.click(unknownNumberOption);

      await waitFor(() => {
        expect(api.getDrawingNotes).toHaveBeenCalledWith(
          1,
          1,
          expect.objectContaining({
            sheetNumberIsNull: true,
          })
        );
      });
    });

    it('filters by unknown sheet title when selected', async () => {
      api.getDrawingNotes.mockResolvedValue(mockResponseWithNulls);

      const { container } = render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(container.querySelector('tbody tr')).toBeInTheDocument();
      });

      // Click the filter icon for Sheet Title column
      const filterIcon = getFilterIconByColumnIndex(container, 1);
      fireEvent.click(filterIcon);

      await waitFor(() => {
        const popover = document.querySelector('.dt-filter-popover');
        expect(popover).toBeInTheDocument();
      });

      // Select "Unknown Title" from the popover
      const popover = document.querySelector('.dt-filter-popover');
      const unknownTitleOption = Array.from(popover.querySelectorAll('.dt-filter-option'))
        .find(el => el.textContent === 'Unknown Title');
      fireEvent.click(unknownTitleOption);

      await waitFor(() => {
        expect(api.getDrawingNotes).toHaveBeenCalledWith(
          1,
          1,
          expect.objectContaining({
            sheetTitleIsNull: true,
          })
        );
      });
    });

    it('derives filter options from data when API does not provide them', async () => {
      // API response without sheet_numbers/sheet_titles in all_filter_vals
      const mockResponseWithoutFilterVals = {
        data: {
          results: mockDataWithNulls,
          all_filter_vals: {
            category: ['Architectural', 'General'],
            drawing_files: [],
            // No sheet_numbers or sheet_titles provided
          },
          total_count: 2,
          processing_status: null,
        },
      };

      api.getDrawingNotes.mockResolvedValue(mockResponseWithoutFilterVals);

      const { container } = render(<DrawingsTab {...defaultProps} />);

      // Wait for data to load
      await waitFor(() => {
        expect(container.querySelector('tbody tr')).toBeInTheDocument();
      });

      // Wait a bit for the filter icons to render
      await waitFor(() => {
        expect(container.querySelectorAll('[data-testid="filter-icon"]').length).toBeGreaterThan(0);
      });

      // Click the filter icon for Sheet Number column
      const filterIcons = container.querySelectorAll('[data-testid="filter-icon"]');
      fireEvent.click(filterIcons[0]);

      // Should show "Unknown Number" (derived from null in data)
      await waitFor(() => {
        const popover = document.querySelector('.dt-filter-popover');
        expect(popover).toBeInTheDocument();
        expect(popover.textContent).toContain('Unknown Number');
      });
    });
  });

  describe('Filter Clearing', () => {
    it('clears all filters when Clear Filters is clicked', async () => {
      api.getDrawingNotes.mockResolvedValue(mockApiResponse);

      const { container } = render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('A101')).toBeInTheDocument();
      });

      // Apply a category filter first (third filterable column, index 2)
      const filterIcons = container.querySelectorAll('[data-testid="filter-icon"]');
      fireEvent.click(filterIcons[2]); // Category column

      await waitFor(() => {
        expect(document.querySelector('.dt-filter-popover')).toBeInTheDocument();
      });

      // Find "Architectural" in the filter popover
      const filterPopover = document.querySelector('.dt-filter-popover');
      const architecturalOption = Array.from(filterPopover.querySelectorAll('.dt-filter-option'))
        .find(el => el.textContent === 'Architectural');
      fireEvent.click(architecturalOption);

      // Clear filters button should appear
      await waitFor(() => {
        expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      });

      // Clear the mock calls to track new calls
      api.getDrawingNotes.mockClear();

      fireEvent.click(screen.getByText('Clear Filters'));

      // Verify API is called without any filters
      await waitFor(() => {
        expect(api.getDrawingNotes).toHaveBeenCalledWith(
          1,
          1,
          expect.objectContaining({
            category: undefined,
            sheetNumber: undefined,
            sheetTitle: undefined,
            sheetNumberIsNull: undefined,
            sheetTitleIsNull: undefined,
          })
        );
      });
    });
  });

  describe('Discipline Filtering', () => {
    const mockDataWithDisciplines = [
      {
        id: 1,
        sheet_number: 'M-101',
        sheet_title: 'Mechanical Floor Plan',
        drawing_file_url: 'https://example.com/mech.pdf',
        drawing_file_id: 101,
        category: 'general',
        text: 'Mechanical note',
        bounding_box: [100, 200, 300, 400],
        page_number: 1,
        disciplines: ['mechanical', 'general'],
      },
      {
        id: 2,
        sheet_number: 'E-101',
        sheet_title: 'Electrical Plan',
        drawing_file_url: 'https://example.com/elec.pdf',
        drawing_file_id: 102,
        category: 'electrical',
        text: 'Electrical note',
        bounding_box: [50, 100, 150, 200],
        page_number: 1,
        disciplines: ['electrical', 'fire_protection'],
      },
    ];

    const mockResponseWithDisciplines = {
      data: {
        results: mockDataWithDisciplines,
        all_filter_vals: {
          category: ['general', 'electrical'],
          drawing_files: [
            { id: 101, name: 'Mechanical.pdf' },
            { id: 102, name: 'Electrical.pdf' },
          ],
          sheet_numbers: ['M-101', 'E-101'],
          sheet_titles: ['Mechanical Floor Plan', 'Electrical Plan'],
          disciplines: ['mechanical', 'general', 'electrical', 'fire_protection'],
          has_null_sheet_number: false,
          has_null_sheet_title: false,
        },
        total_count: 2,
        processing_status: null,
      },
    };

    it('displays discipline column with formatted values', async () => {
      api.getDrawingNotes.mockResolvedValue(mockResponseWithDisciplines);

      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Discipline')).toBeInTheDocument();
        expect(screen.getByText('Mechanical, General')).toBeInTheDocument();
        expect(screen.getByText('Electrical, Fire Protection')).toBeInTheDocument();
      });
    });

    it('filters by discipline when selected', async () => {
      api.getDrawingNotes.mockResolvedValue(mockResponseWithDisciplines);

      const { container } = render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('M-101')).toBeInTheDocument();
      });

      const filterIcons = container.querySelectorAll('[data-testid="filter-icon"]');
      const disciplinesFilter = Array.from(filterIcons).find((icon) => {
        const header = icon.closest('th');
        return header?.textContent?.includes('Discipline');
      });
      fireEvent.click(disciplinesFilter);

      await waitFor(() => {
        const popover = document.querySelector('.dt-filter-popover');
        expect(popover).toBeInTheDocument();
        expect(popover.textContent).toContain('Fire Protection');
      });

      const popover = document.querySelector('.dt-filter-popover');
      const fireProtectionOption = Array.from(popover.querySelectorAll('.dt-filter-option'))
        .find(el => el.textContent === 'Fire Protection');
      fireEvent.click(fireProtectionOption);

      await waitFor(() => {
        expect(api.getDrawingNotes).toHaveBeenCalledWith(
          1,
          1,
          expect.objectContaining({
            disciplines: 'fire_protection',
          })
        );
      });
    });

    it('displays dash for notes with empty disciplines array', async () => {
      const mockDataWithEmptyDisciplines = [
        {
          ...mockDataWithDisciplines[0],
          disciplines: [],
        },
      ];

      api.getDrawingNotes.mockResolvedValue({
        ...mockResponseWithDisciplines,
        data: {
          ...mockResponseWithDisciplines.data,
          results: mockDataWithEmptyDisciplines,
        },
      });

      render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('—')).toBeInTheDocument();
      });
    });
  });

  describe('Export with Filters', () => {
    it('exports with sheet number filter applied', async () => {
      api.getDrawingNotes.mockResolvedValue(mockApiResponse);
      api.exportDrawingNotesToExcel.mockResolvedValue({
        data: new ArrayBuffer(8),
      });

      global.URL.createObjectURL = jest.fn(() => 'blob:test');
      global.URL.revokeObjectURL = jest.fn();

      const { container } = render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('A101')).toBeInTheDocument();
      });

      // Apply sheet number filter (first filterable column, index 0)
      const filterIcons = container.querySelectorAll('[data-testid="filter-icon"]');
      fireEvent.click(filterIcons[0]);

      await waitFor(() => {
        expect(document.querySelector('.dt-filter-popover')).toBeInTheDocument();
      });

      // Find A101 option in the filter popover (skip "All" which is first)
      const filterOptions = document.querySelectorAll('.dt-filter-option');
      // filterOptions[0] is "All", filterOptions[1] is "A101"
      fireEvent.click(filterOptions[1]);

      // Export
      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export'));

      await waitFor(() => {
        expect(screen.getByText('Excel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Excel'));

      await waitFor(() => {
        expect(api.exportDrawingNotesToExcel).toHaveBeenCalledWith(
          1,
          1,
          expect.objectContaining({
            sheetNumber: 'A101',
          })
        );
      });
    });

    it('exports with unknown sheet number filter applied', async () => {
      const mockResponseWithNulls = {
        data: {
          results: mockDrawingNotes,
          all_filter_vals: {
            ...mockApiResponse.data.all_filter_vals,
            has_null_sheet_number: true,
          },
          total_count: 2,
          processing_status: null,
        },
      };

      api.getDrawingNotes.mockResolvedValue(mockResponseWithNulls);
      api.exportDrawingNotesToExcel.mockResolvedValue({
        data: new ArrayBuffer(8),
      });

      global.URL.createObjectURL = jest.fn(() => 'blob:test');
      global.URL.revokeObjectURL = jest.fn();

      const { container } = render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('A101')).toBeInTheDocument();
      });

      // Apply unknown sheet number filter
      const filterIcons = container.querySelectorAll('[data-testid="filter-icon"]');
      fireEvent.click(filterIcons[0]);

      await waitFor(() => {
        expect(screen.getByText('Unknown Number')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Unknown Number'));

      // Export
      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Export'));

      await waitFor(() => {
        expect(screen.getByText('Excel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Excel'));

      await waitFor(() => {
        expect(api.exportDrawingNotesToExcel).toHaveBeenCalledWith(
          1,
          1,
          expect.objectContaining({
            sheetNumberIsNull: true,
          })
        );
      });
    });
  });
});
