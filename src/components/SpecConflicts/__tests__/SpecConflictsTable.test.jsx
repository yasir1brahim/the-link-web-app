import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SpecConflictsTable from '../SpecConflictsTable';

// Mock ExpandedConflictRow to avoid WebViewer initialization
jest.mock('../ExpandedConflictRow', () => ({ conflict }) => (
  <div data-testid="expanded-row">Expanded: {conflict.id}</div>
));

// Mock ColumnFilterPopover
jest.mock('../../shared/DataTable', () => ({
  ColumnFilterPopover: () => <span>Filter</span>,
}));

describe('SpecConflictsTable', () => {
  const mockConflicts = [
    {
      id: 1,
      sheet_number: 'P-201',
      sheet_title: 'Plumbing Plan',
      note_text: 'Ball valves required',
      spec_text: 'Gate valves required',
      spec_masterformat_number: '220500',
      reason: 'Valve type mismatch',
    },
    {
      id: 2,
      sheet_number: 'M-101',
      note_text: 'Another note',
      spec_text: 'Another spec',
      spec_masterformat_number: '230500',
      reason: 'Material conflict',
    },
  ];

  const defaultProps = {
    conflicts: mockConflicts,
    expandedRowId: null,
    onRowClick: jest.fn(),
    sortColumn: null,
    sortDirection: 'asc',
    onSort: jest.fn(),
    columnFilters: {},
    filterOptions: {},
    onFilter: jest.fn(),
    isLoading: false,
  };

  it('renders all conflicts', () => {
    render(<SpecConflictsTable {...defaultProps} />);

    expect(screen.getByText('P-201')).toBeInTheDocument();
    expect(screen.getByText('M-101')).toBeInTheDocument();
  });

  it('calls onRowClick when row is clicked', () => {
    render(<SpecConflictsTable {...defaultProps} />);

    fireEvent.click(screen.getByText('P-201').closest('tr'));

    expect(defaultProps.onRowClick).toHaveBeenCalledWith(1);
  });

  it('renders expanded row when expandedRowId matches', () => {
    render(<SpecConflictsTable {...defaultProps} expandedRowId={1} />);

    expect(screen.getByTestId('expanded-row')).toBeInTheDocument();
    expect(screen.getByText('Expanded: 1')).toBeInTheDocument();
  });

  it('calls onSort when sortable header is clicked', () => {
    render(<SpecConflictsTable {...defaultProps} />);

    fireEvent.click(screen.getByText('Drawing #'));

    expect(defaultProps.onSort).toHaveBeenCalledWith('sheet_number', 'asc');
  });

  it('shows loading state', () => {
    render(<SpecConflictsTable {...defaultProps} isLoading={true} />);

    expect(screen.getByText('Loading conflicts...')).toBeInTheDocument();
  });
});
