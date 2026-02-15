import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SpecConflictsTab from '../SpecConflictsTab';
import * as api from '../../../api/SpecConflicts/api';

jest.mock('../../../api/SpecConflicts/api');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock WebViewer
jest.mock('@pdftron/webviewer', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({
    Core: {
      documentViewer: { addEventListener: jest.fn() },
      annotationManager: { addAnnotation: jest.fn(), redrawAnnotation: jest.fn() },
      Annotations: { RectangleAnnotation: jest.fn(), Color: jest.fn() },
    },
    UI: { dispose: jest.fn() },
  })),
}));

describe('SpecConflictsTab', () => {
  const defaultProps = {
    projectId: 123,
    projectVersionId: 456,
    teamId: 789,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows prompt when no comparison exists', async () => {
    api.getSpecComparisons.mockResolvedValue({ data: { results: [] } });

    render(<SpecConflictsTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('No spec comparison has been run yet')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Run Comparison' })).toBeInTheDocument();
  });

  it('shows conflicts when comparison is successful', async () => {
    api.getSpecComparisons.mockResolvedValue({
      data: {
        results: [{ id: 1, status: 'SUCCESS' }],
      },
    });
    api.getSpecConflicts.mockResolvedValue({
      data: {
        results: [
          {
            id: 101,
            sheet_number: 'P-201',
            note_text: 'Test note',
            spec_text: 'Test spec',
            spec_masterformat_number: '220500',
            reason: 'Test reason',
          },
        ],
        count: 1,
        comparison: { id: 1, status: 'SUCCESS' },
        filter_options: {},
      },
    });

    render(<SpecConflictsTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('P-201')).toBeInTheDocument();
    });
  });

  it('shows error state when comparison failed', async () => {
    api.getSpecComparisons.mockResolvedValue({
      data: {
        results: [{ id: 1, status: 'FAILED', error_message: 'Something went wrong' }],
      },
    });

    render(<SpecConflictsTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Comparison failed')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('triggers comparison when button clicked', async () => {
    api.getSpecComparisons.mockResolvedValue({ data: { results: [] } });
    api.triggerSpecComparison.mockResolvedValue({
      data: { id: 2, status: 'PROCESSING' },
    });

    render(<SpecConflictsTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Run Comparison' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Run Comparison' }));

    await waitFor(() => {
      expect(api.triggerSpecComparison).toHaveBeenCalledWith(123, 456);
    });
  });
});
