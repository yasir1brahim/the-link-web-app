import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import DocumentHighlighter from '../DocumentHighlighter';
import { HIGHLIGHT_TYPES } from '../highlightConstants';

jest.mock('../../PdfReader/projectLogsReader', () => jest.fn(() => null));
jest.mock('../../../api/SpecCentricView/api', () => ({
  createManualHighlight: jest.fn(),
}));
jest.mock('../shared/CustomItemTypesManager', () =>
  jest.fn(({ isOpen, onClose }) =>
    isOpen ? (
      <button type="button" data-testid="custom-types-manager" onClick={onClose}>
        Close
      </button>
    ) : null
  )
);

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

const CUSTOM_TYPES = [
  {
    id: 77,
    name: 'Safety',
    color: '#FF0000',
  },
];

describe('DocumentHighlighter manual highlight options', () => {
  const { createManualHighlight } = require('../../../api/SpecCentricView/api');
  const CustomItemTypesManager = require('../shared/CustomItemTypesManager');

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
        customItemTypes={[]}
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

  it('adds custom highlight buttons when custom types are provided', async () => {
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
        customItemTypes={CUSTOM_TYPES}
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

    expect(await screen.findByRole('button', { name: 'Safety' })).toBeInTheDocument();
  });

  it('creates manual highlight with custom highlight metadata', async () => {
    createManualHighlight.mockResolvedValue({ data: {} });
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
        customItemTypes={CUSTOM_TYPES}
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

    fireEvent.click(await screen.findByRole('button', { name: 'Safety' }));

    await waitFor(() => {
      expect(createManualHighlight).toHaveBeenCalled();
    });

    const [, payload] = createManualHighlight.mock.calls[0];
    expect(payload.custom_item_type_id).toBe(77);
    expect(payload.extraction_type).toBe('custom_highlights');
  });

  it('opens and closes the custom type manager overlay', async () => {
    createManualHighlight.mockResolvedValue({ data: {} });
    const ProjectLogsReader = require('../../PdfReader/projectLogsReader');
    const onCustomTypesUpdate = jest.fn();

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
        customItemTypes={CUSTOM_TYPES}
        onCustomTypesUpdate={onCustomTypesUpdate}
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

    const manageButton = await screen.findByRole('button', { name: /manage custom types/i });
    fireEvent.click(manageButton);

    const lastCall = CustomItemTypesManager.mock.calls[CustomItemTypesManager.mock.calls.length - 1];
    const props = lastCall[0];
    expect(props.projectId).toBe(202);
    expect(props.initialTypes).toEqual(CUSTOM_TYPES);
    expect(props.isOpen).toBe(true);

    props.onClose();

    await waitFor(() => expect(onCustomTypesUpdate).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByTestId('custom-types-manager')).not.toBeInTheDocument());
  });
});

