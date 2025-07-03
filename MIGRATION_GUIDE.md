# Feature Flags Migration Guide

This guide helps you migrate from the old feature flags API to the new context-based system.

## Quick Migration Checklist

- [ ] Replace `import { is*FlagActive } from '../api/FeatureFlags/api'` with `import { useFeatureFlags } from '../contexts/FeatureFlagsContext'`
- [ ] Replace async flag checks with synchronous context calls
- [ ] Remove `useState` and `useEffect` for flag management
- [ ] Add `loadTeamFlags(teamId)` call if you need team flags
- [ ] Update component to use the `useFeatureFlags` hook

## Common Migration Patterns

### Pattern 1: Simple Flag Check

**Before:**
```jsx
import { isNoticesFlagActive } from '../api/FeatureFlags/api';

const MyComponent = ({ teamId }) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const checkFlag = async () => {
            const active = await isNoticesFlagActive(teamId);
            setIsActive(active);
        };
        checkFlag();
    }, [teamId]);

    return isActive ? <div>Notices enabled</div> : null;
};
```

**After:**
```jsx
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

const MyComponent = ({ teamId }) => {
    const { isNoticesFlagActive } = useFeatureFlags();
    
    return isNoticesFlagActive(teamId) ? <div>Notices enabled</div> : null;
};
```

### Pattern 2: Multiple Flag Checks

**Before:**
```jsx
import { isNoticesFlagActive, isVersioningFlagActive } from '../api/FeatureFlags/api';

const MyComponent = ({ teamId }) => {
    const [noticesActive, setNoticesActive] = useState(false);
    const [versioningActive, setVersioningActive] = useState(false);

    useEffect(() => {
        const checkFlags = async () => {
            const [notices, versioning] = await Promise.all([
                isNoticesFlagActive(teamId),
                isVersioningFlagActive(teamId)
            ]);
            setNoticesActive(notices);
            setVersioningActive(versioning);
        };
        checkFlags();
    }, [teamId]);

    return (
        <div>
            {noticesActive && <div>Notices enabled</div>}
            {versioningActive && <div>Versioning enabled</div>}
        </div>
    );
};
```

**After:**
```jsx
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

const MyComponent = ({ teamId }) => {
    const { isNoticesFlagActive, isVersioningFlagActive } = useFeatureFlags();
    
    return (
        <div>
            {isNoticesFlagActive(teamId) && <div>Notices enabled</div>}
            {isVersioningFlagActive(teamId) && <div>Versioning enabled</div>}
        </div>
    );
};
```

### Pattern 3: Conditional Rendering with Loading States

**Before:**
```jsx
import { isNoticesFlagActive } from '../api/FeatureFlags/api';

const MyComponent = ({ teamId }) => {
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkFlag = async () => {
            setIsLoading(true);
            try {
                const active = await isNoticesFlagActive(teamId);
                setIsActive(active);
            } catch (error) {
                console.error('Error checking flag:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkFlag();
    }, [teamId]);

    if (isLoading) return <div>Loading...</div>;
    return isActive ? <div>Notices enabled</div> : null;
};
```

**After:**
```jsx
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

const MyComponent = ({ teamId }) => {
    const { isNoticesFlagActive, isLoading } = useFeatureFlags();
    
    if (isLoading) return <div>Loading...</div>;
    return isNoticesFlagActive(teamId) ? <div>Notices enabled</div> : null;
};
```

### Pattern 4: Team Flags with Loading

**Before:**
```jsx
import { getActiveFlagsForTeam } from '../api/FeatureFlags/api';

const TeamComponent = ({ teamId }) => {
    const [teamFlags, setTeamFlags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadFlags = async () => {
            setIsLoading(true);
            try {
                const flags = await getActiveFlagsForTeam(teamId);
                setTeamFlags(flags);
            } catch (error) {
                console.error('Error loading team flags:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadFlags();
    }, [teamId]);

    if (isLoading) return <div>Loading team flags...</div>;
    return <div>Team flags: {teamFlags.join(', ')}</div>;
};
```

**After:**
```jsx
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

const TeamComponent = ({ teamId }) => {
    const { teamFlags, isLoading, loadTeamFlags } = useFeatureFlags();

    useEffect(() => {
        if (teamId) {
            loadTeamFlags(teamId);
        }
    }, [teamId, loadTeamFlags]);

    if (isLoading) return <div>Loading team flags...</div>;
    return <div>Team flags: {teamFlags[teamId]?.join(', ') || 'none'}</div>;
};
```

## Available Flag Check Functions

All the old async functions have synchronous equivalents:

| Old Function | New Function |
|--------------|--------------|
| `isNoticesFlagActive(teamId)` | `isNoticesFlagActive(teamId)` |
| `isVersioningFlagActive(teamId)` | `isVersioningFlagActive(teamId)` |
| `isVersionComparisonFlagActive(teamId)` | `isVersionComparisonFlagActive(teamId)` |
| `isVersionComparisonSearchFlagActive(teamId)` | `isVersionComparisonSearchFlagActive(teamId)` |
| `isFullSpecProcessingFlagActive(teamId)` | `isFullSpecProcessingFlagActive(teamId)` |
| `isSpecGptFlagActive(teamId)` | `isSpecGptFlagActive(teamId)` |
| `isInspectionLogFlagActive(teamId)` | `isInspectionLogFlagActive(teamId)` |

## Benefits of Migration

1. **Performance**: No more API calls for each flag check
2. **Simplicity**: Remove async/await and state management
3. **Consistency**: Flags are cached and consistent across components
4. **Reliability**: No network failures for flag checks

## Testing Migration

After migrating, test that:

1. Flags work correctly for both user and team levels
2. Loading states work as expected
3. Flag changes are reflected when refreshing
4. Components render correctly with different flag combinations

## Rollback Plan

If you need to rollback, you can:

1. Keep the old API functions (they're still available)
2. Revert to the old import statements
3. Restore the async/await pattern

The old API functions are marked as legacy but still functional for backward compatibility. 