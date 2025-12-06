import {
    Box, Flex, Center, Spinner, Text
} from '@chakra-ui/react'
import InspectionQASidebar from './InspectionQASidebar'
import LogViewer from '../Chat/LogViewer'
import QAPlannerModal from '../Chat/QAPlannerModal'
import Loader from '../../../shared/Loader/Loader'

/**
 * InspectionQA component - displays QA features in tabbed mode.
 *
 * This component now consumes shared state from the useInspectionQA hook
 * passed in via the inspectionQA prop from ProjectLogs.
 */
const InspectionQA = ({
    projectId,
    projectVersionId,
    isInspectionLogFeatureFlagActive,
    isQaPlannerFlagActive,
    inspectionQA,
}) => {
    // Destructure shared state from the hook
    const {
        isLoading,
        showLogViewer,
        currentLogData,
        currentLogType,
        isLoadingLog,
        selectedFeature,
        showQAPlannerModal,
        isGeneratingQALogs,
        setShowQAPlannerModal,
        onShowOwnerDeliverablesLogsClick,
        onShowQAPlannerClick,
        onQAPlannerSubmit,
        onQAPlannerRegenerate,
        onBackFromLogViewer,
    } = inspectionQA || {};

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
                    onClose={() => setShowQAPlannerModal?.(false)}
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
                onClose={() => setShowQAPlannerModal?.(false)}
                onSubmit={onQAPlannerSubmit}
                isLoading={isGeneratingQALogs}
            />

            <Loader showComponentLoader={isLoading} />
        </>
    )
}

export default InspectionQA
