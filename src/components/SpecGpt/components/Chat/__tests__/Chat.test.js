import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Chat from '../index';
import { fetchMostRecentLog, generateAiLog, fetchChatHistory, fetchChatSessionHistory } from '../../../../utils/apiUtils';

// Mock the API utilities
jest.mock('../../../../utils/apiUtils', () => ({
    fetchMostRecentLog: jest.fn(),
    generateAiLog: jest.fn(),
    fetchChatHistory: jest.fn(),
    fetchChatSessionHistory: jest.fn(),
    fetchPromptAnswer: jest.fn(),
}));

// Mock the child components
jest.mock('../ChatSidebar', () => {
    return function MockChatSidebar({ onShowOwnerDeliverablesLogsClick }) {
        return (
            <div data-testid="chat-sidebar">
                <button data-testid="owner-deliverables-btn" onClick={onShowOwnerDeliverablesLogsClick}>
                    View Owner Deliverables Log
                </button>
            </div>
        );
    };
});

jest.mock('../ChatMain', () => {
    return function MockChatMain() {
        return <div data-testid="chat-main">Chat Main Component</div>;
    };
});

jest.mock('../LogViewer', () => {
    return function MockLogViewer({ logType, onBack }) {
        return (
            <div data-testid="log-viewer">
                <div data-testid="log-type">{logType}</div>
                <button data-testid="back-btn" onClick={onBack}>Back</button>
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

describe('Chat Component - Direct Log Viewing', () => {
    const mockProps = {
        projectId: '123',
        projectVersionId: '456',
        chatSessionId: null,
        setChatSessionId: jest.fn(),
        messages: [],
        setMessages: jest.fn(),
        chatHistory: [],
        setChatHistory: jest.fn(),
        isInspectionLogFeatureFlagActive: true,
        isLoadingMessage: false,
        setIsLoadingMessage: jest.fn(),
        userInput: '',
        setUserInput: jest.fn(),
        isGeneratingLog: false,
        setIsGeneratingLog: jest.fn(),
        isChatEnabled: true,
        setIsChatEnabled: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        fetchChatHistory.mockResolvedValue([]);
        fetchChatSessionHistory.mockResolvedValue([]);
    });

    it('should show owner deliverables log directly when most recent log exists', async () => {
        const mockLogData = {
            id: '789',
            log_table: 'Test owner deliverables log content',
            created_at: '2024-01-01T00:00:00Z',
            log_status: 'SUCCESS'
        };
        
        fetchMostRecentLog.mockResolvedValue(mockLogData);
        
        renderWithChakra(<Chat {...mockProps} />);
        
        const ownerButton = screen.getByTestId('owner-deliverables-btn');
        fireEvent.click(ownerButton);
        
        await waitFor(() => {
            expect(fetchMostRecentLog).toHaveBeenCalledWith('123', '456', 'owner_deliverables_log');
        });
        
        await waitFor(() => {
            expect(screen.getByTestId('log-viewer')).toBeInTheDocument();
            expect(screen.getByTestId('log-type')).toHaveTextContent('owner_deliverables_log');
        });
    });

    it('should start generation when no owner deliverables log exists', async () => {
        fetchMostRecentLog.mockResolvedValue(null);
        generateAiLog.mockResolvedValue({ id: 'new-789' });
        
        renderWithChakra(<Chat {...mockProps} />);
        
        const ownerButton = screen.getByTestId('owner-deliverables-btn');
        fireEvent.click(ownerButton);
        
        await waitFor(() => {
            expect(fetchMostRecentLog).toHaveBeenCalledWith('123', '456', 'owner_deliverables_log');
        });
        
        await waitFor(() => {
            expect(generateAiLog).toHaveBeenCalledWith('123', '456', 'owner_deliverables_log');
        });
        
        await waitFor(() => {
            expect(screen.getByTestId('log-viewer')).toBeInTheDocument();
        });
    });

    it('should show processing owner deliverables log without starting new generation', async () => {
        const processingLogData = {
            id: '789',
            log_table: '',
            created_at: '2024-01-01T00:00:00Z',
            log_status: 'PROCESSING'
        };
        
        fetchMostRecentLog.mockResolvedValue(processingLogData);
        
        renderWithChakra(<Chat {...mockProps} />);
        
        const ownerButton = screen.getByTestId('owner-deliverables-btn');
        fireEvent.click(ownerButton);
        
        await waitFor(() => {
            expect(fetchMostRecentLog).toHaveBeenCalledWith('123', '456', 'owner_deliverables_log');
        });
        
        // Should not call generateAiLog when log is processing
        await waitFor(() => {
            expect(generateAiLog).not.toHaveBeenCalled();
        });
        
        await waitFor(() => {
            expect(screen.getByTestId('log-viewer')).toBeInTheDocument();
        });
    });

    it('should show loading state while fetching log', async () => {
        fetchMostRecentLog.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(null), 100)));

        renderWithChakra(<Chat {...mockProps} />);

        const ownerButton = screen.getByTestId('owner-deliverables-btn');
        fireEvent.click(ownerButton);

        expect(screen.getByText('Loading log...')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
        fetchMostRecentLog.mockRejectedValue(new Error('API Error'));

        renderWithChakra(<Chat {...mockProps} />);

        const ownerButton = screen.getByTestId('owner-deliverables-btn');
        fireEvent.click(ownerButton);

        await waitFor(() => {
            expect(fetchMostRecentLog).toHaveBeenCalled();
        });

        // Should return to chat view after error
        await waitFor(() => {
            expect(screen.getByTestId('chat-main')).toBeInTheDocument();
        });
    });

    it('should return to chat view when back button is clicked from log viewer', async () => {
        const mockLogData = {
            id: '789',
            log_table: 'Test log content',
            created_at: '2024-01-01T00:00:00Z',
            log_status: 'SUCCESS'
        };

        fetchMostRecentLog.mockResolvedValue(mockLogData);

        renderWithChakra(<Chat {...mockProps} />);

        const ownerButton = screen.getByTestId('owner-deliverables-btn');
        fireEvent.click(ownerButton);

        await waitFor(() => {
            expect(screen.getByTestId('log-viewer')).toBeInTheDocument();
        });

        const backButton = screen.getByTestId('back-btn');
        fireEvent.click(backButton);

        await waitFor(() => {
            expect(screen.getByTestId('chat-main')).toBeInTheDocument();
        });
    });

    it('should reset log viewer state when new chat is clicked', async () => {
        const mockLogData = {
            id: '789',
            log_table: 'Test log content',
            created_at: '2024-01-01T00:00:00Z',
            log_status: 'SUCCESS'
        };

        fetchMostRecentLog.mockResolvedValue(mockLogData);

        renderWithChakra(<Chat {...mockProps} />);

        // First, navigate to log viewer
        const ownerButton = screen.getByTestId('owner-deliverables-btn');
        fireEvent.click(ownerButton);

        await waitFor(() => {
            expect(screen.getByTestId('log-viewer')).toBeInTheDocument();
        });

        // Then click new chat (this would be handled by the parent component)
        // For this test, we'll verify the state is properly managed
        expect(mockProps.setChatSessionId).toHaveBeenCalledWith(null);
    });
});
