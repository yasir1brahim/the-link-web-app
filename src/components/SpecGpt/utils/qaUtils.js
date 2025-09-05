// QA Planner utility functions

// Mapping from code names to user-friendly display names
export const QA_OPTION_LABELS = {
    'inspections': 'Inspections',
    'mock_ups': 'Mock-ups',
    'pre_installation_meetings': 'Pre-installation meetings',
    'warranties': 'Warranties',
    'certificates': 'Certificates',
    'reports': 'Reports'
};

// Convert QA option code name to pretty display name
export const getQAOptionLabel = (optionId) => {
    return QA_OPTION_LABELS[optionId] || optionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Get all QA options with labels for dropdowns/selects
export const getQAOptionsWithLabels = () => {
    return Object.entries(QA_OPTION_LABELS).map(([id, label]) => ({
        id,
        label
    }));
};

// Convert item_type from log data to display format
export const formatItemType = (itemType) => {
    return getQAOptionLabel(itemType);
};

// Group log data by item_type with pretty labels
export const groupLogDataByItemType = (logData) => {
    if (!logData || !Array.isArray(logData)) {
        return {};
    }

    const grouped = logData.reduce((acc, item) => {
        const itemType = item.item_type || 'unknown';
        const prettyLabel = getQAOptionLabel(itemType);
        
        if (!acc[prettyLabel]) {
            acc[prettyLabel] = [];
        }
        acc[prettyLabel].push(item);
        return acc;
    }, {});

    return grouped;
};

// Get completion status with pretty labels
export const getCompletionStatusWithLabels = (completionStatus) => {
    if (!completionStatus) {
        return {};
    }

    const result = {};
    Object.entries(completionStatus).forEach(([optionId, status]) => {
        const prettyLabel = getQAOptionLabel(optionId);
        result[prettyLabel] = status;
    });

    return result;
};

// Get status icon/color for display
export const getStatusDisplay = (status) => {
    switch (status) {
        case 'SUCCESS':
            return { icon: '✅', color: 'green', text: 'Completed' };
        case 'FAILURE':
            return { icon: '❌', color: 'red', text: 'Failed' };
        case 'PENDING':
            return { icon: '⏳', color: 'orange', text: 'Pending' };
        case 'PROCESSING':
            return { icon: '🔄', color: 'blue', text: 'Processing' };
        case 'PARTIAL_SUCCESS':
            return { icon: '⚠️', color: 'yellow', text: 'Partial Success' };
        default:
            return { icon: '❓', color: 'gray', text: status };
    }
};
