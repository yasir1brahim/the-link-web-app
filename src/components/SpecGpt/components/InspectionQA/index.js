import {
    Box, Flex, Center, Spinner, Text
} from '@chakra-ui/react'
import InspectionQASidebar from './InspectionQASidebar'
import LogViewer from '../Chat/LogViewer'
import QAPlannerModal from '../Chat/QAPlannerModal'
import { useState, useEffect } from 'react'
import Loader from '../../../shared/Loader/Loader'
import { fetchMostRecentLog, generateAiLog, generateQAPlannerLog } from '../../utils/apiUtils'

const InspectionQA = ({
    projectId,
    projectVersionId,
    isInspectionLogFeatureFlagActive,
    isQaPlannerFlagActive,
}) => {
    const [isLoading, setLoading] = useState(false)

    // State for log viewer functionality
    const [showLogViewer, setShowLogViewer] = useState(false)
    const [currentLogData, setCurrentLogData] = useState(null)
    const [currentLogType, setCurrentLogType] = useState(null)
    const [isLoadingLog, setIsLoadingLog] = useState(false)
    const [selectedFeature, setSelectedFeature] = useState(null)

    // State for QA Planner functionality
    const [showQAPlannerModal, setShowQAPlannerModal] = useState(false)
    const [isGeneratingQALogs, setIsGeneratingQALogs] = useState(false)

    // Poll for log updates when log is processing
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
            }, 3000); // Poll every 3 seconds
        }

        return () => {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [showLogViewer, currentLogData, projectId, projectVersionId, currentLogType]);

    // Handler for owner deliverables
    const onShowOwnerDeliverablesLogsClick = async () => {
        setIsLoadingLog(true)
        setCurrentLogType('owner_deliverables_log')
        setSelectedFeature('owner-deliverables')

        try {
            // Try to get the most recent log
            const mostRecentLog = await fetchMostRecentLog(projectId, projectVersionId, 'owner_deliverables')

            if (mostRecentLog) {
                // Check if the log is still processing
                if (mostRecentLog.log_status === 'PROCESSING') {
                    // Show the processing log directly
                    setCurrentLogData(mostRecentLog)
                    setShowLogViewer(true)
                } else if (['SUCCESS', 'FAILURE'].includes(mostRecentLog.log_status)) {
                    // Log is complete, show it
                    setCurrentLogData(mostRecentLog)
                    setShowLogViewer(true)
                } else {
                    // Unknown status, show the log anyway
                    setCurrentLogData(mostRecentLog)
                    setShowLogViewer(true)
                }
            } else {
                // No log exists, start generation
                const result = await generateAiLog(projectId, projectVersionId, 'owner_deliverables_log')
                if (result && result.id) {
                    // Create a placeholder log data for the new generation
                    const newLogData = {
                        id: result.id,
                        log_table: '',
                        created_at: new Date().toISOString(),
                        log_status: 'PROCESSING'
                    }
                    setCurrentLogData(newLogData)
                    setShowLogViewer(true)
                }
            }
        } catch (error) {
            console.error('Error handling owner deliverables log:', error)
        } finally {
            setIsLoadingLog(false)
        }
    }

    // Handler for QA Planner
    const onShowQAPlannerClick = async () => {
        setIsLoadingLog(true)
        setCurrentLogType('qa_planner')
        setSelectedFeature('qa-planner')

        try {
            // Try to get the most recent QA planner log
            const mostRecentLog = await fetchMostRecentLog(projectId, projectVersionId, 'qa_planner')
            console.log('Most recent QA planner log:', mostRecentLog)

            if (mostRecentLog) {
                console.log('QA Planner log status:', mostRecentLog.log_status)
                // Check if the log is still processing
                if (mostRecentLog.log_status === 'PROCESSING') {
                    console.log('Showing processing QA planner log without starting new generation')
                    // Show the processing log directly
                    setCurrentLogData(mostRecentLog)
                    setShowLogViewer(true)
                } else if (['SUCCESS', 'FAILURE'].includes(mostRecentLog.log_status)) {
                    console.log('Showing completed QA planner log without starting new generation')
                    // Log is complete, show it
                    setCurrentLogData(mostRecentLog)
                    setShowLogViewer(true)
                } else {
                    console.log('Showing QA planner log with unknown status')
                    // Unknown status, show the log anyway
                    setCurrentLogData(mostRecentLog)
                    setShowLogViewer(true)
                }
            } else {
                console.log('No QA planner log exists, showing modal for selection')
                // No log exists, show the modal for option selection
                setShowQAPlannerModal(true)
            }
        } catch (error) {
            console.error('Error handling QA planner log:', error)
            // On error, fall back to showing the modal
            setShowQAPlannerModal(true)
        } finally {
            setIsLoadingLog(false)
        }
    }

    // Handler for QA Planner submission
    const onQAPlannerSubmit = async (selectedOptions) => {
        setLoading(true)
        setIsGeneratingQALogs(true)
        setShowQAPlannerModal(false)

        try {
            // Call the new QA Planner endpoint
            const result = await generateQAPlannerLog(projectId, projectVersionId, selectedOptions)
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
                        acc[option] = 'PENDING'
                        return acc
                    }, {})
                }
                setCurrentLogData(newLogData)
                setCurrentLogType('qa_planner')
                setShowLogViewer(true)
            }
        } catch (error) {
            console.error('Error handling QA Planner submission:', error)
        } finally {
            setIsGeneratingQALogs(false)
            setLoading(false)
        }
    }

    // Handler for QA Planner regeneration
    const onQAPlannerRegenerate = () => {
        // Close the log viewer and open the modal for new option selection
        setShowLogViewer(false)
        setShowQAPlannerModal(true)
    }

    // Handler for back from log viewer
    const onBackFromLogViewer = () => {
        setShowLogViewer(false)
        setCurrentLogData(null)
        setCurrentLogType(null)
        setSelectedFeature(null)
    }

    // Render log viewer when a log is being viewed
    if (showLogViewer && currentLogData) {
        return (
            <>
                <Box w="100%" h="100%">
                    <LogViewer
                        projectId={projectId}
                        projectVersionId={projectVersionId}
                        initialLogData={currentLogData}
                        logType={currentLogType}
                        onBack={onBackFromLogViewer}
                        onQAPlannerRegenerate={currentLogType === 'qa_planner' ? onQAPlannerRegenerate : null}
                    />
                </Box>

                {/* QA Planner Modal */}
                <QAPlannerModal
                    isOpen={showQAPlannerModal}
                    onClose={() => setShowQAPlannerModal(false)}
                    onSubmit={onQAPlannerSubmit}
                    isLoading={isGeneratingQALogs}
                />

                <Loader showComponentLoader={isLoading} />
            </>
        )
    }

    // Render centered buttons when no log is being viewed
    return (
        <>
            <Flex
                className="inspection-qa-flex"
                w="100%"
                mx="auto"
                h="100%"
                position="relative"
            >
                <Box w="100%" h="100%">
                    {isLoadingLog ? (
                        <Center h={"100%"} w={"100%"} flexDirection={"column"} gap={5}>
                            <Spinner size="xl" color="#1F2A43" />
                            <Text color="#676F74">
                                Loading log...
                            </Text>
                        </Center>
                    ) : (
                        <InspectionQASidebar
                            onShowOwnerDeliverablesLogsClick={onShowOwnerDeliverablesLogsClick}
                            onShowQAPlannerClick={onShowQAPlannerClick}
                            isInspectionLogFeatureFlagActive={isInspectionLogFeatureFlagActive}
                            isQaPlannerFlagActive={isQaPlannerFlagActive}
                            isSidebarExpanded={false}
                            selectedFeature={selectedFeature}
                        />
                    )}
                </Box>
            </Flex>

            {/* QA Planner Modal */}
            <QAPlannerModal
                isOpen={showQAPlannerModal}
                onClose={() => setShowQAPlannerModal(false)}
                onSubmit={onQAPlannerSubmit}
                isLoading={isGeneratingQALogs}
            />

            <Loader showComponentLoader={isLoading} />
        </>
    )
}

export default InspectionQA
