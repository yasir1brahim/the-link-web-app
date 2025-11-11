import React from 'react';
import { render, screen } from '@testing-library/react';
import HighlightLegend from '../HighlightLegend';

describe('HighlightLegend', () => {
  it('renders highlight types alphabetically', () => {
    render(
      <HighlightLegend
        submittalHighlights={[]}
        aiLogHighlights={[]}
        onFilterChange={jest.fn()}
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
});

