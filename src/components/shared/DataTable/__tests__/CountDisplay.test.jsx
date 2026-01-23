import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CountDisplay from '../CountDisplay';

describe('CountDisplay', () => {
  const defaultCounts = [
    { label: 'documents', count: 5, onClick: jest.fn() },
    { label: 'spec sections', count: 3, onClick: jest.fn() },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders counts with labels', () => {
    render(<CountDisplay counts={defaultCounts} />);

    expect(screen.getByText('5 documents')).toBeInTheDocument();
    expect(screen.getByText('3 spec sections')).toBeInTheDocument();
  });

  it('renders singular label when count is 1', () => {
    const counts = [
      { label: 'document', labelPlural: 'documents', count: 1, onClick: jest.fn() },
    ];
    render(<CountDisplay counts={counts} />);

    expect(screen.getByText('1 document')).toBeInTheDocument();
  });

  it('renders plural label when count is not 1', () => {
    const counts = [
      { label: 'document', labelPlural: 'documents', count: 5, onClick: jest.fn() },
    ];
    render(<CountDisplay counts={counts} />);

    expect(screen.getByText('5 documents')).toBeInTheDocument();
  });

  it('calls onClick when count is clicked', () => {
    const onClick = jest.fn();
    const counts = [{ label: 'items', count: 10, onClick }];
    render(<CountDisplay counts={counts} />);

    fireEvent.click(screen.getByText('10 items'));

    expect(onClick).toHaveBeenCalled();
  });

  it('renders separator between counts', () => {
    render(<CountDisplay counts={defaultCounts} />);

    expect(screen.getByText('|')).toBeInTheDocument();
  });

  it('does not render counts with zero value by default', () => {
    const counts = [
      { label: 'items', count: 0, onClick: jest.fn() },
      { label: 'other', count: 5, onClick: jest.fn() },
    ];
    render(<CountDisplay counts={counts} />);

    expect(screen.queryByText('0 items')).not.toBeInTheDocument();
    expect(screen.getByText('5 other')).toBeInTheDocument();
  });

  it('renders counts with zero value when showZero is true', () => {
    const counts = [
      { label: 'items', count: 0, onClick: jest.fn(), showZero: true },
    ];
    render(<CountDisplay counts={counts} />);

    expect(screen.getByText('0 items')).toBeInTheDocument();
  });

  it('renders total count when provided', () => {
    render(<CountDisplay counts={defaultCounts} totalCount={100} totalLabel="submittals" />);

    expect(screen.getByText('100 submittals')).toBeInTheDocument();
  });

  it('does not render when all counts are zero and no total', () => {
    const counts = [
      { label: 'items', count: 0, onClick: jest.fn() },
    ];
    const { container } = render(<CountDisplay counts={counts} />);

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
