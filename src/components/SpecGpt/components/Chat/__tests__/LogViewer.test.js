import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import LogViewer from '../LogViewer';
import { fetchAiGeneratedLogDetail, generateAiLog } from '../../../../utils/apiUtils';

// Mock the API utilities
jest.mock('../../../../utils/apiUtils', () => ({
    fetchAiGeneratedLogDetail: jest.fn(),
    generateAiLog: jest.fn(),
}));

// Mock the Message component
jest.mock('../ChatMain/Message', () => {
    return function MockMessage({ messageType, message, isLoading }) {
        return (
            <div data-testid="message-component">
                <div data-testid="message-type">{messageType}</div>
                <div data-testid="message-content">{message}</div>
                <div data-testid="message-loading">{isLoading.toString()}</div>
            </div>
        );
    };
});

const renderWithChakra = (component) => {
    return render(
        <ChakraProvider>
            {component}
        </ChakraProvider>
    );
};

describe('LogViewer', () => {
    const mockProps = {
        projectId: '123',
        projectVersionId: '456',
        logType: 'inspection_log',
        onBack: jest.fn(),
        initialLogData: {
            id: '789',
            log_table: 'Test log content',
            created_at: '2024-01-01T00:00:00Z',
            log_status: 'SUCCESS'
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render log viewer with initial data', () => {
        renderWithChakra(<LogViewer {...mockProps} />);
        
        expect(screen.getByText('Inspections List')).toBeInTheDocument();
        expect(screen.getByText('Back')).toBeInTheDocument();
        expect(screen.getByText('Regenerate Inspections List')).toBeInTheDocument();
        expect(screen.getByText('SUCCESS')).toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', () => {
        renderWithChakra(<LogViewer {...mockProps} />);
        
        const backButton = screen.getByText('Back');
        fireEvent.click(backButton);
        
        expect(mockProps.onBack).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when regenerating log', async () => {
        generateAiLog.mockResolvedValue({ id: 'new-789' });
        
        renderWithChakra(<LogViewer {...mockProps} />);
        
        const regenerateButton = screen.getByText('Regenerate Inspections List');
        fireEvent.click(regenerateButton);
        
        expect(screen.getByText('Regenerating...')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(generateAiLog).toHaveBeenCalledWith('123', '456', 'inspection_log');
        });
    });

    it('should disable regenerate button when log is processing', () => {
        const processingProps = {
            ...mockProps,
            initialLogData: {
                ...mockProps.initialLogData,
                log_status: 'PROCESSING'
            }
        };
        
        renderWithChakra(<LogViewer {...processingProps} />);
        
        const regenerateButton = screen.getByText('Regenerate Inspections List');
        expect(regenerateButton).toBeDisabled();
    });

    it('should not start regeneration when log is processing', async () => {
        const processingProps = {
            ...mockProps,
            initialLogData: {
                ...mockProps.initialLogData,
                log_status: 'PROCESSING'
            }
        };
        
        renderWithChakra(<LogViewer {...processingProps} />);
        
        const regenerateButton = screen.getByText('Regenerate Inspections List');
        fireEvent.click(regenerateButton);
        
        await waitFor(() => {
            expect(generateAiLog).not.toHaveBeenCalled();
        });
    });

    it('should handle processing status correctly', () => {
        const processingProps = {
            ...mockProps,
            initialLogData: {
                ...mockProps.initialLogData,
                log_status: 'PROCESSING'
            }
        };
        
        renderWithChakra(<LogViewer {...processingProps} />);
        
        expect(screen.getByText('PROCESSING')).toBeInTheDocument();
    });

    it('should handle failure status correctly', () => {
        const failureProps = {
            ...mockProps,
            initialLogData: {
                ...mockProps.initialLogData,
                log_status: 'FAILURE'
            }
        };
        
        renderWithChakra(<LogViewer {...failureProps} />);
        
        expect(screen.getByText('FAILURE')).toBeInTheDocument();
    });

    it('should display owner deliverables log type correctly', () => {
        const ownerProps = {
            ...mockProps,
            logType: 'owner_deliverables_log'
        };
        
        renderWithChakra(<LogViewer {...ownerProps} />);
        
        expect(screen.getByText('Owner Deliverables List')).toBeInTheDocument();
        expect(screen.getByText('Regenerate Owner Deliverables List')).toBeInTheDocument();
    });

    it('should show loading state initially when no initial data provided', () => {
        const propsWithoutInitialData = {
            ...mockProps,
            initialLogData: null,
            logId: '789'
        };
        
        fetchAiGeneratedLogDetail.mockResolvedValue(mockProps.initialLogData);
        
        renderWithChakra(<LogViewer {...propsWithoutInitialData} />);
        
        expect(screen.getByText('Loading log...')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
        generateAiLog.mockRejectedValue(new Error('API Error'));
        
        renderWithChakra(<LogViewer {...mockProps} />);
        
        const regenerateButton = screen.getByText('Regenerate Inspections List');
        fireEvent.click(regenerateButton);
        
        await waitFor(() => {
            expect(generateAiLog).toHaveBeenCalled();
        });
        
        // Should not show loading state after error
        expect(screen.queryByText('Regenerating...')).not.toBeInTheDocument();
    });
});
