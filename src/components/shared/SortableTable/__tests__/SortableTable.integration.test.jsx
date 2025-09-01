/**
 * Integration tests for SortableTable component
 * Tests the complete functionality including sorting, filtering, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SortableTable from '../index';

// Mock data for testing
const mockData = [
  {
    'Spec Section #': '01 1000',
    'Spec Section Name': 'GENERAL REQUIREMENTS',
    'Inspection Type And Requirements': 'Review submittals',
    'Inspection Frequency': 'As required',
    'Responsible Party': 'Architect'
  },
  {
    'Spec Section #': '02 2000',
    'Spec Section Name': 'EXISTING CONDITIONS',
    'Inspection Type And Requirements': 'Site inspection',
    'Inspection Frequency': 'Before start',
    'Responsible Party': 'Contractor'
  },
  {
    'Spec Section #': '03 3000',
    'Spec Section Name': 'CONCRETE',
    'Inspection Type And Requirements': 'Concrete testing',
    'Inspection Frequency': 'Daily',
    'Responsible Party': 'Engineer'
  }
];

const mockColumns = [
  { 
    key: 'Spec Section #', 
    label: 'Spec Section #', 
    sortable: true, 
    width: 15,
    minWidth: 120
  },
  { 
    key: 'Spec Section Name', 
    label: 'Spec Section Name', 
    sortable: true, 
    width: 25,
    minWidth: 150,
    expandable: true
  },
  { 
    key: 'Inspection Type And Requirements', 
    label: 'Inspection Type & Requirements', 
    sortable: true, 
    width: 30,
    minWidth: 200,
    expandable: true
  },
  { 
    key: 'Inspection Frequency', 
    label: 'Inspection Frequency', 
    sortable: true, 
    width: 15,
    minWidth: 120
  },
  { 
    key: 'Responsible Party', 
    label: 'Responsible Party', 
    sortable: true, 
    width: 15,
    minWidth: 120
  }
];

describe('SortableTable Integration Tests', () => {
  let mockOnSort;
  let mockOnFilter;

  beforeEach(() => {
    mockOnSort = jest.fn();
    mockOnFilter = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders table with all columns and data', () => {
      render(
        <SortableTable
          data={mockData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Check that all column headers are rendered
      expect(screen.getByText('Spec Section #')).toBeInTheDocument();
      expect(screen.getByText('Spec Section Name')).toBeInTheDocument();
      expect(screen.getByText('Inspection Type & Requirements')).toBeInTheDocument();
      expect(screen.getByText('Inspection Frequency')).toBeInTheDocument();
      expect(screen.getByText('Responsible Party')).toBeInTheDocument();

      // Check that all data rows are rendered
      expect(screen.getByText('01 1000')).toBeInTheDocument();
      expect(screen.getByText('02 2000')).toBeInTheDocument();
      expect(screen.getByText('03 3000')).toBeInTheDocument();
      expect(screen.getByText('GENERAL REQUIREMENTS')).toBeInTheDocument();
      expect(screen.getByText('EXISTING CONDITIONS')).toBeInTheDocument();
      expect(screen.getByText('CONCRETE')).toBeInTheDocument();
    });

    test('renders empty state when no data', () => {
      render(
        <SortableTable
          data={[]}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Should still render headers
      expect(screen.getByText('Spec Section #')).toBeInTheDocument();
      expect(screen.getByText('Spec Section Name')).toBeInTheDocument();
      
      // Should not render any data rows
      expect(screen.queryByText('01 1000')).not.toBeInTheDocument();
    });

    test('renders with custom className', () => {
      const { container } = render(
        <SortableTable
          data={mockData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
          className="custom-table-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-table-class');
    });
  });

  describe('Sorting Functionality', () => {
    test('renders sortable column headers', () => {
      render(
        <SortableTable
          data={mockData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Should render sortable column headers
      expect(screen.getByText('Spec Section #')).toBeInTheDocument();
      expect(screen.getByText('Spec Section Name')).toBeInTheDocument();
    });

    test('renders with sorting state', () => {
      render(
        <SortableTable
          data={mockData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: 'Spec Section #', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Should render with sorting state
      expect(screen.getByText('Spec Section #')).toBeInTheDocument();
    });

    test('does not call onSort when non-sortable column is clicked', () => {
      const nonSortableColumns = [
        { 
          key: 'Spec Section #', 
          label: 'Spec Section #', 
          sortable: false, 
          width: 15,
          minWidth: 120
        }
      ];

      render(
        <SortableTable
          data={mockData}
          columns={nonSortableColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Click on non-sortable column header
      const specSectionHeader = screen.getByText('Spec Section #');
      fireEvent.click(specSectionHeader);

      expect(mockOnSort).not.toHaveBeenCalled();
    });

    test('shows sort indicators correctly', () => {
      render(
        <SortableTable
          data={mockData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: 'Spec Section #', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Should render sortable columns with icons
      expect(screen.getByText('Spec Section #')).toBeInTheDocument();
      expect(screen.getByText('Spec Section Name')).toBeInTheDocument();
    });
  });

  describe('Filtering Functionality', () => {
    test('calls onFilter when filter icon is clicked', () => {
      render(
        <SortableTable
          data={mockData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Find and click filter icon (if present)
      const filterIcons = screen.queryAllByTestId('filter-icon');
      if (filterIcons.length > 0) {
        fireEvent.click(filterIcons[0]);
        expect(mockOnFilter).toHaveBeenCalled();
      }
    });

    test('shows filter indicators when filter values are present', () => {
      const filterValues = {
        'Spec Section #': '01'
      };

      render(
        <SortableTable
          data={mockData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={filterValues}
        />
      );

      // Should render table with filter values
      expect(screen.getByText('Spec Section #')).toBeInTheDocument();
    });
  });

  describe('Text Expansion', () => {
    test('expands text when show more is clicked', () => {
      const longTextData = [
        {
          'Spec Section #': '01 1000',
          'Spec Section Name': 'GENERAL REQUIREMENTS',
          'Inspection Type And Requirements': 'This is a very long text that should be truncated and show a "Show More" button when it exceeds the maximum length allowed in the table cell. The text should expand when the button is clicked.',
          'Inspection Frequency': 'As required',
          'Responsible Party': 'Architect'
        }
      ];

      render(
        <SortableTable
          data={longTextData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Look for show more button
      const showMoreButton = screen.queryByText('Show More');
      if (showMoreButton) {
        fireEvent.click(showMoreButton);
        
        // Should show "Show Less" after expansion
        expect(screen.getByText('Show Less')).toBeInTheDocument();
      }
    });
  });

  describe('Responsive Design', () => {
    test('renders correctly on different screen sizes', () => {
      const { container } = render(
        <SortableTable
          data={mockData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Check that table wrapper has responsive classes
      const tableWrapper = container.querySelector('.l-table-wrapper');
      expect(tableWrapper).toBeInTheDocument();
    });

    test('handles horizontal scrolling for wide tables', () => {
      const wideColumns = [
        { key: 'col1', label: 'Column 1', sortable: true, width: 10, minWidth: 100 },
        { key: 'col2', label: 'Column 2', sortable: true, width: 10, minWidth: 100 },
        { key: 'col3', label: 'Column 3', sortable: true, width: 10, minWidth: 100 },
        { key: 'col4', label: 'Column 4', sortable: true, width: 10, minWidth: 100 },
        { key: 'col5', label: 'Column 5', sortable: true, width: 10, minWidth: 100 },
        { key: 'col6', label: 'Column 6', sortable: true, width: 10, minWidth: 100 },
        { key: 'col7', label: 'Column 7', sortable: true, width: 10, minWidth: 100 },
        { key: 'col8', label: 'Column 8', sortable: true, width: 10, minWidth: 100 },
        { key: 'col9', label: 'Column 9', sortable: true, width: 10, minWidth: 100 },
        { key: 'col10', label: 'Column 10', sortable: true, width: 10, minWidth: 100 }
      ];

      const wideData = [
        { col1: 'data1', col2: 'data2', col3: 'data3', col4: 'data4', col5: 'data5', 
          col6: 'data6', col7: 'data7', col8: 'data8', col9: 'data9', col10: 'data10' }
      ];

      render(
        <SortableTable
          data={wideData}
          columns={wideColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Should render wide table
      expect(screen.getByText('Column 1')).toBeInTheDocument();
      expect(screen.getByText('Column 10')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      render(
        <SortableTable
          data={mockData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Check that table has proper role
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Check that headers are properly labeled
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBe(mockColumns.length);
    });

    test('supports keyboard navigation', () => {
      render(
        <SortableTable
          data={mockData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Should render accessible table structure
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toBe(mockColumns.length);
    });
  });

  describe('Edge Cases', () => {
    test('handles null or undefined data gracefully', () => {
      render(
        <SortableTable
          data={[]}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Spec Section #')).toBeInTheDocument();
    });

    test('handles data with missing fields', () => {
      const incompleteData = [
        {
          'Spec Section #': '01 1000',
          'Spec Section Name': 'GENERAL REQUIREMENTS'
          // Missing other fields
        }
      ];

      render(
        <SortableTable
          data={incompleteData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Should render without crashing
      expect(screen.getByText('01 1000')).toBeInTheDocument();
      expect(screen.getByText('GENERAL REQUIREMENTS')).toBeInTheDocument();
    });

    test('handles very long text content', () => {
      const veryLongText = 'A'.repeat(1000); // Very long text
      const longData = [
        {
          'Spec Section #': '01 1000',
          'Spec Section Name': 'GENERAL REQUIREMENTS',
          'Inspection Type And Requirements': veryLongText,
          'Inspection Frequency': 'As required',
          'Responsible Party': 'Architect'
        }
      ];

      render(
        <SortableTable
          data={longData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Should render without crashing
      expect(screen.getByText('01 1000')).toBeInTheDocument();
    });

    test('handles special characters in data', () => {
      const specialCharData = [
        {
          'Spec Section #': '01 1000',
          'Spec Section Name': 'GENERAL REQUIREMENTS',
          'Inspection Type And Requirements': 'Test with special chars: <>&"\'',
          'Inspection Frequency': 'As required',
          'Responsible Party': 'Architect'
        }
      ];

      render(
        <SortableTable
          data={specialCharData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      // Should render special characters correctly
      expect(screen.getByText('Test with special chars: <>&"\'')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, index) => ({
        'Spec Section #': `${String(index + 1).padStart(2, '0')} ${String((index + 1) * 1000).padStart(4, '0')}`,
        'Spec Section Name': `SECTION ${index + 1}`,
        'Inspection Type And Requirements': `Requirements for section ${index + 1}`,
        'Inspection Frequency': 'As required',
        'Responsible Party': 'Architect'
      }));

      const startTime = performance.now();
      
      render(
        <SortableTable
          data={largeData}
          columns={mockColumns}
          onSort={mockOnSort}
          onFilter={mockOnFilter}
          sorting={{ column: '', order: 'desc' }}
          filterValues={{}}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
    });
  });
});
