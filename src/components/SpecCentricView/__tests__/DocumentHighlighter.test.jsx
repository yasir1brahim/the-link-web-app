import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import DocumentHighlighter from '../DocumentHighlighter';
import { HIGHLIGHT_TYPES } from '../highlightConstants';

jest.mock('../../PdfReader/projectLogsReader', () => jest.fn(() => null));

const STABLE_HIGHLIGHTS = [];
const EXISTING_AI_HIGHLIGHTS = [
  {
    id: 'highlight-1',
    extraction_type: 'qa_planner',
    item_type: 'inspections',
    requirement_text: 'Inspect the concrete forms.',
    pdf_locations: [{ page_no: 1, x: 0.1, y: 0.2, width: 0.3, height: 0.4 }],
  },
];

describe('DocumentHighlighter manual highlight options', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('includes every highlight color option even when AI highlights only cover a subset', async () => {
    const ProjectLogsReader = require('../../PdfReader/projectLogsReader');

    render(
      <DocumentHighlighter
        documentUrl="https://example.com/doc.pdf"
        documentId="doc-1"
        specSection={{
          id: 101,
          masterformat_number: '01',
          masterformat_title: 'General Requirements',
        }}
        projectId={202}
        highlights={STABLE_HIGHLIGHTS}
        aiLogHighlights={EXISTING_AI_HIGHLIGHTS}
      />
    );

    const latestCall = ProjectLogsReader.mock.calls[0];
    const { onRequestAddHighlight } = latestCall[0];

    act(() =>
      onRequestAddHighlight({
        selectedText: 'Sample highlight text',
        locations: [{ page_no: 2, x: 0.15, y: 0.25, width: 0.35, height: 0.45 }],
      })
    );

    await screen.findByText('Add New Highlight');

    for (const highlightType of HIGHLIGHT_TYPES) {
      expect(
        await screen.findByRole('button', { name: highlightType.type })
      ).toBeInTheDocument();
    }
  });
});

