import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SortableTable from '../index';

// Mock the icon components
jest.mock('../../icons/sortIcon', () => ({
  SortIcon: () => <span data-testid="sort-icon">Sort</span>
}));

jest.mock('../../icons/filterIcon', () => ({
  FilterIcon: ({ isActive }) => <span data-testid="filter-icon" data-active={isActive}>Filter</span>
}));

describe('SortableTable', () => {
  const mockData = [
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
  ];

  const mockColumns = [
    { key: 'id', label: 'ID', sortable: true, width: 10 },
    { key: 'name', label: 'Name', sortable: true, filterable: true, width: 30 },
    { key: 'age', label: 'Age', sortable: true, width: 20 },
    { key: 'email', label: 'Email', expandable: true, width: 40 },
  ];

  const defaultProps = {
    data: mockData,
    columns: mockColumns,
  };

  beforeEach(() => {
    // Mock window resize event
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Rendering', () => {
    it('renders table with correct structure', () => {
      render(<SortableTable {...defaultProps} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('table')).toHaveClass('table', 'logs-table');
    });

    it('renders all column headers', () => {
      render(<SortableTable {...defaultProps} />);
      
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders all data rows', () => {
      render(<SortableTable {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('renders sort icons for sortable columns', () => {
      render(<SortableTable {...defaultProps} />);
      
      const sortIcons = screen.getAllByTestId('sort-icon');
      expect(sortIcons).toHaveLength(3); // ID, Name, Age are sortable
    });

    it('renders filter icons for filterable columns', () => {
      render(<SortableTable {...defaultProps} />);
      
      const filterIcons = screen.getAllByTestId('filter-icon');
      expect(filterIcons).toHaveLength(1); // Only Name is filterable
    });

    it('applies custom className', () => {
      render(<SortableTable {...defaultProps} className="custom-table" />);
      
      const wrapper = screen.getByRole('table').closest('.l-table-wrapper');
      expect(wrapper).toHaveClass('custom-table');
    });
  });

  describe('Sorting', () => {
    it('calls onSort when sort icon is clicked', () => {
      const mockOnSort = jest.fn();
      render(<SortableTable {...defaultProps} onSort={mockOnSort} />);
      
      const nameHeader = screen.getByText('Name');
      const sortIcon = nameHeader.parentElement.querySelector('[data-testid="sort-icon"]');
      
      fireEvent.click(sortIcon);
      
      expect(mockOnSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('toggles sort order when same column is clicked again', () => {
      const mockOnSort = jest.fn();
      render(
        <SortableTable 
          {...defaultProps} 
          onSort={mockOnSort}
          sorting={{ column: 'name', order: 'asc' }}
        />
      );
      
      const nameHeader = screen.getByText('Name');
      const sortIcon = nameHeader.parentElement.querySelector('[data-testid="sort-icon"]');
      
      fireEvent.click(sortIcon);
      
      expect(mockOnSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('does not call onSort when column is not sortable', () => {
      const mockOnSort = jest.fn();
      const columnsWithoutSort = mockColumns.map(col => ({ ...col, sortable: false }));
      
      render(<SortableTable data={mockData} columns={columnsWithoutSort} onSort={mockOnSort} />);
      
      const emailHeader = screen.getByText('Email');
      fireEvent.click(emailHeader);
      
      expect(mockOnSort).not.toHaveBeenCalled();
    });
  });

  describe('Filtering', () => {
    it('calls onFilter when filter icon is clicked', () => {
      const mockOnFilter = jest.fn();
      render(<SortableTable {...defaultProps} onFilter={mockOnFilter} />);
      
      const nameHeader = screen.getByText('Name');
      const filterIcon = nameHeader.parentElement.querySelector('[data-testid="filter-icon"]');
      
      fireEvent.click(filterIcon);
      
      expect(mockOnFilter).toHaveBeenCalledWith('name');
    });

    it('shows active state for filter icon when filter values exist', () => {
      const filterValues = { name: ['John'] };
      render(<SortableTable {...defaultProps} filterValues={filterValues} />);
      
      const filterIcon = screen.getByTestId('filter-icon');
      expect(filterIcon).toHaveAttribute('data-active', 'true');
    });

    it('does not call onFilter when column is not filterable', () => {
      const mockOnFilter = jest.fn();
      render(<SortableTable {...defaultProps} onFilter={mockOnFilter} />);
      
      const idHeader = screen.getByText('ID');
      fireEvent.click(idHeader);
      
      expect(mockOnFilter).not.toHaveBeenCalled();
    });
  });

  describe('Column Resizing', () => {
    it('renders resizer handles for resizable columns', () => {
      render(<SortableTable {...defaultProps} />);
      
      const resizers = screen.getAllByText('|');
      expect(resizers.length).toBeGreaterThan(0);
    });

    it('does not render resizer for non-resizable columns', () => {
      const columnsWithoutResize = mockColumns.map(col => ({ ...col, resizable: false }));
      render(<SortableTable data={mockData} columns={columnsWithoutResize} />);
      
      const resizers = screen.queryAllByText('|');
      expect(resizers).toHaveLength(0);
    });
  });

  describe('Text Expansion', () => {
    it('renders expandable content correctly', () => {
      const longData = [
        { 
          id: 1, 
          name: 'John Doe', 
          age: 30, 
          email: 'This is a very long email address that should be truncated and show an expansion button when it exceeds the available space in the table cell'
        }
      ];
      
      render(<SortableTable data={longData} columns={mockColumns} />);
      
      const emailCell = screen.getByText(/This is a very long email/);
      expect(emailCell).toBeInTheDocument();
    });
  });

  describe('Custom Rendering', () => {
    it('renders custom cell content when render function is provided', () => {
      const customColumns = [
        ...mockColumns.slice(0, -1),
        {
          key: 'email',
          label: 'Email',
          render: (value, row) => <span data-testid="custom-email">{value} (Custom)</span>
        }
      ];
      
      render(<SortableTable data={mockData} columns={customColumns} />);
      
      const customEmails = screen.getAllByTestId('custom-email');
      expect(customEmails).toHaveLength(3);
      expect(customEmails[0]).toHaveTextContent('john@example.com (Custom)');
    });

    it('formats cell values when format function is provided', () => {
      const customColumns = [
        ...mockColumns.slice(0, -1),
        {
          key: 'age',
          label: 'Age',
          format: (value) => `${value} years old`
        }
      ];
      
      render(<SortableTable data={mockData} columns={customColumns} />);
      
      expect(screen.getByText('30 years old')).toBeInTheDocument();
      expect(screen.getByText('25 years old')).toBeInTheDocument();
      expect(screen.getByText('35 years old')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper table structure with thead and tbody', () => {
      render(<SortableTable {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table.querySelector('thead')).toBeInTheDocument();
      expect(table.querySelector('tbody')).toBeInTheDocument();
    });

    it('has proper table headers', () => {
      render(<SortableTable {...defaultProps} />);
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(4);
    });

    it('has proper table rows', () => {
      render(<SortableTable {...defaultProps} />);
      
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(4); // 1 header row + 3 data rows
    });
  });

  describe('Responsive Design', () => {
    it('adapts to smaller screen sizes', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<SortableTable {...defaultProps} />);
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));
      
      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data array', () => {
      render(<SortableTable data={[]} columns={mockColumns} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table.querySelector('tbody')).toBeInTheDocument();
    });

    it('handles missing optional props', () => {
      render(<SortableTable data={mockData} columns={mockColumns} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('handles data with missing properties', () => {
      const incompleteData = [
        { id: 1, name: 'John' },
        { id: 2, age: 25 },
        { id: 3, email: 'test@example.com' }
      ];
      
      render(<SortableTable data={incompleteData} columns={mockColumns} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        age: 20 + (i % 50),
        email: `user${i + 1}@example.com`
      }));
      
      const startTime = performance.now();
      render(<SortableTable data={largeData} columns={mockColumns} />);
      const endTime = performance.now();
      
      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
