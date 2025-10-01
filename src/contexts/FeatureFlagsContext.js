import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from '../auth/authcontext';
import { getCurrentUserData, getTeamDetails } from '../api/Authentication/api';
import { 
    NOTICES_FEATURE_FLAG_NAME, 
    VERSIONING_FEATURE_FLAG_NAME, 
    VERSION_COMPARISON_FEATURE_FLAG_NAME,
    VERSION_COMPARISON_SEARCH_FEATURE_FLAG_NAME,
    FULL_SPEC_PROCESSING_FEATURE_FLAG_NAME,
    SPEC_GPT_FEATURE_FLAG_NAME,
    SPEC_GPT_WEBSOCKETS_FEATURE_FLAG_NAME,
    INSPECTION_LOG_FEATURE_FLAG_NAME,
    INSPECTION_LOG_USE_DATA_TABLES_FEATURE_FLAG_NAME,
    QA_PLANNER_FEATURE_FLAG_NAME,
    SPEC_CENTERED_VIEW_FEATURE_FLAG_NAME
} from '../constants';

const FeatureFlagsContext = createContext();

// Hook to use auth context
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagsContext);
    if (!context) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
    }
    return context;
};

export const FeatureFlagsProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [userFlags, setUserFlags] = useState([]);
    const [teamFlags, setTeamFlags] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingTeamIds, setLoadingTeamIds] = useState(new Set());

    // Load user flags when user is authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            setUserFlags(user.active_flags || []);
        } else {
            setUserFlags([]);
        }
    }, [isAuthenticated, user]);

    // Load team flags for a specific team
    const loadTeamFlags = async (teamId) => {
        if (!teamId || teamFlags[teamId]) {
            return teamFlags[teamId] || [];
        }

        // Prevent multiple simultaneous requests for the same team
        if (loadingTeamIds.has(teamId)) {
            return teamFlags[teamId] || [];
        }

        setLoadingTeamIds(prev => new Set(prev).add(teamId));
        setIsLoading(true);
        
        try {
            const team = await getTeamDetails(teamId);
            const flags = team.data.active_flags || [];
            setTeamFlags(prev => ({
                ...prev,
                [teamId]: flags
            }));
            return flags;
        } catch (error) {
            console.error('Error loading team flags:', error);
            return [];
        } finally {
            setLoadingTeamIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(teamId);
                return newSet;
            });
            setIsLoading(false);
        }
    };

    // Check if a specific flag is active for user or team
    const isFlagActive = (flagName, teamId = null) => {
        // Check user flags first
        if (userFlags.includes(flagName)) {
            return true;
        }

        // Check team flags if teamId is provided and flags are already loaded
        if (teamId && teamFlags[teamId] && teamFlags[teamId].includes(flagName)) {
            return true;
        }

        // If team flags aren't loaded yet, trigger loading but return false for now
        if (teamId && !teamFlags[teamId] && !loadingTeamIds.has(teamId)) {
            // Trigger loading in the background
            loadTeamFlags(teamId).catch(error => {
                console.error('Error loading team flags for flag check:', error);
            });
        }

        return false;
    };

    // Async version for when you need to wait for team flags to load
    const isFlagActiveAsync = async (flagName, teamId = null) => {
        // Check user flags first
        if (userFlags.includes(flagName)) {
            return true;
        }

        // Check team flags if teamId is provided
        if (teamId) {
            const flags = await loadTeamFlags(teamId);
            return flags.includes(flagName);
        }

        return false;
    };

    // Convenience methods for specific flags
    const isNoticesFlagActive = (teamId) => isFlagActive(NOTICES_FEATURE_FLAG_NAME, teamId);
    const isVersioningFlagActive = (teamId) => isFlagActive(VERSIONING_FEATURE_FLAG_NAME, teamId);
    const isVersionComparisonFlagActive = (teamId) => isFlagActive(VERSION_COMPARISON_FEATURE_FLAG_NAME, teamId);
    const isVersionComparisonSearchFlagActive = (teamId) => isFlagActive(VERSION_COMPARISON_SEARCH_FEATURE_FLAG_NAME, teamId);
    const isFullSpecProcessingFlagActive = (teamId) => isFlagActive(FULL_SPEC_PROCESSING_FEATURE_FLAG_NAME, teamId);
    const isSpecGptFlagActive = (teamId) => isFlagActive(SPEC_GPT_FEATURE_FLAG_NAME, teamId);
    const isSpecGptWebsocketsFlagActive = (teamId) => isFlagActive(SPEC_GPT_WEBSOCKETS_FEATURE_FLAG_NAME, teamId);
    const isInspectionLogFlagActive = (teamId) => isFlagActive(INSPECTION_LOG_FEATURE_FLAG_NAME, teamId);
    const isInspectionLogUseDataTablesFlagActive = (teamId) => isFlagActive(INSPECTION_LOG_USE_DATA_TABLES_FEATURE_FLAG_NAME, teamId);
    const isQaPlannerFlagActive = (teamId) => isFlagActive(QA_PLANNER_FEATURE_FLAG_NAME, teamId);
    const isSpecCenteredViewFlagActive = (teamId) => isFlagActive(SPEC_CENTERED_VIEW_FEATURE_FLAG_NAME, teamId);

    // Refresh flags (useful when flags might have changed)
    const refreshFlags = async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const userData = await getCurrentUserData();
            setUserFlags(userData.data.active_flags || []);
            // Clear team flags cache to force reload
            setTeamFlags({});
        } catch (error) {
            console.error('Error refreshing flags:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        userFlags,
        teamFlags,
        isLoading,
        loadingTeamIds,
        loadTeamFlags,
        isFlagActive,
        isFlagActiveAsync,
        isNoticesFlagActive,
        isVersioningFlagActive,
        isVersionComparisonFlagActive,
        isVersionComparisonSearchFlagActive,
        isFullSpecProcessingFlagActive,
        isSpecGptFlagActive,
        isSpecGptWebsocketsFlagActive,
        isInspectionLogFlagActive,
        isInspectionLogUseDataTablesFlagActive,
        isQaPlannerFlagActive,
        isSpecCenteredViewFlagActive,
        refreshFlags
    };

    return (
        <FeatureFlagsContext.Provider value={value}>
            {children}
        </FeatureFlagsContext.Provider>
    );
}; 