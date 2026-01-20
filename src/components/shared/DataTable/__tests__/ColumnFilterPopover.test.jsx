import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ColumnFilterPopover from '../ColumnFilterPopover';

describe('ColumnFilterPopover', () => {
  const defaultOptions = ['Option A', 'Option B', 'Option C'];
  const defaultProps = {
    options: defaultOptions,
    selectedValue: null,
    onChange: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all options', () => {
    render(<ColumnFilterPopover {...defaultProps} />);

    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('renders "All" option at the top', () => {
    render(<ColumnFilterPopover {...defaultProps} />);

    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('highlights selected option', () => {
    render(<ColumnFilterPopover {...defaultProps} selectedValue="Option B" />);

    const selectedOption = screen.getByText('Option B').closest('.dt-filter-option');
    expect(selectedOption).toHaveClass('selected');
  });

  it('highlights "All" when no value is selected', () => {
    render(<ColumnFilterPopover {...defaultProps} selectedValue={null} />);

    const allOption = screen.getByText('All').closest('.dt-filter-option');
    expect(allOption).toHaveClass('selected');
  });

  it('calls onChange with option value when option is clicked', () => {
    const onChange = jest.fn();
    render(<ColumnFilterPopover {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByText('Option A'));

    expect(onChange).toHaveBeenCalledWith('Option A');
  });

  it('calls onChange with null when "All" is clicked', () => {
    const onChange = jest.fn();
    render(<ColumnFilterPopover {...defaultProps} selectedValue="Option A" onChange={onChange} />);

    fireEvent.click(screen.getByText('All'));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('calls onClose after selection', () => {
    const onClose = jest.fn();
    render(<ColumnFilterPopover {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Option A'));

    expect(onClose).toHaveBeenCalled();
  });

  it('supports object options with id and name', () => {
    const objectOptions = [
      { id: 1, name: 'File 1' },
      { id: 2, name: 'File 2' },
    ];
    const onChange = jest.fn();
    render(
      <ColumnFilterPopover
        options={objectOptions}
        selectedValue={1}
        onChange={onChange}
        onClose={jest.fn()}
        valueKey="id"
        labelKey="name"
      />
    );

    expect(screen.getByText('File 1')).toBeInTheDocument();
    expect(screen.getByText('File 2')).toBeInTheDocument();

    const selectedOption = screen.getByText('File 1').closest('.dt-filter-option');
    expect(selectedOption).toHaveClass('selected');

    fireEvent.click(screen.getByText('File 2'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('renders empty state when no options', () => {
    render(<ColumnFilterPopover {...defaultProps} options={[]} />);

    expect(screen.getByText('No options available')).toBeInTheDocument();
  });
});
