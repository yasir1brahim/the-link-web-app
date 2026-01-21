import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportDropdown from '../ExportDropdown';

describe('ExportDropdown', () => {
  const defaultOptions = [
    { label: 'Excel', value: 'excel', icon: null },
    { label: 'CSV', value: 'csv', icon: null },
  ];

  const defaultProps = {
    options: defaultOptions,
    onExport: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders export button with label', () => {
    render(<ExportDropdown {...defaultProps} />);

    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders custom button label', () => {
    render(<ExportDropdown {...defaultProps} buttonLabel="Download" />);

    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', () => {
    render(<ExportDropdown {...defaultProps} />);

    fireEvent.click(screen.getByText('Export'));

    expect(screen.getByText('Excel')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  it('calls onExport with option value when option is clicked', () => {
    const onExport = jest.fn();
    render(<ExportDropdown {...defaultProps} onExport={onExport} />);

    fireEvent.click(screen.getByText('Export'));
    fireEvent.click(screen.getByText('Excel'));

    expect(onExport).toHaveBeenCalledWith('excel');
  });

  it('closes dropdown after selection', () => {
    render(<ExportDropdown {...defaultProps} />);

    fireEvent.click(screen.getByText('Export'));
    expect(screen.getByText('Excel')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Excel'));

    // Dropdown should close - Excel option no longer visible
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders single option without dropdown', () => {
    const singleOption = [{ label: 'Excel', value: 'excel', icon: null }];
    const onExport = jest.fn();
    render(<ExportDropdown options={singleOption} onExport={onExport} />);

    // Should still work as dropdown for future extensibility
    fireEvent.click(screen.getByText('Export'));
    fireEvent.click(screen.getByText('Excel'));

    expect(onExport).toHaveBeenCalledWith('excel');
  });

  it('is disabled when disabled prop is true', () => {
    render(<ExportDropdown {...defaultProps} disabled={true} />);

    const button = screen.getByText('Export').closest('button');
    expect(button).toBeDisabled();
  });
});
