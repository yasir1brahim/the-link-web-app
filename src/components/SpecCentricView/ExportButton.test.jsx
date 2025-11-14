import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportButton from './ExportButton';

describe('ExportButton', () => {
  it('should render export button', () => {
    render(<ExportButton onClick={() => {}} />);
    const button = screen.getByRole('button', { name: /export/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<ExportButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /export/i });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ExportButton onClick={() => {}} disabled={true} />);
    const button = screen.getByRole('button', { name: /export/i });
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled and clicked', () => {
    const mockOnClick = jest.fn();
    render(<ExportButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole('button', { name: /export/i });
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });
});
