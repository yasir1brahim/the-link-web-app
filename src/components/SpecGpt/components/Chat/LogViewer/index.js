import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Text,
    Spinner,
    Center,
    Button,
    Icon,
    Badge,
    HStack,
    VStack
} from '@chakra-ui/react';
import { ChevronLeftIcon, RepeatIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { fetchAiGeneratedLogDetail, generateAiLog } from '../../../utils/apiUtils';
import Message from '../ChatMain/Message';
import { MESSAGE_ROLE_TYPE } from '../../../utils/enums';

const LogViewer = ({ 
    projectId, 
    projectVersionId, 
    logType, 
    onBack,
    logId,
    initialLogData
}) => {
    const [logMessage, setLogMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPolling, setIsPolling] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    useEffect(() => {
        if (initialLogData) {
            const messageType = logType === 'inspection_log'
                ? MESSAGE_ROLE_TYPE.AI_INSPECTION_LOG
                : logType === 'owner_deliverables_log'
                ? MESSAGE_ROLE_TYPE.AI_OWNER_DELIVERABLES_LOG
                : logType === 'owner_deliverables'
                ? MESSAGE_ROLE_TYPE.AI_OWNER_DELIVERABLES_LOG
                : 'ASSISTANT';
            
            setLogMessage({
                type: messageType,
                message: initialLogData.log_table,
                session_id: null,
                questionid: initialLogData.id,
                sources: null,
                created_at: initialLogData.created_at,
                log_status: initialLogData.log_status,
            });
            
            if (initialLogData.log_status === 'PROCESSING') {
                setIsPolling(true);
            }
            setLoading(false);
        } else if (logId) {
            loadLogDetail();
        }
    }, [logId, initialLogData]);

    useEffect(() => {
        let intervalId = null;
        if (isPolling && logMessage?.questionid) {
            intervalId = setInterval(async () => {
                try {
                    const logDetail = await fetchAiGeneratedLogDetail(projectId, logMessage.questionid);
                    if (!logDetail) return;
                    
                    const messageType = logType === 'inspection_log'
                        ? MESSAGE_ROLE_TYPE.AI_INSPECTION_LOG
                        : logType === 'owner_deliverables_log'
                        ? MESSAGE_ROLE_TYPE.AI_OWNER_DELIVERABLES_LOG
                        : logType === 'owner_deliverables'
                        ? MESSAGE_ROLE_TYPE.AI_OWNER_DELIVERABLES_LOG
                        : 'ASSISTANT';
                    
                    setLogMessage({
                        type: messageType,
                        message: logDetail.log_table,
                        session_id: null,
                        questionid: logDetail.id,
                        sources: null,
                        created_at: logDetail.created_at,
                        log_status: logDetail.log_status,
                    });
                    
                    if (logDetail.log_status !== 'PROCESSING') {
                        setIsPolling(false);
                    }
                } catch (e) {
                    setIsPolling(false);
                }
            }, 2000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isPolling, logMessage?.questionid, projectId, logType]);

    const loadLogDetail = async () => {
        setLoading(true);
        try {
            const logDetail = await fetchAiGeneratedLogDetail(projectId, logId);
            if (logDetail) {
                const messageType = logType === 'inspection_log'
                    ? MESSAGE_ROLE_TYPE.AI_INSPECTION_LOG
                    : logType === 'owner_deliverables_log'
                    ? MESSAGE_ROLE_TYPE.AI_OWNER_DELIVERABLES_LOG
                    : logType === 'owner_deliverables'
                    ? MESSAGE_ROLE_TYPE.AI_OWNER_DELIVERABLES_LOG
                    : 'ASSISTANT';
                
                setLogMessage({
                    type: messageType,
                    message: logDetail.log_table,
                    session_id: null,
                    questionid: logDetail.id,
                    sources: null,
                    created_at: logDetail.created_at,
                    log_status: logDetail.log_status,
                });
                
                if (logDetail.log_status === 'PROCESSING') {
                    setIsPolling(true);
                }
            }
        } catch (error) {
            console.error('Error loading log detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateLog = async () => {
        // Only allow regeneration if the current log is not processing
        if (logMessage && logMessage.log_status === 'PROCESSING') {
            console.log('Cannot regenerate while log is processing');
            return;
        }
        
        setIsRegenerating(true);
        try {
            const result = await generateAiLog(projectId, projectVersionId, logType);
            if (result && result.id) {
                // Start polling for the new log
                setLogMessage(prev => ({
                    ...prev,
                    questionid: result.id,
                    log_status: 'PROCESSING'
                }));
                setIsPolling(true);
            }
        } catch (error) {
            console.error('Error regenerating log:', error);
        } finally {
            setIsRegenerating(false);
        }
    };

    const getLogTypeDisplayName = (type) => {
        switch (type) {
            case 'inspection_log':
                return 'Inspections List';
            case 'owner_deliverables_log':
                return 'Owner Deliverables';
            case 'owner_deliverables':
                return 'Owner Deliverables';
            default:
                return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESS':
                return 'green';
            case 'FAILURE':
                return 'red';
            case 'PROCESSING':
                return 'blue';
            default:
                return 'gray';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'SUCCESS':
                return CheckCircleIcon;
            case 'FAILURE':
                return WarningIcon;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Center h="100%" flexDirection="column" gap={4}>
                <Spinner size="xl" color="#1F2A43" />
                <Text color="#676F74">Loading log...</Text>
            </Center>
        );
    }

    return (
        <Flex
            className="compass-chat-flex"
            w="100%"
            mx="auto"
            h="100%"
            position="relative"
        >
            {/* Sidebar */}
            <Box display={{ base: "none", lg: "block" }}>
                <Box w="280px" position={"absolute"} top={0} bottom={0} left={0} style={{ marginLeft: "-20px" }}>
                    <Box w="100%" bgColor="#1F2A43" h="100vh" display="flex" flexDirection="column">
                        <Box px={{ base: "24px", lg: "30px" }} flexShrink={0}>
                            <VStack spacing={3} py="20px" align="start">
                                <Button
                                    variant="ghost"
                                    color="white"
                                    onClick={onBack}
                                    leftIcon={<ChevronLeftIcon />}
                                    _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                    alignSelf="flex-start"
                                >
                                    Back
                                </Button>
                                <Text fontSize={{ base: "18px", lg: "24px" }} fontWeight="semibold" color="#FFFFFF">
                                    {getLogTypeDisplayName(logType)}
                                </Text>
                            </VStack>
                            
                            {/* Log Status and Regenerate Button */}
                            {logMessage && (
                                <VStack spacing={4} pb={4}>
                                    <Box w="100%" bg="#24314D" p={4} borderRadius="8px">
                                        <VStack align="start" spacing={2}>
                                            <HStack justify="space-between" w="100%">
                                                {logMessage.log_status != 'SUCCESS' && (
                                                    <HStack spacing={2}>
                                                        {logMessage.log_status === 'PROCESSING' ? (
                                                            <Spinner size="xs" color={`${getStatusColor(logMessage.log_status)}.400`} />
                                                        ) : (
                                                            getStatusIcon(logMessage.log_status) && 
                                                            <Icon as={getStatusIcon(logMessage.log_status)} color={`${getStatusColor(logMessage.log_status)}.400`} />
                                                        )}
                                                        <Badge colorScheme={getStatusColor(logMessage.log_status)} variant="subtle">
                                                            {logMessage.log_status}
                                                        </Badge>
                                                    </HStack>
                                                )}

                                                <Text fontSize="s" color="#676F74">
                                                    {logMessage.log_status === 'SUCCESS' ? `Generated on ${formatDate(logMessage.created_at)}` : `Last updated on ${formatDate(logMessage.created_at)}`}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                    
                                    <Button
                                        onClick={handleRegenerateLog}
                                        leftIcon={<RepeatIcon />}
                                        bg="#d5e63e"
                                        color="black"
                                        variant="solid"
                                        size="sm"
                                        w="100%"
                                        h="auto"
                                        py={3}
                                        px={4}
                                        whiteSpace="normal"
                                        textAlign="center"
                                        lineHeight="1.2"
                                        _hover={{ bg: "#c4d535" }}
                                        _active={{ bg: "#b3c42c" }}
                                        isLoading={isRegenerating}
                                        loadingText="Regenerating..."
                                        isDisabled={logMessage?.log_status === 'PROCESSING'}
                                        opacity={logMessage?.log_status === 'PROCESSING' ? 0.6 : 1}
                                    >
                                        Regenerate {getLogTypeDisplayName(logType)}
                                    </Button>
                                </VStack>
                            )}
                        </Box>
                    </Box>
                </Box>
                <Box w={"280px"}></Box>
            </Box>

            {/* Main Content Area */}
            <Box w="100%" h="100%" bg="white">
                {logMessage ? (
                    <Box p={6} h="100%" overflowY="auto">
                        <Message 
                            messageType={logMessage.type}
                            message={logMessage.message}
                            projectId={projectId}
                            isLoading={logMessage.log_status === 'PROCESSING'}
                        />
                    </Box>
                ) : (
                    <Center h={"100%"} w={"100%"} flexDirection={"column"} gap={5}>
                        <Text color="#676F74">No log found</Text>
                    </Center>
                )}
            </Box>
        </Flex>
    );
};

export default LogViewer;
