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
import { fetchAiGeneratedLogDetail, fetchSortedLogData, generateAiLog } from '../../../utils/apiUtils';
import { getQAOptionLabel } from '../../../utils/qaUtils';
import Message from '../ChatMain/Message';
import { MESSAGE_ROLE_TYPE } from '../../../utils/enums';
import { useFeatureFlags } from '../../../../../contexts/FeatureFlagsContext';
import SortableTable from '../../../../shared/SortableTable';

const LogViewer = ({ 
    projectId, 
    projectVersionId, 
    logType, 
    onBack,
    logId,
    initialLogData,
    teamId,
    onQAPlannerRegenerate
}) => {
    const [logMessage, setLogMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPolling, setIsPolling] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [sorting, setSorting] = useState({ column: '', order: 'desc' });
    const [filterValues, setFilterValues] = useState({});
    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 50 });

    // Feature flag checking
    const { isInspectionLogUseDataTablesFlagActive } = useFeatureFlags();
    const shouldUseDataTables = isInspectionLogUseDataTablesFlagActive(teamId) || logType === 'qa_planner';

    // Map frontend column names to backend field names
    const fieldMapping = {
        'Spec Section #': 'spec_section_number',
        'Spec Section Name': 'spec_section_name', 
        'Inspection Type And Requirements': 'inspection_type_and_requirements',
        'Inspection Frequency': 'inspection_frequency',
        'Responsible Party': 'responsible_party',
        'Deliverable Type': 'deliverable_type',
        'When Due': 'when_due',
        'Exact Requirement Text': 'exact_requirement_text',
        'Item Type': 'item_type',
        'Item Text': 'item_text',
        'Paragraph Number': 'paragraph_number',
        'Requirement Text': 'requirement_text',
    };

    // Column definitions for different log types
    const getColumnsForLogType = (logType) => {
        if (logType === 'inspection_log') {
            return [
                { 
                    key: 'Spec Section #', 
                    label: 'Spec Section #', 
                    sortable: true, 
                    width: 15,
                    minWidth: 120
                },
                { 
                    key: 'Spec Section Name', 
                    label: 'Spec Section Name', 
                    sortable: true, 
                    width: 25,
                    minWidth: 150,
                    expandable: true
                },
                { 
                    key: 'Inspection Type And Requirements', 
                    label: 'Inspection Type & Requirements', 
                    sortable: true, 
                    width: 30,
                    minWidth: 200,
                    expandable: true
                },
                { 
                    key: 'Inspection Frequency', 
                    label: 'Inspection Frequency', 
                    sortable: true, 
                    width: 15,
                    minWidth: 120
                },
                { 
                    key: 'Responsible Party', 
                    label: 'Responsible Party', 
                    sortable: true, 
                    width: 15,
                    minWidth: 120
                }
            ];
        } else if (logType === 'owner_deliverables_log') {
            return [
                { 
                    key: 'Spec Section #', 
                    label: 'Spec Section #', 
                    sortable: true, 
                    width: 12,
                    minWidth: 100
                },
                { 
                    key: 'Spec Section Name', 
                    label: 'Spec Section Name', 
                    sortable: true, 
                    width: 20,
                    minWidth: 150,
                    expandable: true
                },
                { 
                    key: 'Deliverable Type', 
                    label: 'Deliverable Type', 
                    sortable: true, 
                    width: 15,
                    minWidth: 120
                },
                { 
                    key: 'When Due', 
                    label: 'When Due', 
                    sortable: true, 
                    width: 12,
                    minWidth: 100
                },
                { 
                    key: 'Responsible Party', 
                    label: 'Responsible Party', 
                    sortable: true, 
                    width: 15,
                    minWidth: 120
                },
                { 
                    key: 'Exact Requirement Text', 
                    label: 'Exact Requirement Text', 
                    sortable: true, 
                    width: 26,
                    minWidth: 200,
                    expandable: true
                }
            ];
        } else if (logType === 'qa_planner') {
            return [
                { 
                    key: 'Spec Section #', 
                    label: 'Spec Section #', 
                    sortable: true, 
                    width: 10,
                    minWidth: 90
                },
                { 
                    key: 'Spec Section Name', 
                    label: 'Spec Section Name', 
                    sortable: true, 
                    width: 18,
                    minWidth: 140,
                    expandable: true
                },
                { 
                    key: 'Paragraph Number', 
                    label: 'Para #', 
                    sortable: true, 
                    width: 8,
                    minWidth: 70
                },
                { 
                    key: 'Item Type', 
                    label: 'QA Type', 
                    sortable: true, 
                    width: 12,
                    minWidth: 110
                },
                { 
                    key: 'Requirement Text', 
                    label: 'Requirements', 
                    sortable: true, 
                    width: 30,
                    minWidth: 200,
                    expandable: true
                },
                { 
                    key: 'Responsible Party', 
                    label: 'Responsible Party', 
                    sortable: true, 
                    width: 12,
                    minWidth: 110
                },
                { 
                    key: 'When Due', 
                    label: 'When Due', 
                    sortable: true, 
                    width: 10,
                    minWidth: 90
                }
            ];
        }
        return [];
    };

    // Handle sorting
    const handleSort = async (columnName, order) => {
        if (!logMessage?.questionid) {
            return;
        }
        
        const backendFieldName = fieldMapping[columnName];
        if (!backendFieldName) {
            console.error('🔍 LogViewer: No mapping found for column name:', columnName);
            return;
        }
        
        setSorting({ column: columnName, order });
        // Reset pagination when sorting changes
        setPagination({ currentPage: 1, pageSize: 50 });
        
        try {
            const sortedData = await handleSortedLogData(projectId, logMessage.questionid, backendFieldName, order);
            if (sortedData) {
                setLogMessage(prev => ({ 
                    ...prev, 
                    data: sortedData.data,
                    pagination: sortedData.pagination || null
                }));
            }
        } catch (error) {
            console.error('Error fetching sorted data:', error);
        }
    };

    // Handle filtering
    const handleFilter = (columnName) => {
        // For now, just log the filter request
        // This can be expanded to show a filter modal or handle filtering
        console.log('Filter requested for column:', columnName);
    };

    // Handle pagination
    const handlePageChange = async (newPage) => {
        if (!logMessage?.questionid) {
            return;
        }
        

        
        try {
            // Use default sort field if no sorting is applied
            const orderBy = sorting.column ? fieldMapping[sorting.column] : 'created_at';
            

            
            const sortedData = await handleSortedLogData(
                projectId, 
                logMessage.questionid, 
                orderBy, 
                sorting.order,
                newPage,
                logMessage.pagination?.page_size || 50
            );
            
            if (sortedData) {
                setLogMessage(prev => ({ 
                    ...prev, 
                    data: sortedData.data,
                    pagination: sortedData.pagination || null
                }));
            }
        } catch (error) {
            console.error('Error fetching paginated data:', error);
        }
    };

    // Fetch sorted log data using the API utility
    const handleSortedLogData = async (projectId, logId, orderBy, order, page = 1, pageSize = 50) => {
        try {
            const logDetail = await fetchSortedLogData(projectId, logId, orderBy, order, page, pageSize);
            
            if (logDetail && logDetail.log_data) {
                return {
                    data: logDetail.log_data,
                    pagination: logDetail.pagination
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching sorted log data:', error);
            return null;
        }
    };

    useEffect(() => {
        if (initialLogData) {
            
            const messageType = logType === 'inspection_log'
                ? MESSAGE_ROLE_TYPE.AI_INSPECTION_LOG
                : logType === 'owner_deliverables_log'
                ? MESSAGE_ROLE_TYPE.AI_OWNER_DELIVERABLES_LOG
                : logType === 'owner_deliverables'
                ? MESSAGE_ROLE_TYPE.AI_OWNER_DELIVERABLES_LOG
                : 'ASSISTANT';
            

            const logMessageData = {
                type: messageType,
                message: initialLogData.log_table,
                data: initialLogData.log_data, // Add structured data
                data_format: initialLogData.data_format, // Add data format
                pagination: initialLogData.pagination, // Add pagination data
                session_id: null,
                questionid: initialLogData.id,
                sources: null,
                created_at: initialLogData.created_at,
                log_status: initialLogData.log_status,
            };
            

            
            setLogMessage(logMessageData);
            
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
                    

                    
                    const logMessageData = {
                        type: messageType,
                        message: logDetail.log_table,
                        data: logDetail.log_data, // Add structured data
                        data_format: logDetail.data_format, // Add data format
                        pagination: logDetail.pagination, // Add pagination data
                        session_id: null,
                        questionid: logDetail.id,
                        sources: null,
                        created_at: logDetail.created_at,
                        log_status: logDetail.log_status,
                    };
                    

                    
                    setLogMessage(logMessageData);
                    
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
                

                
                const logMessageData = {
                    type: messageType,
                    message: logDetail.log_table,
                    data: logDetail.log_data, // Add structured data
                    data_format: logDetail.data_format, // Add data format
                    pagination: logDetail.pagination, // Add pagination data
                    session_id: null,
                    questionid: logDetail.id,
                    sources: null,
                    created_at: logDetail.created_at,
                    log_status: logDetail.log_status,
                };
                

                
                setLogMessage(logMessageData);
                
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
        
        // Special handling for QA planner logs - open modal for option selection
        if (logType === 'qa_planner' && onQAPlannerRegenerate) {
            console.log('Opening QA planner modal for regeneration');
            onQAPlannerRegenerate();
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
                        {(() => {
                            const shouldShowTable = logMessage.data_format === 'structured' && logMessage.data && logMessage.data.length > 0;
                            
                            if (shouldShowTable) {

                                return (
                                    <SortableTable
                                        data={logMessage.data}
                                        columns={getColumnsForLogType(logType)}
                                        onSort={handleSort}
                                        sorting={sorting}
                                        onFilter={handleFilter}
                                        filterValues={filterValues}
                                        onPageChange={handlePageChange}
                                        pagination={logMessage.pagination}
                                        enableExpansion={false}
                                        customCellRenderer={(columnKey, value, rowData) => {
                                            // Custom renderer for QA planner Item Type column
                                            if (columnKey === 'Item Type' && logType === 'qa_planner') {
                                                return getQAOptionLabel(value);
                                            }
                                            return value;
                                        }}
                                        className="log-viewer-table"
                                    />
                                );
                            } else {
                                return (
                                    <Message 
                                        messageType={logMessage.type}
                                        message={logMessage.message}
                                        projectId={projectId}
                                        isLoading={logMessage.log_status === 'PROCESSING'}
                                    />
                                );
                            }
                        })()}
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
