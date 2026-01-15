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
      drawing_file_name: 'Floor Plan.pdf',
      drawing_file_url: 'https://example.com/floor.pdf',
      drawing_file_id: 101,
      category: 'Architectural',
      text: 'Note about floor plan',
      bounding_box: [100, 200, 300, 400],
      page_number: 1,
    },
    {
      id: 2,
      drawing_file_name: 'Electrical.pdf',
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
        expect(screen.getByText('Floor Plan.pdf')).toBeInTheDocument();
        expect(screen.getByText('Electrical.pdf')).toBeInTheDocument();
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
        expect(screen.getByText(/upload/i)).toBeInTheDocument();
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
        expect(screen.getByText('Floor Plan.pdf')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Floor Plan.pdf'));

      await waitFor(() => {
        expect(screen.getByTestId('pdf-wrapper')).toBeInTheDocument();
      });
    });

    it('highlights selected row', async () => {
      const { container } = render(<DrawingsTab {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Floor Plan.pdf')).toBeInTheDocument();
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
        expect(screen.getByText(/upload/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/upload drawings/i));

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
          all_filter_vals: { category: [], drawing_files: [] },
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
});
