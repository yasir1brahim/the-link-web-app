import React from 'react';
import { render, screen } from '@testing-library/react';
import DataTableToolbar from '../DataTableToolbar';

describe('DataTableToolbar', () => {
  it('renders left content', () => {
    render(
      <DataTableToolbar
        leftContent={<button>Left Button</button>}
      />
    );

    expect(screen.getByText('Left Button')).toBeInTheDocument();
  });

  it('renders right content', () => {
    render(
      <DataTableToolbar
        rightContent={<button>Right Button</button>}
      />
    );

    expect(screen.getByText('Right Button')).toBeInTheDocument();
  });

  it('renders both left and right content', () => {
    render(
      <DataTableToolbar
        leftContent={<span>Left</span>}
        rightContent={<span>Right</span>}
      />
    );

    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('applies correct layout classes', () => {
    const { container } = render(
      <DataTableToolbar
        leftContent={<span>Left</span>}
        rightContent={<span>Right</span>}
      />
    );

    expect(container.querySelector('.dt-toolbar')).toBeInTheDocument();
    expect(container.querySelector('.dt-toolbar-left')).toBeInTheDocument();
    expect(container.querySelector('.dt-toolbar-right')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <DataTableToolbar className="custom-toolbar" />
    );

    expect(container.querySelector('.custom-toolbar')).toBeInTheDocument();
  });

  it('renders children in left section if no leftContent', () => {
    render(
      <DataTableToolbar>
        <button>Child Button</button>
      </DataTableToolbar>
    );

    expect(screen.getByText('Child Button')).toBeInTheDocument();
  });
});
