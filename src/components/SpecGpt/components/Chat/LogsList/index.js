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
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Badge,
    VStack,
    HStack
} from '@chakra-ui/react';
import { ChevronLeftIcon, CalendarIcon, CheckCircleIcon, WarningIcon, AddIcon } from '@chakra-ui/icons';
import { fetchAiGeneratedLogs, fetchAiGeneratedLogDetail } from '../../../utils/apiUtils';

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
    const [selectedLog, setSelectedLog] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        loadLogs();
    }, [projectId, projectVersionId, logType]);

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
            setSelectedLog(logDetail);
            onOpen();
        } catch (error) {
            console.error('Error loading log detail:', error);
        }
    };

    const handleGenerateNewLog = () => {
        if (onGenerateNewLog) {
            onGenerateNewLog(logType);
        }
    };

    const getLogTypeDisplayName = (type) => {
        switch (type) {
            case 'inspection_log':
                return 'Inspection Log';
            case 'owner_deliverables_log':
                return 'Owner Deliverables Log';
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

    const renderLogTable = (logTable) => {
        try {
            const tableData = JSON.parse(logTable);
            if (tableData.results && Array.isArray(tableData.results)) {
                return (
                    <Box overflowX="auto">
                        <Box as="table" width="100%" borderCollapse="collapse">
                            <Box as="thead">
                                <Box as="tr" bg="gray.100">
                                    {Object.keys(tableData.results[0] || {}).map((header, index) => (
                                        <Box
                                            as="th"
                                            key={index}
                                            px={4}
                                            py={2}
                                            textAlign="left"
                                            borderBottom="1px solid"
                                            borderColor="gray.200"
                                            fontSize="sm"
                                            fontWeight="bold"
                                        >
                                            {header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                            <Box as="tbody">
                                {tableData.results.map((row, rowIndex) => (
                                    <Box as="tr" key={rowIndex} _hover={{ bg: 'gray.50' }}>
                                        {Object.values(row).map((cell, cellIndex) => (
                                            <Box
                                                as="td"
                                                key={cellIndex}
                                                px={4}
                                                py={2}
                                                borderBottom="1px solid"
                                                borderColor="gray.200"
                                                fontSize="sm"
                                            >
                                                {cell}
                                            </Box>
                                        ))}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                );
            }
        } catch (error) {
            console.error('Error parsing log table:', error);
        }
        
        // Fallback: display as plain text
        return (
            <Box
                p={4}
                bg="gray.50"
                borderRadius="md"
                fontFamily="mono"
                fontSize="sm"
                whiteSpace="pre-wrap"
                overflowX="auto"
            >
                {logTable}
            </Box>
        );
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
                        colorScheme="blue"
                        variant="solid"
                        size="sm"
                        w="100%"
                        _hover={{ bg: "blue.600" }}
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
                                >
                                    <VStack align="start" spacing={2}>
                                        <HStack justify="space-between" w="100%">
                                            <HStack spacing={2}>
                                                {StatusIcon && <Icon as={StatusIcon} color={`${getStatusColor(log.log_status)}.400`} />}
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

            {/* Modal for displaying log details */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {selectedLog && getLogTypeDisplayName(selectedLog.log_type)}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedLog && (
                            <VStack align="start" spacing={4}>
                                <HStack justify="space-between" w="100%">
                                    <Text fontSize="sm" color="gray.600">
                                        Project: {selectedLog.project_name} - v{selectedLog.project_version_number}
                                    </Text>
                                    <Badge colorScheme={getStatusColor(selectedLog.log_status)}>
                                        {selectedLog.log_status}
                                    </Badge>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                    Created: {formatDate(selectedLog.created_at)}
                                </Text>
                                <Box w="100%">
                                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                                        Log Data:
                                    </Text>
                                    {renderLogTable(selectedLog.log_table)}
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default LogsList;
