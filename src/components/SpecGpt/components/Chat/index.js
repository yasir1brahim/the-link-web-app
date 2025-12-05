import {
    Box, Flex, useDisclosure, Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    Center,
    Spinner,
    Text,
    ChakraProvider
} from '@chakra-ui/react'
import ChatSidebar from './ChatSidebar'
import ChatMain from './ChatMain'
import LogViewer from './LogViewer'
import QAPlannerModal from './QAPlannerModal'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Loader from '../../../shared/Loader/Loader'
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { fetchChatHistory, fetchChatSessionHistory } from '../../utils/apiUtils';
import { MESSAGE_ROLE_TYPE } from '../../utils/enums';
import { fetchPromptAnswer, fetchPromptAnswerWebSocket } from '../../utils/apiUtils';
import { useSpecGptWebSocket } from '../../../../hooks/useSpecGptWebSocket';
import { useFeatureFlags } from '../../../../contexts/FeatureFlagsContext';

const Chat = ({
    projectId,
    projectVersionId,
    chatSessionId,
    setChatSessionId,
    messages,
    setMessages,
    chatHistory,
    setChatHistory,
    isLoadingMessage,
    setIsLoadingMessage,
    userInput,
    setUserInput,
    isChatEnabled,
    setIsChatEnabled,
    teamId,
    // New props for sidebar QA mode
    useQaTabbedLayout = true,
    inspectionQA = null,
    isInspectionLogFeatureFlagActive = false,
    isQaPlannerFlagActive = false,
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const DEFAULT_MAX_CHAT_MESSAGES = 10;
    
    // Feature flags and WebSocket
    const { isSpecGptWebsocketsFlagActive } = useFeatureFlags();
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoading, setLoading] = useState(false);
    
    const endOfMessagesRef = useRef(null);
    const k = 21;
    const [maxChatMessages, setMaxChatMessages] = useState(DEFAULT_MAX_CHAT_MESSAGES);
    const chatSessionIdRef = useRef(chatSessionId);

    // Sidebar mode QA helpers
    const isSidebarMode = !useQaTabbedLayout;
    const qaSidebarProps = isSidebarMode
        ? {
            onShowOwnerDeliverablesLogsClick: inspectionQA?.onShowOwnerDeliverablesLogsClick,
            onShowQAPlannerClick: inspectionQA?.onShowQAPlannerClick,
            isInspectionLogFeatureFlagActive,
            isQaPlannerFlagActive,
            selectedFeature: inspectionQA?.selectedFeature,
            isLoadingLog: inspectionQA?.isLoadingLog,
        }
        : {};

    const qaViewerState = {
        showLogViewer: inspectionQA?.showLogViewer,
        currentLogData: inspectionQA?.currentLogData,
        currentLogType: inspectionQA?.currentLogType,
        onBackFromLogViewer: inspectionQA?.onBackFromLogViewer,
        onQAPlannerRegenerate: inspectionQA?.onQAPlannerRegenerate,
        showQAPlannerModal: inspectionQA?.showQAPlannerModal,
        setShowQAPlannerModal: inspectionQA?.setShowQAPlannerModal,
        onQAPlannerSubmit: inspectionQA?.onQAPlannerSubmit,
        isGeneratingQALogs: inspectionQA?.isGeneratingQALogs,
    };

    // WebSocket message handlers
    const handleWebSocketMessage = useCallback((data) => {
        switch (data.type) {
            case 'response_start':
                setIsStreaming(true);
                // Create a new empty message for streaming
                setMessages(prev => [
                    ...prev.filter(msg => !msg.isStreaming), // Remove any existing streaming messages
                    { 
                        type: MESSAGE_ROLE_TYPE.ASSISTANT,
                        message: '', 
                        session_id: chatSessionId,
                        questionid: '',
                        loading: false, // Set to false so it shows immediately
                        isStreaming: true
                    }
                ]);
                break;
            case 'response_chunk':
                setMessages(prev => {
                    // Find the streaming message
                    const newMessages = [...prev];
                    const lastMessageIndex = newMessages.findIndex(msg => msg.isStreaming);
                    
                    if (lastMessageIndex !== -1) {
                        // Create a new message object with updated content to ensure React detects the change
                        newMessages[lastMessageIndex] = {
                            ...newMessages[lastMessageIndex],
                            message: newMessages[lastMessageIndex].message + data.data.content
                        };
                    }
                    return newMessages;
                });
                break;
            case 'response_complete':
                setIsStreaming(false);
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessageIndex = newMessages.findIndex(msg => msg.isStreaming);
                    
                    if (lastMessageIndex !== -1) {
                        // Update the streaming message to mark it as complete
                        newMessages[lastMessageIndex] = {
                            ...newMessages[lastMessageIndex],
                            isStreaming: false,
                            loading: false,
                            chat_id: data.data.chat_id || chatSessionId,
                            sources: data.data.sources || []
                        };
                    }
                    return newMessages;
                });
                setIsLoadingMessage(false);
                break;
            case 'response_error':
                setIsStreaming(false);
                setIsLoadingMessage(false);
                setMessages(prev => [...prev.filter(msg => !msg.isStreaming), { 
                    type: MESSAGE_ROLE_TYPE.ERROR, 
                    message: data.data.error,
                    session_id: chatSessionId,
                    questionid: ''
                }]);
                break;
        }
    }, [chatSessionId]);

    const { connect, sendMessage, isConnected } = useSpecGptWebSocket(
        projectId,
        handleWebSocketMessage,
        (error) => {
            console.error('WebSocket error:', error);
            setIsLoadingMessage(false);
        },
        () => console.log('WebSocket complete')
    );

    // Helper function to handle HTTP responses
    const handleHttpResponse = (newMessage, userMessage) => {
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
    };

    useEffect(() => {
        fetchChatHistory(projectId, projectVersionId).then((data) => {
            console.log("chat history", data);
            setChatHistory(data);
        });
    }, [projectId, projectVersionId]);

    // Connect to WebSocket if feature flag is active
    useEffect(() => {
        if (!projectId || !teamId) return;
        if (!isSpecGptWebsocketsFlagActive(teamId)) return;
        console.log('Connecting to WebSocket for project:', projectId);
        connect();
        // connect only once per projectId+teamId
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, teamId]);  

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
        setIsChatEnabled(true);
    }
    // Helper function to refresh chat history
    const refreshChatHistory = () => {
        fetchChatHistory(projectId, projectVersionId).then((data) => {
            console.log("chat history refreshed", data);
            setChatHistory(data);
        });
    }


    const getChatResponse = (userMessage) => {
        console.log('Submit message: ', userMessage);
        
        // Add user message
        setMessages([
            ...messages, 
            {
                'type': MESSAGE_ROLE_TYPE.USER, 
                'message': userMessage, 
                'session_id': chatSessionId, 
                'questionid': ''
            }
        ]);
        
        setIsLoadingMessage(true);
        setUserInput('');

        // Check if WebSocket is available and feature flag is active
        console.log('WebSocket check:', { 
            isSpecGptWebsocketsFlagActive: isSpecGptWebsocketsFlagActive(teamId), 
            teamId, 
            isConnected 
        });
        
        if (isSpecGptWebsocketsFlagActive(teamId) && isConnected) {
            // Use WebSocket for streaming - no need to add placeholder message
            // as it will be added by the response_start handler
            try {
                sendMessage({
                    type: 'chat_message',
                    user_input: userMessage,
                    k: k,
                    chat_id: chatSessionId,
                    project_version_id: projectVersionId
                });
            } catch (error) {
                console.error('WebSocket send error, falling back to HTTP:', error);
                // Fallback to HTTP if WebSocket fails
                // Add placeholder message for HTTP response
                setMessages(prev => [
                    ...prev,
                    {
                        'type': MESSAGE_ROLE_TYPE.ASSISTANT,
                        'message': '',
                        'session_id': chatSessionId,
                        'questionid': '',
                        'loading': true,
                        'isStreaming': false
                    }
                ]);
                fetchPromptAnswer(userMessage, k, chatSessionId, projectId, projectVersionId).then((newMessage) => {
                    handleHttpResponse(newMessage, userMessage);
                    setMaxChatMessages(newMessage?.max_chat_messages || DEFAULT_MAX_CHAT_MESSAGES);
                });
                
                // Refresh chat history after every message to update the sidebar
                refreshChatHistory();
            }
        } else {
            setMessages(prev => [
                ...prev,
                {
                    'type': MESSAGE_ROLE_TYPE.ASSISTANT,
                    'message': '',
                    'session_id': chatSessionId,
                    'questionid': '',
                    'loading': true,
                    'isStreaming': false
                }
            ]);
            fetchPromptAnswer(userMessage, k, chatSessionId, projectId, projectVersionId).then((newMessage) => {
                handleHttpResponse(newMessage, userMessage);
            });
        }
    }

    const onClickChatLink = (chatSessionId) => {
        console.log("onClickChatLink", chatSessionId);
        setChatSessionId(chatSessionId);
    }

    const onFirstAIResponse = (chatSessionId, userMessage) => {
        console.log("onFirstAIResponse", chatSessionId, userMessage);
        // Set the chat session id when starting a new chat (when current session is null)
        if (chatSessionIdRef.current === null) {
            setChatSessionId(chatSessionId);
        }
        // Always refresh chat history to update the sidebar
        refreshChatHistory();
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
                            {...qaSidebarProps}
                        />
                    </Box>
                    <Box w={"280px"}></Box>
                </Box>
                <Box w="100%" h="100%" position="relative">
                    {/* LogViewer overlay - shown when viewing a log in sidebar mode */}
                    {isSidebarMode && qaViewerState.showLogViewer && qaViewerState.currentLogData && (
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            bg="white"
                            zIndex={10}
                            overflow="auto"
                        >
                            <LogViewer
                                projectId={projectId}
                                projectVersionId={projectVersionId}
                                initialLogData={qaViewerState.currentLogData}
                                logType={qaViewerState.currentLogType}
                                onBack={qaViewerState.onBackFromLogViewer}
                                onQAPlannerRegenerate={
                                    qaViewerState.currentLogType === 'qa_planner' ? qaViewerState.onQAPlannerRegenerate : null
                                }
                            />
                        </Box>
                    )}
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
                            {...qaSidebarProps}
                        />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {/* QA Planner Modal - shown in sidebar mode */}
            {isSidebarMode && (
                <QAPlannerModal
                    isOpen={qaViewerState.showQAPlannerModal || false}
                    onClose={() => qaViewerState.setShowQAPlannerModal?.(false)}
                    onSubmit={qaViewerState.onQAPlannerSubmit}
                    isLoading={qaViewerState.isGeneratingQALogs || false}
                />
            )}

            <Loader showComponentLoader={isLoading} />

        </>
    )
}

export default Chat