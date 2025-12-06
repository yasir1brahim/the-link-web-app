import { useState, useEffect, useCallback } from 'react';
import {
  fetchMostRecentLog,
  generateAiLog,
  generateQAPlannerLog,
} from '../utils/apiUtils';

/**
 * Shared hook for QA feature state and handlers.
 * Used by both InspectionQA (tabbed mode) and Chat (sidebar mode).
 *
 * This hook extracts the state and logic from InspectionQA/index.js
 * so it can be shared with ChatSidebar in sidebar mode.
 */
export function useInspectionQA(projectId, projectVersionId) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [showLogViewer, setShowLogViewer] = useState(false);
  const [currentLogData, setCurrentLogData] = useState(null);
  const [currentLogType, setCurrentLogType] = useState(null);
  const [isLoadingLog, setIsLoadingLog] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showQAPlannerModal, setShowQAPlannerModal] = useState(false);
  const [isGeneratingQALogs, setIsGeneratingQALogs] = useState(false);

  // Poll for log updates when log_status is PROCESSING
  useEffect(() => {
    let pollInterval;

    if (showLogViewer && currentLogData && currentLogData.log_status === 'PROCESSING') {
      pollInterval = setInterval(async () => {
        try {
          const updatedLog = await fetchMostRecentLog(projectId, projectVersionId, currentLogType);
          if (updatedLog && updatedLog.id === currentLogData.id) {
            setCurrentLogData(updatedLog);
            // Stop polling if log is no longer processing
            if (updatedLog.log_status !== 'PROCESSING') {
              clearInterval(pollInterval);
            }
          }
        } catch (error) {
          console.error('Error polling for log updates:', error);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [showLogViewer, currentLogData, projectId, projectVersionId, currentLogType]);

  // Helper: Check if a log has usable content
  const hasUsableContent = (log) => {
    if (!log) return false;
    // A log is usable if it's currently processing OR has actual content
    if (log.log_status === 'PROCESSING') return true;
    // Check if there's actual content (log_table for legacy, log_data for structured)
    const hasTable = log.log_table && log.log_table.trim().length > 0;
    const hasData = log.log_data && Array.isArray(log.log_data) && log.log_data.length > 0;
    return hasTable || hasData;
  };

  // Handler: Show Owner Deliverables Logs
  const onShowOwnerDeliverablesLogsClick = useCallback(async () => {
    setIsLoadingLog(true);
    setCurrentLogType('owner_deliverables_log');
    setSelectedFeature('owner-deliverables');

    try {
      // Try to get the most recent log
      const mostRecentLog = await fetchMostRecentLog(projectId, projectVersionId, 'owner_deliverables');

      if (mostRecentLog && hasUsableContent(mostRecentLog)) {
        // Show the log if it has usable content (processing or completed with data)
        setCurrentLogData(mostRecentLog);
        setShowLogViewer(true);
      } else {
        // No usable log exists, start generation
        const result = await generateAiLog(projectId, projectVersionId, 'owner_deliverables_log');
        if (result && result.id) {
          // Create a placeholder log data for the new generation
          const newLogData = {
            id: result.id,
            log_table: '',
            created_at: new Date().toISOString(),
            log_status: 'PROCESSING'
          };
          setCurrentLogData(newLogData);
          setShowLogViewer(true);
        }
      }
    } catch (error) {
      console.error('Error handling owner deliverables log:', error);
    } finally {
      setIsLoadingLog(false);
    }
  }, [projectId, projectVersionId]);

  // Handler: Show QA Planner
  const onShowQAPlannerClick = useCallback(async () => {
    setIsLoadingLog(true);
    setCurrentLogType('qa_planner');
    setSelectedFeature('qa-planner');

    try {
      // Try to get the most recent QA planner log
      const mostRecentLog = await fetchMostRecentLog(projectId, projectVersionId, 'qa_planner');

      if (mostRecentLog && hasUsableContent(mostRecentLog)) {
        // Show the log if it has usable content (processing or completed with data)
        setCurrentLogData(mostRecentLog);
        setShowLogViewer(true);
      } else {
        // No usable log exists, show the modal for option selection
        setShowQAPlannerModal(true);
      }
    } catch (error) {
      console.error('Error handling QA planner log:', error);
      // On error, fall back to showing the modal
      setShowQAPlannerModal(true);
    } finally {
      setIsLoadingLog(false);
    }
  }, [projectId, projectVersionId]);

  // Handler: QA Planner Submit (from modal)
  const onQAPlannerSubmit = useCallback(async (selectedOptions) => {
    setIsLoading(true);
    setIsGeneratingQALogs(true);
    setShowQAPlannerModal(false);

    try {
      const result = await generateQAPlannerLog(projectId, projectVersionId, selectedOptions);
      if (result && result.id) {
        // Create log data for the new QA planner generation
        const newLogData = {
          id: result.id,
          log_table: '',
          log_data: [],
          created_at: new Date().toISOString(),
          log_status: 'PROCESSING',
          qa_options_selected: selectedOptions,
          completion_status: selectedOptions.reduce((acc, option) => {
            acc[option] = 'PENDING';
            return acc;
          }, {})
        };
        setCurrentLogData(newLogData);
        setCurrentLogType('qa_planner');
        setShowLogViewer(true);
      }
    } catch (error) {
      console.error('Error handling QA Planner submission:', error);
    } finally {
      setIsGeneratingQALogs(false);
      setIsLoading(false);
    }
  }, [projectId, projectVersionId]);

  // Handler: QA Planner Regenerate
  const onQAPlannerRegenerate = useCallback(() => {
    setShowLogViewer(false);
    setShowQAPlannerModal(true);
  }, []);

  // Handler: Back from LogViewer
  const onBackFromLogViewer = useCallback(() => {
    setShowLogViewer(false);
    setCurrentLogData(null);
    setCurrentLogType(null);
    setSelectedFeature(null);
  }, []);

  return {
    // State
    isLoading,
    showLogViewer,
    currentLogData,
    currentLogType,
    isLoadingLog,
    selectedFeature,
    showQAPlannerModal,
    isGeneratingQALogs,

    // State setters (for direct control)
    setIsLoading,
    setShowLogViewer,
    setShowQAPlannerModal,

    // Handlers
    onShowOwnerDeliverablesLogsClick,
    onShowQAPlannerClick,
    onQAPlannerSubmit,
    onQAPlannerRegenerate,
    onBackFromLogViewer,
  };
}

export default useInspectionQA;
