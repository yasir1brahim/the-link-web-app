import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable from '../DataTable';

// Mock Loader
jest.mock('../../Loader/Loader', () => () => <div data-testid="loader">Loading...</div>);

describe('DataTable', () => {
  const mockColumns = [
    { key: 'name', header: 'Name', sortable: true, filterable: true },
    { key: 'category', header: 'Category', sortable: true, filterable: true },
    { key: 'description', header: 'Description', sortable: false, filterable: false },
  ];

  const mockData = [
    { id: 1, name: 'Item A', category: 'Type 1', description: 'Desc A' },
    { id: 2, name: 'Item B', category: 'Type 2', description: 'Desc B' },
    { id: 3, name: 'Item C', category: 'Type 1', description: 'Desc C' },
  ];

  const defaultProps = {
    columns: mockColumns,
    data: mockData,
    rowKey: 'id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders column headers', () => {
      render(<DataTable {...defaultProps} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders data rows', () => {
      render(<DataTable {...defaultProps} />);

      expect(screen.getByText('Item A')).toBeInTheDocument();
      expect(screen.getByText('Item B')).toBeInTheDocument();
      expect(screen.getByText('Item C')).toBeInTheDocument();
    });

    it('renders sort icon for sortable columns', () => {
      render(<DataTable {...defaultProps} />);

      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader.querySelector('[data-testid="sort-icon"]')).toBeInTheDocument();
    });

    it('does not render sort icon for non-sortable columns', () => {
      render(<DataTable {...defaultProps} />);

      const descHeader = screen.getByText('Description').closest('th');
      expect(descHeader.querySelector('[data-testid="sort-icon"]')).not.toBeInTheDocument();
    });

    it('renders filter icon for filterable columns', () => {
      render(<DataTable {...defaultProps} filterOptions={{ name: ['Item A', 'Item B', 'Item C'] }} />);

      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader.querySelector('[data-testid="filter-icon"]')).toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
      render(<DataTable {...defaultProps} data={[]} />);

      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('renders loading state', () => {
      render(<DataTable {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId('table-loading')).toBeInTheDocument();
    });
  });

  describe('Row Selection', () => {
    it('calls onRowSelect when row is clicked', () => {
      const onRowSelect = jest.fn();
      render(<DataTable {...defaultProps} onRowSelect={onRowSelect} />);

      fireEvent.click(screen.getByText('Item A'));

      expect(onRowSelect).toHaveBeenCalledWith(mockData[0]);
    });

    it('highlights selected row', () => {
      render(<DataTable {...defaultProps} selectedId={2} />);

      const selectedRow = screen.getByText('Item B').closest('tr');
      expect(selectedRow).toHaveClass('dt-row-selected');
    });
  });

  describe('Sorting', () => {
    it('calls onSort when sort icon is clicked', () => {
      const onSort = jest.fn();
      render(<DataTable {...defaultProps} onSort={onSort} />);

      const nameHeader = screen.getByText('Name').closest('th');
      fireEvent.click(nameHeader.querySelector('[data-testid="sort-icon"]'));

      expect(onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('toggles sort direction on subsequent clicks', () => {
      const onSort = jest.fn();
      render(
        <DataTable
          {...defaultProps}
          onSort={onSort}
          sortColumn="name"
          sortDirection="asc"
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      fireEvent.click(nameHeader.querySelector('[data-testid="sort-icon"]'));

      expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });
  });

  describe('Filtering', () => {
    it('opens filter popover when filter icon is clicked', () => {
      render(
        <DataTable
          {...defaultProps}
          filterOptions={{ name: ['Item A', 'Item B', 'Item C'] }}
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      fireEvent.click(nameHeader.querySelector('[data-testid="filter-icon"]'));

      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('calls onFilter when filter option is selected', () => {
      const onFilter = jest.fn();
      const { container } = render(
        <DataTable
          {...defaultProps}
          onFilter={onFilter}
          filterOptions={{ name: ['Item A', 'Item B', 'Item C'] }}
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      fireEvent.click(nameHeader.querySelector('[data-testid="filter-icon"]'));

      // Click the option in the filter popover (not the one in the table)
      const filterPopover = container.querySelector('.dt-filter-popover');
      const itemAOption = Array.from(filterPopover.querySelectorAll('.dt-filter-option'))
        .find(el => el.textContent === 'Item A');
      fireEvent.click(itemAOption);

      expect(onFilter).toHaveBeenCalledWith('name', 'Item A');
    });

    it('shows active filter indicator', () => {
      render(
        <DataTable
          {...defaultProps}
          columnFilters={{ name: 'Item A' }}
          filterOptions={{ name: ['Item A', 'Item B', 'Item C'] }}
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      const filterIcon = nameHeader.querySelector('[data-testid="filter-icon"]');
      expect(filterIcon).toHaveClass('active');
    });
  });

  describe('Custom cell rendering', () => {
    it('uses custom render function when provided', () => {
      const columnsWithRender = [
        {
          key: 'name',
          header: 'Name',
          render: (value, row) => <strong data-testid="custom-cell">{value.toUpperCase()}</strong>,
        },
      ];

      render(<DataTable columns={columnsWithRender} data={mockData} rowKey="id" />);

      // Multiple custom cells are rendered, check the first one
      const customCells = screen.getAllByTestId('custom-cell');
      expect(customCells[0]).toHaveTextContent('ITEM A');
    });
  });
});
