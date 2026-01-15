import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PdfViewerPane from '../PdfViewerPane';

// Mock PdfWrapper since it's complex
jest.mock('../../../../pdfWrapper', () => ({ children, ...props }) => (
  <div data-testid="pdf-wrapper" data-url={props.pdfData?.url}>
    {children}
  </div>
));

// Mock Loader
jest.mock('../../Loader/Loader', () => () => <div data-testid="loader">Loading...</div>);

describe('PdfViewerPane', () => {
  const defaultProps = {
    pdfData: { url: 'https://example.com/test.pdf' },
    title: 'Test Document.pdf',
    onClose: jest.fn(),
    onNavigateUp: jest.fn(),
    onNavigateDown: jest.fn(),
    canNavigateUp: true,
    canNavigateDown: true,
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

  it('renders navigation buttons', () => {
    render(<PdfViewerPane {...defaultProps} />);

    expect(screen.getByTestId('pdf-nav-up')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-nav-down')).toBeInTheDocument();
  });

  it('calls onNavigateUp when up button is clicked', () => {
    const onNavigateUp = jest.fn();
    render(<PdfViewerPane {...defaultProps} onNavigateUp={onNavigateUp} />);

    fireEvent.click(screen.getByTestId('pdf-nav-up'));

    expect(onNavigateUp).toHaveBeenCalled();
  });

  it('calls onNavigateDown when down button is clicked', () => {
    const onNavigateDown = jest.fn();
    render(<PdfViewerPane {...defaultProps} onNavigateDown={onNavigateDown} />);

    fireEvent.click(screen.getByTestId('pdf-nav-down'));

    expect(onNavigateDown).toHaveBeenCalled();
  });

  it('disables up button when canNavigateUp is false', () => {
    render(<PdfViewerPane {...defaultProps} canNavigateUp={false} />);

    expect(screen.getByTestId('pdf-nav-up')).toBeDisabled();
  });

  it('disables down button when canNavigateDown is false', () => {
    render(<PdfViewerPane {...defaultProps} canNavigateDown={false} />);

    expect(screen.getByTestId('pdf-nav-down')).toBeDisabled();
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
});
