import React from 'react';
import { render, screen } from '@testing-library/react';
import HighlightLegend from '../HighlightLegend';

const CUSTOM_TYPES = [
  { id: 77, name: 'Safety', color: '#FF0000' },
  { id: 12, name: 'Commissioning', color: '#00FF00' },
];

const CUSTOM_HIGHLIGHT = {
  id: 'custom-1',
  extraction_type: 'custom_highlights',
  custom_item_type: { id: 77, name: 'Safety' },
};

describe('HighlightLegend', () => {
  it('renders highlight types alphabetically', () => {
    render(
      <HighlightLegend
        submittalHighlights={[]}
        aiLogHighlights={[]}
        onFilterChange={jest.fn()}
        customItemTypes={[]}
      />
    );

    const legendItems = screen.getAllByText((content, element) => {
      const hasLegendLabelClass = element.classList?.contains('legend-label');
      return hasLegendLabelClass && element.textContent.trim().length > 0;
    });

    const labels = legendItems.map((item) => item.textContent.trim());
    const sortedLabels = [...labels].sort((a, b) => a.localeCompare(b));

    expect(labels).toEqual(sortedLabels);
  });

  it('includes custom highlight types with counts and default filters', () => {
    const onFilterChange = jest.fn();

    render(
      <HighlightLegend
        submittalHighlights={[]}
        aiLogHighlights={[CUSTOM_HIGHLIGHT]}
        onFilterChange={onFilterChange}
        customItemTypes={CUSTOM_TYPES}
      />
    );

    expect(screen.getByText(/Safety/)).toBeInTheDocument();
    expect(screen.getByText(/Safety/).textContent).toContain('(1)');

    const initialFilters = onFilterChange.mock.calls[0][0];
    expect(initialFilters.has('custom_77')).toBe(true);
  });
});

