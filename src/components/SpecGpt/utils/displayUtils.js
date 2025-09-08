// General display utilities for SpecGPT components
import { getQAOptionLabel } from './qaUtils';

// Get display name for log types
export const getLogTypeDisplayName = (logType) => {
    switch (logType) {
        case 'inspection_log':
            return 'Inspections List';
        case 'owner_deliverables_log':
            return 'Owner Deliverables List';
        case 'qa_planner':
            return 'QA Planner';
        default:
            // Handle qa_planner__[option] format
            if (logType && logType.startsWith('qa_planner__')) {
                const qaOption = logType.split('qa_planner__')[1];
                return `QA: ${getQAOptionLabel(qaOption)}`;
            }
            return logType ? logType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
    }
};

// Get status color for different log statuses
export const getLogStatusColor = (status) => {
    switch (status) {
        case 'SUCCESS':
            return 'green';
        case 'FAILURE':
            return 'red';
        case 'PROCESSING':
            return 'blue';
        case 'PARTIAL_SUCCESS':
            return 'yellow';
        case 'PENDING':
            return 'orange';
        default:
            return 'gray';
    }
};

// Format timestamp for display
export const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
        const date = new Date(timestamp);
        return date.toLocaleString();
    } catch (error) {
        return timestamp;
    }
};

// Get appropriate icon for log type
export const getLogTypeIcon = (logType) => {
    switch (logType) {
        case 'inspection_log':
            return '🔍';
        case 'owner_deliverables_log':
            return '📋';
        case 'qa_planner':
            return '✅';
        default:
            if (logType && logType.startsWith('qa_planner__')) {
                return '✅';
            }
            return '📄';
    }
};
