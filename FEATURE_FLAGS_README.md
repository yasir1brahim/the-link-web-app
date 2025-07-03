# Feature Flags System

This document describes the new feature flags caching system that replaces the previous approach of making individual API calls for each flag check.

## Overview

The new system caches feature flags on login and provides a React context to access them throughout the application. This eliminates the need to make multiple API calls for flag checks and improves performance.

## Architecture

### Components

1. **FeatureFlagsProvider** - React context provider that manages cached flags
2. **useFeatureFlags** - Hook to access feature flags in components
3. **Legacy API functions** - Backward compatibility functions (deprecated)

### Data Flow

1. User logs in → User flags are automatically cached from the login response
2. Team flags are loaded on-demand when `loadTeamFlags(teamId)` is called
3. Flag checks use cached data instead of API calls
4. Flags can be refreshed manually if needed

## Usage

### Basic Usage (Synchronous)

```jsx
import React from 'react';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

const MyComponent = ({ teamId }) => {
    const { isNoticesFlagActive, isVersioningFlagActive } = useFeatureFlags();

    return (
        <div>
            {isNoticesFlagActive(teamId) && (
                <div>Notices feature is enabled</div>
            )}
            
            {isVersioningFlagActive(teamId) && (
                <div>Versioning feature is enabled</div>
            )}
        </div>
    );
};
```

**Note**: The synchronous approach will return `false` for team flags that haven't been loaded yet, but will trigger loading in the background. This is perfect for most UI scenarios where you want immediate rendering.

### Advanced Usage (Asynchronous)

```jsx
import React, { useEffect, useState } from 'react';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

const MyComponent = ({ teamId }) => {
    const { isFlagActiveAsync } = useFeatureFlags();
    const [isNoticesActive, setIsNoticesActive] = useState(false);

    useEffect(() => {
        const checkFlag = async () => {
            const active = await isFlagActiveAsync('notices', teamId);
            setIsNoticesActive(active);
        };
        checkFlag();
    }, [teamId, isFlagActiveAsync]);

    return isNoticesActive ? <div>Notices enabled</div> : null;
};
```

**Note**: The asynchronous approach waits for team flags to load before returning a result. Use this when you need to be certain about the flag status.

### Loading Team Flags

```jsx
import React, { useEffect } from 'react';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

const TeamComponent = ({ teamId }) => {
    const { loadTeamFlags, isLoading, loadingTeamIds } = useFeatureFlags();

    useEffect(() => {
        if (teamId) {
            loadTeamFlags(teamId);
        }
    }, [teamId, loadTeamFlags]);

    const isTeamLoading = teamId && loadingTeamIds.has(teamId);

    if (isLoading || isTeamLoading) {
        return <div>Loading...</div>;
    }

    // Now you can use flag check functions
    return <div>Component content</div>;
};
```

### Available Flag Check Functions

**Synchronous (immediate response):**
- `isNoticesFlagActive(teamId)`
- `isVersioningFlagActive(teamId)`
- `isVersionComparisonFlagActive(teamId)`
- `isVersionComparisonSearchFlagActive(teamId)`
- `isFullSpecProcessingFlagActive(teamId)`
- `isSpecGptFlagActive(teamId)`
- `isInspectionLogFlagActive(teamId)`

**Asynchronous (waits for team flags):**
- `isFlagActiveAsync(flagName, teamId)`

### Manual Flag Refresh

```jsx
const { refreshFlags } = useFeatureFlags();

// Refresh all flags (useful when flags might have changed)
await refreshFlags();
```

### Accessing Raw Flag Data

```jsx
const { userFlags, teamFlags, loadingTeamIds } = useFeatureFlags();

console.log('User flags:', userFlags);
console.log('Team flags:', teamFlags[teamId]);
console.log('Loading teams:', Array.from(loadingTeamIds));
```

## Migration from Old System

### Before (Old API calls)
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

    return isActive ? <div>Feature enabled</div> : null;
};
```

### After (New context)
```jsx
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

const MyComponent = ({ teamId }) => {
    const { isNoticesFlagActive } = useFeatureFlags();
    
    return isNoticesFlagActive(teamId) ? <div>Feature enabled</div> : null;
};
```

## Benefits

1. **Performance** - No more individual API calls for each flag check
2. **Caching** - Flags are cached and reused across components
3. **Automatic loading** - User flags are loaded on login
4. **On-demand team flags** - Team flags are loaded only when needed
5. **Backward compatibility** - Old API functions still work (but are deprecated)

## Setup

The `FeatureFlagsProvider` is already set up in `src/index.js` and wraps the entire application:

```jsx
<AuthProvider>
  <FeatureFlagsProvider>
    <RouterProvider router={router} />
  </FeatureFlagsProvider>
</AuthProvider>
```

## Testing

See `src/components/FeatureFlagsExample.jsx` for a complete example of how to use the feature flags system.

## Backward Compatibility

The old API functions in `src/api/FeatureFlags/api.js` are still available but are marked as legacy. They should be replaced with the new context-based approach for better performance.

## Future Improvements

1. Add automatic refresh when user/team data changes
2. Add flag change notifications
3. Add offline support for cached flags
4. Add flag analytics and usage tracking 