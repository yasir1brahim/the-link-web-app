import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchInput from '../SearchInput';

describe('SearchInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Search...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Expanded state', () => {
    it('renders input when expanded', () => {
      render(<SearchInput {...defaultProps} expanded={true} />);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('displays current value in input', () => {
      render(<SearchInput {...defaultProps} value="test query" expanded={true} />);

      expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
    });

    it('calls onChange when typing', () => {
      const onChange = jest.fn();
      render(<SearchInput {...defaultProps} onChange={onChange} expanded={true} />);

      fireEvent.change(screen.getByPlaceholderText('Search...'), {
        target: { value: 'new value' },
      });

      expect(onChange).toHaveBeenCalledWith('new value');
    });

    it('renders clear button when value is not empty', () => {
      render(<SearchInput {...defaultProps} value="test" expanded={true} />);

      expect(screen.getByTestId('search-clear')).toBeInTheDocument();
    });

    it('does not render clear button when value is empty', () => {
      render(<SearchInput {...defaultProps} value="" expanded={true} />);

      expect(screen.queryByTestId('search-clear')).not.toBeInTheDocument();
    });

    it('calls onChange with empty string when clear is clicked', () => {
      const onChange = jest.fn();
      render(<SearchInput {...defaultProps} value="test" onChange={onChange} expanded={true} />);

      fireEvent.click(screen.getByTestId('search-clear'));

      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('Collapsed state', () => {
    it('renders search icon button when collapsed', () => {
      render(<SearchInput {...defaultProps} expanded={false} onExpand={jest.fn()} />);

      expect(screen.getByTestId('search-expand')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    });

    it('calls onExpand when search icon is clicked', () => {
      const onExpand = jest.fn();
      render(<SearchInput {...defaultProps} expanded={false} onExpand={onExpand} />);

      fireEvent.click(screen.getByTestId('search-expand'));

      expect(onExpand).toHaveBeenCalled();
    });
  });

  describe('Always expanded mode', () => {
    it('renders input without collapse functionality when alwaysExpanded', () => {
      render(<SearchInput {...defaultProps} alwaysExpanded={true} />);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      expect(screen.queryByTestId('search-expand')).not.toBeInTheDocument();
    });
  });
});
