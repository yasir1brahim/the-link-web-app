import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useFeatureFlags, FeatureFlagsProvider } from '../FeatureFlagsContext';
import { AuthContext } from '../../auth/authcontext';

// Mock the API calls
jest.mock('../../api/Authentication/api', () => ({
    getCurrentUserData: jest.fn(),
    getTeamDetails: jest.fn(),
}));

// Test component that uses the feature flags context
const TestComponent = ({ teamId }) => {
    const { 
        userFlags, 
        teamFlags, 
        isNoticesFlagActive, 
        isVersioningFlagActive,
        loadTeamFlags 
    } = useFeatureFlags();

    React.useEffect(() => {
        if (teamId) {
            loadTeamFlags(teamId);
        }
    }, [teamId, loadTeamFlags]);

    return (
        <div>
            <div data-testid="user-flags">{userFlags.join(',')}</div>
            <div data-testid="team-flags">{teamFlags[teamId]?.join(',') || 'none'}</div>
            <div data-testid="notices-active">{isNoticesFlagActive(teamId).toString()}</div>
            <div data-testid="versioning-active">{isVersioningFlagActive(teamId).toString()}</div>
        </div>
    );
};

// Mock auth context
const mockAuthContext = {
    token: 'test-token',
    user: {
        id: 1,
        email: 'test@example.com',
        active_flags: ['notices', 'versioning']
    },
    isAuthenticated: true,
    isLoading: false,
    setUserDetails: jest.fn(),
    logout: jest.fn(),
};

const renderWithProviders = (component) => {
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <FeatureFlagsProvider>
                {component}
            </FeatureFlagsProvider>
        </AuthContext.Provider>
    );
};

describe('FeatureFlagsContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should load user flags from auth context', () => {
        renderWithProviders(<TestComponent />);
        
        expect(screen.getByTestId('user-flags')).toHaveTextContent('notices,versioning');
    });

    it('should check if notices flag is active for user', () => {
        renderWithProviders(<TestComponent teamId={1} />);
        
        expect(screen.getByTestId('notices-active')).toHaveTextContent('true');
    });

    it('should check if versioning flag is active for user', () => {
        renderWithProviders(<TestComponent teamId={1} />);
        
        expect(screen.getByTestId('versioning-active')).toHaveTextContent('true');
    });

    it('should load team flags when teamId is provided', async () => {
        const { getCurrentUserData, getTeamDetails } = require('../../api/Authentication/api');
        
        getTeamDetails.mockResolvedValue({
            data: {
                active_flags: ['specgpt', 'inspection_log']
            }
        });

        renderWithProviders(<TestComponent teamId={1} />);

        await waitFor(() => {
            expect(getTeamDetails).toHaveBeenCalledWith(1);
        });

        await waitFor(() => {
            expect(screen.getByTestId('team-flags')).toHaveTextContent('specgpt,inspection_log');
        });
    });

    it('should return false for inactive flags', () => {
        const mockAuthContextNoFlags = {
            ...mockAuthContext,
            user: {
                ...mockAuthContext.user,
                active_flags: []
            }
        };

        render(
            <AuthContext.Provider value={mockAuthContextNoFlags}>
                <FeatureFlagsProvider>
                    <TestComponent teamId={1} />
                </FeatureFlagsProvider>
            </AuthContext.Provider>
        );

        expect(screen.getByTestId('notices-active')).toHaveTextContent('false');
        expect(screen.getByTestId('versioning-active')).toHaveTextContent('false');
    });

    it('should handle missing team flags gracefully', () => {
        renderWithProviders(<TestComponent teamId={999} />);
        
        expect(screen.getByTestId('team-flags')).toHaveTextContent('none');
    });
}); 