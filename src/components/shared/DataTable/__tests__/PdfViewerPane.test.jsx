import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PdfViewerPane from '../PdfViewerPane';

// Mock PdfWrapper since it's complex
jest.mock('../../../../pdfWrapper', () => ({ pdfData, setPdfData, loading, setLoading, onClose }) => (
  <div
    data-testid="pdf-wrapper"
    data-url={pdfData?.url}
    data-loading={loading?.toString()}
  >
    PDF Content
  </div>
));

// Mock Loader
jest.mock('../../Loader/Loader', () => () => <div data-testid="loader">Loading...</div>);

describe('PdfViewerPane', () => {
  const defaultProps = {
    pdfData: { url: 'https://example.com/test.pdf' },
    setPdfData: jest.fn(),
    title: 'Test Document.pdf',
    onClose: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title', () => {
    render(<PdfViewerPane {...defaultProps} />);

    expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<PdfViewerPane {...defaultProps} />);

    expect(screen.getByTestId('pdf-close')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<PdfViewerPane {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByTestId('pdf-close'));

    expect(onClose).toHaveBeenCalled();
  });

  it('renders PDF wrapper with correct url', () => {
    render(<PdfViewerPane {...defaultProps} />);

    const pdfWrapper = screen.getByTestId('pdf-wrapper');
    expect(pdfWrapper).toHaveAttribute('data-url', 'https://example.com/test.pdf');
  });

  it('shows loading state when isLoading is true', () => {
    render(<PdfViewerPane {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId('pdf-loading')).toBeInTheDocument();
  });

  it('passes loading state to PdfWrapper', () => {
    render(<PdfViewerPane {...defaultProps} isLoading={true} />);

    const pdfWrapper = screen.getByTestId('pdf-wrapper');
    expect(pdfWrapper).toHaveAttribute('data-loading', 'true');
  });

  it('displays title with ellipsis overflow', () => {
    render(<PdfViewerPane {...defaultProps} title="Very Long Document Name That Should Be Truncated.pdf" />);

    const titleElement = screen.getByText('Very Long Document Name That Should Be Truncated.pdf');
    expect(titleElement).toHaveAttribute('title', 'Very Long Document Name That Should Be Truncated.pdf');
  });
});
