import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTablePagination from '../DataTablePagination';

describe('DataTablePagination', () => {
  const defaultProps = {
    page: 1,
    rowsPerPage: 25,
    totalCount: 100,
    onPageChange: jest.fn(),
    onRowsPerPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders rows per page selector', () => {
    render(<DataTablePagination {...defaultProps} />);

    expect(screen.getByLabelText(/rows/i)).toBeInTheDocument();
  });

  it('displays current rows per page value', () => {
    render(<DataTablePagination {...defaultProps} rowsPerPage={50} />);

    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    render(<DataTablePagination {...defaultProps} />);

    // Should render page numbers or nav buttons
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('calculates correct page count', () => {
    render(<DataTablePagination {...defaultProps} totalCount={100} rowsPerPage={25} />);

    // 100 items / 25 per page = 4 pages
    // Should be able to navigate to page 4
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('calls onPageChange when page is changed', () => {
    const onPageChange = jest.fn();
    render(<DataTablePagination {...defaultProps} onPageChange={onPageChange} />);

    // Click page 2
    fireEvent.click(screen.getByText('2'));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onRowsPerPageChange when rows per page is changed', () => {
    const onRowsPerPageChange = jest.fn();
    render(<DataTablePagination {...defaultProps} onRowsPerPageChange={onRowsPerPageChange} />);

    // Open select and choose 50
    const select = screen.getByLabelText(/rows/i);
    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByText('50'));

    expect(onRowsPerPageChange).toHaveBeenCalledWith(50);
  });

  it('provides standard row options', () => {
    render(<DataTablePagination {...defaultProps} />);

    const select = screen.getByLabelText(/rows/i);
    fireEvent.mouseDown(select);

    // When dropdown is open, options are available (25 appears twice - in display and in option)
    expect(screen.getAllByText('25').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument();
  });

  it('handles single page correctly', () => {
    render(<DataTablePagination {...defaultProps} totalCount={10} rowsPerPage={25} />);

    // Only 1 page, pagination should show page 1
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('handles zero items', () => {
    render(<DataTablePagination {...defaultProps} totalCount={0} />);

    // Should handle gracefully without errors
    expect(screen.getByLabelText(/rows/i)).toBeInTheDocument();
  });
});
