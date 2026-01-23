import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportModal from './ExportModal';

describe('ExportModal', () => {
  const mockSections = [
    {
      id: 1,
      masterformat_number: '01 00 00',
      custom_section_title: 'General Requirements',
      pdf_url: 'https://example.com/01.pdf',
    },
    {
      id: 2,
      masterformat_number: '02 00 00',
      custom_section_title: 'Site Construction',
      pdf_url: 'https://example.com/02.pdf',
    },
  ];

  it('should render export modal when open', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={() => {}}
        sections={mockSections}
        onExport={() => {}}
      />
    );

    expect(screen.getByText(/export spec sections/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const { container } = render(
      <ExportModal
        isOpen={false}
        onClose={() => {}}
        sections={mockSections}
        onExport={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should display all sections', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={() => {}}
        sections={mockSections}
        onExport={() => {}}
      />
    );

    expect(screen.getByText(/01 00 00/)).toBeInTheDocument();
    expect(screen.getByText(/General Requirements/)).toBeInTheDocument();
    expect(screen.getByText(/02 00 00/)).toBeInTheDocument();
    expect(screen.getByText(/Site Construction/)).toBeInTheDocument();
  });

  it('should have all sections selected by default', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={() => {}}
        sections={mockSections}
        onExport={() => {}}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  it('should allow toggling section selection', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={() => {}}
        sections={mockSections}
        onExport={() => {}}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[1]; // Skip "select all" if present

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).not.toBeChecked();

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();
  });

  it('should call onClose when cancel button clicked', () => {
    const mockOnClose = jest.fn();
    render(
      <ExportModal
        isOpen={true}
        onClose={mockOnClose}
        sections={mockSections}
        onExport={() => {}}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onExport with selected sections when export clicked', () => {
    const mockOnExport = jest.fn();
    render(
      <ExportModal
        isOpen={true}
        onClose={() => {}}
        sections={mockSections}
        onExport={mockOnExport}
      />
    );

    const exportButton = screen.getByRole('button', { name: /^export$/i });
    fireEvent.click(exportButton);

    expect(mockOnExport).toHaveBeenCalledTimes(1);
    expect(mockOnExport).toHaveBeenCalledWith(mockSections);
  });

  it('should disable export button when no sections selected', () => {
    render(
      <ExportModal
        isOpen={true}
        onClose={() => {}}
        sections={mockSections}
        onExport={() => {}}
      />
    );

    // Uncheck all sections
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        fireEvent.click(checkbox);
      }
    });

    const exportButton = screen.getByRole('button', { name: /^export$/i });
    expect(exportButton).toBeDisabled();
  });

  it('should handle sections without PDF URLs', () => {
    const sectionsWithoutPdf = [
      ...mockSections,
      {
        id: 3,
        masterformat_number: '03 00 00',
        custom_section_title: 'Concrete',
        pdf_url: null,
      },
    ];

    render(
      <ExportModal
        isOpen={true}
        onClose={() => {}}
        sections={sectionsWithoutPdf}
        onExport={() => {}}
      />
    );

    // Section without PDF should be displayed but disabled
    expect(screen.getByText(/03 00 00/)).toBeInTheDocument();
    expect(screen.getByText(/Concrete/)).toBeInTheDocument();
  });

  describe('Progress State', () => {
    it('should display progress when exporting', () => {
      const exportProgress = {
        status: 'exporting',
        current: 1,
        total: 2,
        message: 'Exporting section 1 of 2...',
      };

      render(
        <ExportModal
          isOpen={true}
          onClose={() => {}}
          sections={mockSections}
          onExport={() => {}}
          exportProgress={exportProgress}
        />
      );

      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
      expect(screen.getByText('1 of 2')).toBeInTheDocument();
    });

    it('should display completion message when done', () => {
      const exportProgress = {
        status: 'complete',
        message: 'Export complete!',
      };

      render(
        <ExportModal
          isOpen={true}
          onClose={() => {}}
          sections={mockSections}
          onExport={() => {}}
          exportProgress={exportProgress}
        />
      );

      expect(screen.getByText(/complete/i)).toBeInTheDocument();
    });

    it('should display error message when export fails', () => {
      const exportProgress = {
        status: 'error',
        message: 'Export failed: Network error',
      };

      render(
        <ExportModal
          isOpen={true}
          onClose={() => {}}
          sections={mockSections}
          onExport={() => {}}
          exportProgress={exportProgress}
        />
      );

      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });

    it('should disable section selection during export', () => {
      const exportProgress = {
        status: 'exporting',
        current: 1,
        total: 2,
      };

      render(
        <ExportModal
          isOpen={true}
          onClose={() => {}}
          sections={mockSections}
          onExport={() => {}}
          exportProgress={exportProgress}
        />
      );

      // Section list should not be visible during export
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes).toHaveLength(0);
    });

    it('should disable export button during export', () => {
      const exportProgress = {
        status: 'exporting',
        current: 1,
        total: 2,
      };

      render(
        <ExportModal
          isOpen={true}
          onClose={() => {}}
          sections={mockSections}
          onExport={() => {}}
          exportProgress={exportProgress}
        />
      );

      const exportButton = screen.getByRole('button', { name: /^export$/i });
      expect(exportButton).toBeDisabled();
    });

    it('should hide cancel button during export', () => {
      const exportProgress = {
        status: 'exporting',
        current: 1,
        total: 2,
      };

      render(
        <ExportModal
          isOpen={true}
          onClose={() => {}}
          sections={mockSections}
          onExport={() => {}}
          exportProgress={exportProgress}
        />
      );

      const cancelButton = screen.queryByRole('button', { name: /cancel/i });
      expect(cancelButton).not.toBeInTheDocument();
    });

    it('should show close button after export completes', () => {
      const exportProgress = {
        status: 'complete',
        message: 'Export complete!',
      };

      render(
        <ExportModal
          isOpen={true}
          onClose={() => {}}
          sections={mockSections}
          onExport={() => {}}
          exportProgress={exportProgress}
        />
      );

      // Should have a Close button in footer (not just the × button)
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      expect(closeButtons.length).toBeGreaterThan(0);
      // The footer close button should have the exact text "Close"
      const footerCloseButton = screen.getByRole('button', { name: 'Close' });
      expect(footerCloseButton).toBeInTheDocument();
    });
  });
});
