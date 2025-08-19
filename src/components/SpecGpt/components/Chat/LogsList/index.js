import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Text,
    List,
    ListItem,
    Spinner,
    Center,
    Button,
    Icon,
    Badge,
    VStack,
    HStack
} from '@chakra-ui/react';
import { ChevronLeftIcon, CalendarIcon, CheckCircleIcon, WarningIcon, AddIcon } from '@chakra-ui/icons';
import { fetchAiGeneratedLogs, fetchAiGeneratedLogDetail } from '../../../utils/apiUtils';
import Message from '../ChatMain/Message';
import { MESSAGE_ROLE_TYPE } from '../../../utils/enums';

const LogsList = ({ 
    projectId, 
    projectVersionId, 
    logType, 
    onBack, 
    onLogSelect,
    onGenerateNewLog
}) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLogMessage, setSelectedLogMessage] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const [selectedLogId, setSelectedLogId] = useState(null);

    useEffect(() => {
        loadLogs();
    }, [projectId, projectVersionId, logType]);

    useEffect(() => {
        let intervalId = null;
        if (isPolling && selectedLogId) {
            intervalId = setInterval(async () => {
                try {
                    const logDetail = await fetchAiGeneratedLogDetail(projectId, selectedLogId);
                    if (!logDetail) return;
                    const messageType = logType === 'inspection_log'
                        ? MESSAGE_ROLE_TYPE.AI_INSPECTION_LOG
                        : logType === 'owner_deliverables_log'
                        ? MESSAGE_ROLE_TYPE.AI_OWNER_DELIVERABLES_LOG
                        : 'ASSISTANT';
                    setSelectedLogMessage({
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
                        // Also refresh list to reflect final status
                        loadLogs();
                    }
                } catch (e) {
                    // stop polling on repeated errors
                    setIsPolling(false);
                }
            }, 2000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isPolling, selectedLogId, projectId, logType]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const logsData = await fetchAiGeneratedLogs(projectId, projectVersionId, logType);
            setLogs(logsData);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogClick = async (log) => {
        try {
            const logDetail = await fetchAiGeneratedLogDetail(projectId, log.id);
            let messageType;
            if (logType === 'inspection_log') {
                messageType = MESSAGE_ROLE_TYPE.AI_INSPECTION_LOG;
            } else if (logType === 'owner_deliverables_log') {
                messageType = MESSAGE_ROLE_TYPE.AI_OWNER_DELIVERABLES_LOG;
            } else {
                messageType = 'ASSISTANT';
            }
            const message = {
                type: messageType,
                message: logDetail?.log_table,
                session_id: null,
                questionid: log.id,
                sources: null,
                created_at: logDetail?.created_at,
                log_status: logDetail?.log_status,
            };
            setSelectedLogId(log.id);
            setSelectedLogMessage(message);
            // Start polling if processing
            if (logDetail && logDetail.log_status === 'PROCESSING') {
                setIsPolling(true);
            } else {
                setIsPolling(false);
            }
        } catch (error) {
            console.error('Error loading log detail:', error);
            setIsPolling(false);
        }
    };

    const handleGenerateNewLog = () => {
        if (onGenerateNewLog) {
            onGenerateNewLog(logType);
            loadLogs();
        }
    };

    const getLogTypeDisplayName = (type) => {
        switch (type) {
            case 'inspection_log':
                return 'Inspections List';
            case 'owner_deliverables_log':
                return 'Owner Deliverables List';
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
                <Text color="#676F74">Loading logs...</Text>
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
                            <Flex py="20px" align="center" justifyContent="space-between">
                                <Flex align="center" gap={3}>
                                    <Button
                                        variant="ghost"
                                        color="white"
                                        onClick={onBack}
                                        leftIcon={<ChevronLeftIcon />}
                                        _hover={{ bg: "rgba(255,255,255,0.1)" }}
                                    >
                                        Back
                                    </Button>
                                    <Text fontSize={{ base: "18px", lg: "24px" }} fontWeight="semibold" color="#FFFFFF">
                                        {getLogTypeDisplayName(logType)}
                                    </Text>
                                </Flex>
                            </Flex>
                            
                            {/* Generate New Log Button */}
                            <Box pb={4}>
                                <Button
                                    onClick={handleGenerateNewLog}
                                    leftIcon={<AddIcon />}
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
                                >
                                    Generate New {getLogTypeDisplayName(logType)}
                                </Button>
                            </Box>
                        </Box>

                        <Box 
                            flex={1} 
                            overflowY="auto" 
                            px={{ base: "24px", lg: "30px" }}
                            minH={0}
                            className="sidebar-scroller"
                        >
                            {logs.length === 0 ? (
                                <Center h="100%" flexDirection="column" gap={4}>
                                    <Text color="#676F74" textAlign="center">
                                        No {getLogTypeDisplayName(logType).toLowerCase()} logs found for this project version.
                                    </Text>
                                    <Text color="#676F74" textAlign="center" fontSize="sm">
                                        Click "Generate New {getLogTypeDisplayName(logType)}" above to create one.
                                    </Text>
                                </Center>
                            ) : (
                                <VStack spacing={4} pb={40}>
                                    {logs.map((log) => {
                                        const StatusIcon = getStatusIcon(log.log_status);
                                        const isProcessing = log.log_status === 'PROCESSING';
                                        return (
                                            <Box
                                                key={log.id}
                                                w="100%"
                                                bg="#24314D"
                                                p={4}
                                                borderRadius="8px"
                                                cursor="pointer"
                                                onClick={() => handleLogClick(log)}
                                                _hover={{ bg: "#2A3651" }}
                                                transition="background-color 0.2s"
                                                border={selectedLogMessage?.questionid === log.id ? "2px solid" : "none"}
                                                borderColor="blue.400"
                                            >
                                                <VStack align="start" spacing={2}>
                                                    <HStack justify="space-between" w="100%">
                                                        <HStack spacing={2}>
                                                            {isProcessing ? (
                                                                <Spinner size="xs" color={`${getStatusColor(log.log_status)}.400`} />
                                                            ) : (
                                                                StatusIcon && <Icon as={StatusIcon} color={`${getStatusColor(log.log_status)}.400`} />
                                                            )}
                                                            <Badge colorScheme={getStatusColor(log.log_status)} variant="subtle">
                                                                {log.log_status}
                                                            </Badge>
                                                        </HStack>
                                                        <HStack spacing={1} color="#676F74">
                                                            <CalendarIcon size="sm" />
                                                            <Text fontSize="xs">
                                                                {formatDate(log.created_at)}
                                                            </Text>
                                                        </HStack>
                                                    </HStack>
                                                    <Text color="#EDEDED" fontSize="sm" fontWeight="medium">
                                                        {log.project_name} - v{log.project_version_number}
                                                    </Text>
                                                    <Text color="#676F74" fontSize="xs">
                                                        Click to view log details
                                                    </Text>
                                                </VStack>
                                            </Box>
                                        );
                                    })}
                                </VStack>
                            )}
                        </Box>
                    </Box>
                </Box>
                <Box w={"280px"}></Box>
            </Box>

            {/* Main Content Area */}
            <Box w="100%" h="100%" bg="white">
                {selectedLogMessage ? (
                    <Box p={6} h="100%" overflowY="auto">
                        <Message 
                            messageType={selectedLogMessage.type}
                            message={selectedLogMessage.message}
                            projectId={projectId}
                            isLoading={selectedLogMessage.log_status === 'PROCESSING'}
                        />
                    </Box>
                ) : (
                    <Center h={"100%"} w={"100%"} flexDirection={"column"} gap={5}>
                        <Text color="#676F74">Select a log from the sidebar to view details</Text>
                    </Center>
                )}
            </Box>
        </Flex>
    );
};

export default LogsList;
