import React, { useEffect, useState } from 'react';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

const FeatureFlagsExample = ({ teamId }) => {
    const {
        userFlags,
        teamFlags,
        isLoading,
        loadingTeamIds,
        loadTeamFlags,
        isNoticesFlagActive,
        isVersioningFlagActive,
        isVersionComparisonFlagActive,
        isVersionComparisonSearchFlagActive,
        isFullSpecProcessingFlagActive,
        isSpecGptFlagActive,
        isInspectionLogFlagActive,
        isFlagActiveAsync,
        refreshFlags
    } = useFeatureFlags();

    const [asyncResults, setAsyncResults] = useState({});

    // Load team flags when component mounts or teamId changes
    useEffect(() => {
        if (teamId) {
            loadTeamFlags(teamId);
        }
    }, [teamId, loadTeamFlags]);

    // Example of async flag checking
    useEffect(() => {
        if (teamId) {
            const checkAsyncFlags = async () => {
                const results = {
                    notices: await isFlagActiveAsync('notices', teamId),
                    versioning: await isFlagActiveAsync('versioning', teamId),
                };
                setAsyncResults(results);
            };
            checkAsyncFlags();
        }
    }, [teamId, isFlagActiveAsync]);

    if (isLoading) {
        return <div>Loading feature flags...</div>;
    }

    const isTeamLoading = teamId && loadingTeamIds.has(teamId);

    return (
        <div>
            <h3>Feature Flags Status</h3>
            
            <div>
                <h4>User Flags:</h4>
                <ul>
                    {userFlags.map(flag => (
                        <li key={flag}>{flag}</li>
                    ))}
                </ul>
            </div>

            {teamId && (
                <div>
                    <h4>Team Flags (Team {teamId}):</h4>
                    {isTeamLoading ? (
                        <div>Loading team flags...</div>
                    ) : (
                        <ul>
                            {teamFlags[teamId]?.map(flag => (
                                <li key={flag}>{flag}</li>
                            )) || <li>No team flags loaded</li>}
                        </ul>
                    )}
                </div>
            )}

            <div>
                <h4>Flag Status (Synchronous):</h4>
                <ul>
                    <li>Notices: {isNoticesFlagActive(teamId) ? '✅ Active' : '❌ Inactive'}</li>
                    <li>Versioning: {isVersioningFlagActive(teamId) ? '✅ Active' : '❌ Inactive'}</li>
                    <li>Version Comparison: {isVersionComparisonFlagActive(teamId) ? '✅ Active' : '❌ Inactive'}</li>
                    <li>Version Comparison Search: {isVersionComparisonSearchFlagActive(teamId) ? '✅ Active' : '❌ Inactive'}</li>
                    <li>Full Spec Processing: {isFullSpecProcessingFlagActive(teamId) ? '✅ Active' : '❌ Inactive'}</li>
                    <li>Assistant: {isSpecGptFlagActive(teamId) ? '✅ Active' : '❌ Inactive'}</li>
                    <li>Inspection Log: {isInspectionLogFlagActive(teamId) ? '✅ Active' : '❌ Inactive'}</li>
                </ul>
            </div>

            {teamId && (
                <div>
                    <h4>Flag Status (Asynchronous):</h4>
                    <ul>
                        <li>Notices: {asyncResults.notices ? '✅ Active' : '❌ Inactive'}</li>
                        <li>Versioning: {asyncResults.versioning ? '✅ Active' : '❌ Inactive'}</li>
                    </ul>
                </div>
            )}

            <button onClick={refreshFlags}>
                Refresh Flags
            </button>
        </div>
    );
};

export default FeatureFlagsExample; 