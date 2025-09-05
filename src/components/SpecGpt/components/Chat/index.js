import {
    Box, Flex, useDisclosure, Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    Center,
    Spinner,
    Text
} from '@chakra-ui/react'
import ChatSidebar from './ChatSidebar'
import ChatMain from './ChatMain'
import LogsList from './LogsList'
import LogViewer from './LogViewer'
import QAPlannerModal from './QAPlannerModal'
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { fetchChatHistory, fetchChatSessionHistory, fetchInspectionLog, fetchOwnerDeliverablesLog, fetchMostRecentLog, generateAiLog, generateQAPlannerLog } from '../../utils/apiUtils';
import { MESSAGE_ROLE_TYPE } from '../../utils/enums';
import { fetchPromptAnswer } from '../../utils/apiUtils';

const Chat = ({
    projectId, 
    projectVersionId, 
    chatSessionId, 
    setChatSessionId,
    messages,
    setMessages,
    chatHistory,
    setChatHistory,
    isInspectionLogFeatureFlagActive,
    isQaPlannerFlagActive,
    isLoadingMessage,
    setIsLoadingMessage,
    userInput,
    setUserInput,
    isGeneratingLog,
    setIsGeneratingLog,
    isChatEnabled,
    setIsChatEnabled,
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const DEFAULT_MAX_CHAT_MESSAGES = 10;
    
    const endOfMessagesRef = useRef(null);
    const k = 21;
    const [maxChatMessages, setMaxChatMessages] = useState(DEFAULT_MAX_CHAT_MESSAGES);
    const chatSessionIdRef = useRef(chatSessionId);

    // New state for logs list functionality
    const [showLogsList, setShowLogsList] = useState(false);
    const [currentLogType, setCurrentLogType] = useState(null);
    
    // New state for log viewer functionality
    const [showLogViewer, setShowLogViewer] = useState(false);
    const [currentLogData, setCurrentLogData] = useState(null);
    const [isLoadingLog, setIsLoadingLog] = useState(false);

    // New state for QA Planner functionality
    const [showQAPlannerModal, setShowQAPlannerModal] = useState(false);
    const [isGeneratingQALogs, setIsGeneratingQALogs] = useState(false);

    useEffect(() => {
        fetchChatHistory(projectId).then((data) => {
            console.log("chat history", data);
            setChatHistory(data);
        });
    }, []);  

    useEffect(() => {
        chatSessionIdRef.current = chatSessionId;
        setIsChatEnabled(true);
        if (chatSessionId) {
            fetchChatSessionHistory(projectId, chatSessionId).then((messages) => {
                setMessages(messages);
            });
        } else {
            setMessages([]);
        }
    }, [chatSessionId]);

    useEffect(() => {
        console.log("maxChatMessages", maxChatMessages);
        console.log("messages", messages);
        if (messages.filter((message) => message.type === MESSAGE_ROLE_TYPE.ASSISTANT).length > maxChatMessages) {
            setIsChatEnabled(false);
        } else {
            setIsChatEnabled(true);
        }
    }, [maxChatMessages, messages]);

    const onNewChatClick = () => {
        setChatSessionId(null);
        setMessages([]);
        setUserInput('');
        setIsLoadingMessage(false);
        setIsGeneratingLog(false);
        setIsChatEnabled(true);
        setShowLogsList(false);
        setCurrentLogType(null);
        setShowLogViewer(false);
        setCurrentLogData(null);
        setIsLoadingLog(false);
        setShowQAPlannerModal(false);
        setIsGeneratingQALogs(false);
    }

    const getChatResponse = (userMessage) => {
        console.log('Submit message: ', userMessage);
        setMessages([
            ...messages, 
            {
                'type': MESSAGE_ROLE_TYPE.USER, 
                'message': userMessage, 
                'session_id': chatSessionId, 
                'questionid': ''
            },
            {
                'type': MESSAGE_ROLE_TYPE.ASSISTANT,
                'message': '',
                'session_id': chatSessionId,
                'questionid': '',
                'loading': true
            }
        ]);
        setIsLoadingMessage(true);
        setUserInput('');
        fetchPromptAnswer(userMessage, k, chatSessionId, projectId, projectVersionId).then((newMessage) => {
            console.log("newMessage", newMessage);
            console.log("chatSessionId", chatSessionIdRef.current); // Use ref for current value
            console.log("newMessage.session_id", newMessage.session_id);
            if (messages.filter((message) => message.type === MESSAGE_ROLE_TYPE.ASSISTANT).length === 0) {
                onFirstAIResponse(newMessage.session_id, userMessage);
            }
            // only update the messages if it's a new chat or the chat session id is the same as the new message's session id
            // this is to prevent the messages from being updated if the user is continuing a different chat
            if (chatSessionIdRef.current === null || chatSessionIdRef.current === newMessage.session_id) {
                setMessages((prevMessages) => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    return [
                        ...prevMessages.slice(0, -1),
                        { 
                            ...lastMessage, 
                            message: newMessage.message, 
                            loading: false, 
                            questionid: newMessage.questionid,
                            sources: newMessage.sources
                        }
                    ];
                });
                setMaxChatMessages(newMessage?.max_chat_messages || DEFAULT_MAX_CHAT_MESSAGES);
            }
            setIsLoadingMessage(false);
        });
    }

    // New handlers for direct log viewing functionality
    const onShowInspectionLogsClick = async () => {
        setIsLoadingLog(true);
        setCurrentLogType('inspection_log');
        
        try {
            // Try to get the most recent log
            const mostRecentLog = await fetchMostRecentLog(projectId, projectVersionId, 'inspection_log');
            console.log('Most recent inspection log:', mostRecentLog);
            
            if (mostRecentLog) {
                console.log('Log status:', mostRecentLog.log_status);
                // Check if the log is still processing
                if (mostRecentLog.log_status === 'PROCESSING') {
                    console.log('Showing processing log without starting new generation');
                    // Show the processing log directly
                    setCurrentLogData(mostRecentLog);
                    setShowLogViewer(true);
                } else if (['SUCCESS', 'FAILURE'].includes(mostRecentLog.log_status)) {
                    console.log('Showing completed log without starting new generation');
                    // Log is complete, show it
                    setCurrentLogData(mostRecentLog);
                    setShowLogViewer(true);
                } else {
                    console.log('Showing log with unknown status');
                    // Unknown status, show the log anyway
                    setCurrentLogData(mostRecentLog);
                    setShowLogViewer(true);
                }
            } else {
                console.log('No log exists, starting generation');
                // No log exists, start generation
                const result = await generateAiLog(projectId, projectVersionId, 'inspection_log');
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
            console.error('Error handling inspection log:', error);
        } finally {
            setIsLoadingLog(false);
        }
    }

    const onShowOwnerDeliverablesLogsClick = async () => {
        setIsLoadingLog(true);
        setCurrentLogType('owner_deliverables_log');
        
        try {
            // Try to get the most recent log
            const mostRecentLog = await fetchMostRecentLog(projectId, projectVersionId, 'owner_deliverables');
            
            if (mostRecentLog) {
                // Check if the log is still processing
                if (mostRecentLog.log_status === 'PROCESSING') {
                    // Show the processing log directly
                    setCurrentLogData(mostRecentLog);
                    setShowLogViewer(true);
                } else if (['SUCCESS', 'FAILURE'].includes(mostRecentLog.log_status)) {
                    // Log is complete, show it
                    setCurrentLogData(mostRecentLog);
                    setShowLogViewer(true);
                } else {
                    // Unknown status, show the log anyway
                    setCurrentLogData(mostRecentLog);
                    setShowLogViewer(true);
                }
            } else {
                // No log exists, start generation
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
    }

    const onBackFromLogViewer = () => {
        setShowLogViewer(false);
        setCurrentLogData(null);
        setCurrentLogType(null);
    }

    const onShowQAPlannerClick = async () => {
        setIsLoadingLog(true);
        setCurrentLogType('qa_planner');
        
        try {
            // Try to get the most recent QA planner log
            const mostRecentLog = await fetchMostRecentLog(projectId, projectVersionId, 'qa_planner');
            console.log('Most recent QA planner log:', mostRecentLog);
            
            if (mostRecentLog) {
                console.log('QA Planner log status:', mostRecentLog.log_status);
                // Check if the log is still processing
                if (mostRecentLog.log_status === 'PROCESSING') {
                    console.log('Showing processing QA planner log without starting new generation');
                    // Show the processing log directly
                    setCurrentLogData(mostRecentLog);
                    setShowLogViewer(true);
                } else if (['SUCCESS', 'FAILURE'].includes(mostRecentLog.log_status)) {
                    console.log('Showing completed QA planner log without starting new generation');
                    // Log is complete, show it
                    setCurrentLogData(mostRecentLog);
                    setShowLogViewer(true);
                } else {
                    console.log('Showing QA planner log with unknown status');
                    // Unknown status, show the log anyway
                    setCurrentLogData(mostRecentLog);
                    setShowLogViewer(true);
                }
            } else {
                console.log('No QA planner log exists, showing modal for selection');
                // No log exists, show the modal for option selection
                setShowQAPlannerModal(true);
            }
        } catch (error) {
            console.error('Error handling QA planner log:', error);
            // On error, fall back to showing the modal
            setShowQAPlannerModal(true);
        } finally {
            setIsLoadingLog(false);
        }
    }

    const onQAPlannerSubmit = async (selectedOptions) => {
        setIsGeneratingQALogs(true);
        setShowQAPlannerModal(false);
        
        try {
            // Call the new QA Planner endpoint
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
        }
    }

    const onQAPlannerRegenerate = () => {
        // Close the log viewer and open the modal for new option selection
        setShowLogViewer(false);
        setShowQAPlannerModal(true);
    }

    // Legacy handlers for logs list functionality (keeping for backward compatibility)
    const onShowLogsList = (logType) => {
        setShowLogsList(true);
        setCurrentLogType(logType);
    }

    const onBackFromLogsList = () => {
        setShowLogsList(false);
        setCurrentLogType(null);
    }

    const onGenerateNewLog = (logType) => {
        // Determine which log generation function to use
        let logFetchFunction;
        
        if (logType === 'inspection_log') {
            logFetchFunction = fetchInspectionLog;
        } else if (logType === 'owner_deliverables_log') {
            logFetchFunction = fetchOwnerDeliverablesLog;
        } else {
            console.error('Unknown log type:', logType);
            return;
        }

        logFetchFunction(projectId, projectVersionId).then((logMessage) => {
            console.log("logMessage", logMessage);
        });
    }

    const onClickChatLink = (chatSessionId) => {
        console.log("onClickChatLink", chatSessionId);
        setChatSessionId(chatSessionId);
        setShowLogsList(false);
        setCurrentLogType(null);
        setShowLogViewer(false);
        setCurrentLogData(null);
        setIsLoadingLog(false);
    }

    const onFirstAIResponse = (chatSessionId, userMessage) => {
        console.log("onFirstAIResponse", chatSessionId, userMessage);
        // only set the chat session id if it's a new chat, we don't want to change the chat session id if the user is continuing a different chat
        if (chatSessionId === null) {
            setChatSessionId(chatSessionId);
        }
        fetchChatHistory(projectId).then((data) => {
            console.log("chat history", data);
            setChatHistory(data);
        });
    }

    // Render log viewer if active
    if (showLogViewer && currentLogType && currentLogData) {
        return (
            <>
                <LogViewer
                    projectId={projectId}
                    projectVersionId={projectVersionId}
                    logType={currentLogType}
                    onBack={onBackFromLogViewer}
                    initialLogData={currentLogData}
                    onQAPlannerRegenerate={onQAPlannerRegenerate}
                />
                <Drawer
                    isOpen={isOpen}
                    placement='left'
                    onClose={onClose}
                    size={{ base: "xs", sm: 'sm' }}
                >
                    <DrawerOverlay />
                    <DrawerContent w="100%">
                        <DrawerBody p={"0px"}>
                            <LogViewer
                                projectId={projectId}
                                projectVersionId={projectVersionId}
                                logType={currentLogType}
                                onBack={onBackFromLogViewer}
                                initialLogData={currentLogData}
                                onQAPlannerRegenerate={onQAPlannerRegenerate}
                            />
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </>
        );
    }

    // Render logs list if active (legacy functionality)
    if (showLogsList && currentLogType) {
        return (
            <>
                <LogsList
                    projectId={projectId}
                    projectVersionId={projectVersionId}
                    logType={currentLogType}
                    onBack={onBackFromLogsList}
                    onGenerateNewLog={onGenerateNewLog}
                />
                <Drawer
                    isOpen={isOpen}
                    placement='left'
                    onClose={onClose}
                    size={{ base: "xs", sm: 'sm' }}
                >
                    <DrawerOverlay />
                    <DrawerContent w="100%">
                        <DrawerBody p={"0px"}>
                            <LogsList
                                projectId={projectId}
                                projectVersionId={projectVersionId}
                                logType={currentLogType}
                                onBack={onBackFromLogsList}
                                onGenerateNewLog={onGenerateNewLog}
                            />
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </>
        );
    }

    return (
        <>
            <Flex
                className="compass-chat-flex"
                w="100%"
                mx="auto"
                h="100%"
                position="relative"
            >
                <Box display={{ base: "none", lg: "block" }}>
                    <Box w="280px" position={"absolute"} top={0} bottom={0} left={0} style={{ marginLeft: "-20px" }}>
                        <ChatSidebar
                            chatHistory={chatHistory}
                            onClickChatLink={onClickChatLink}
                            onNewChatClick={onNewChatClick}
                            onShowInspectionLogsClick={onShowInspectionLogsClick}
                            onShowOwnerDeliverablesLogsClick={onShowOwnerDeliverablesLogsClick}
                            onShowQAPlannerClick={onShowQAPlannerClick}
                            isInspectionLogFeatureFlagActive={isInspectionLogFeatureFlagActive}
                            isQaPlannerFlagActive={isQaPlannerFlagActive}
                        />
                    </Box>
                    <Box w={"280px"}></Box>
                </Box>
                <Box w="100%" h="100%" >
                    {(isGeneratingLog || isLoadingLog) && (
                        <Center h={"100%"} w={"100%"} flexDirection={"column"} gap={5}>
                            <Spinner size="xl" color="#1F2A43" />
                            <Text color="#676F74">
                                {isLoadingLog ? "Loading log..." : "Generating log..."}
                            </Text>
                        </Center>
                    )}
                    {!isGeneratingLog && !isLoadingLog && (
                        <ChatMain 
                            messages={messages} 
                            projectId={projectId} 
                            getChatResponse={getChatResponse}
                            isLoadingMessage={isLoadingMessage}
                            userInput={userInput}
                            setUserInput={setUserInput}
                            endOfMessagesRef={endOfMessagesRef}
                            isChatEnabled={isChatEnabled}
                        />
                    )}
                </Box>
            </Flex>
            <Drawer
                isOpen={isOpen}
                placement='left'
                onClose={onClose}
                size={{ base: "xs", sm: 'sm' }}
            >
                <DrawerOverlay />
                <DrawerContent w="100%">
                    <DrawerBody p={"0px"}>
                        <ChatSidebar
                            chatHistory={chatHistory}
                            onClickChatLink={onClickChatLink}
                            onNewChatClick={onNewChatClick}
                            onShowInspectionLogsClick={onShowInspectionLogsClick}
                            onShowOwnerDeliverablesLogsClick={onShowOwnerDeliverablesLogsClick}
                            onShowQAPlannerClick={onShowQAPlannerClick}
                            isInspectionLogFeatureFlagActive={isInspectionLogFeatureFlagActive}
                            isQaPlannerFlagActive={isQaPlannerFlagActive}
                        />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
            
            {/* QA Planner Modal */}
            <QAPlannerModal
                isOpen={showQAPlannerModal}
                onClose={() => setShowQAPlannerModal(false)}
                onSubmit={onQAPlannerSubmit}
                isLoading={isGeneratingQALogs}
            />
        </>
    )
}

export default Chat