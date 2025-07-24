import {
    Box, Flex, useDisclosure, Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    Center,
    Spinner
} from '@chakra-ui/react'
import ChatSidebar from './ChatSidebar'
import ChatMain from './ChatMain'
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { fetchChatHistory, fetchChatSessionHistory, fetchInspectionLog, fetchOwnerDeliverablesLog } from '../../utils/apiUtils';
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

    const handleLogGeneration = (logType, logFetchFunction) => {
        console.log("handleLogGeneration", logType);
        setChatSessionId(null);
        setMessages([
            ...messages,
            {
                'type': logType,
                'message': '',
                'session_id': chatSessionId,
                'questionid': '',
                'loading': true
            }
        ]);
        setIsLoadingMessage(true);
        setIsGeneratingLog(true);
        setUserInput('');

        logFetchFunction(projectId, projectVersionId).then((logMessage) => {
            console.log("logMessage", logMessage);
            onFirstAIResponse(logMessage.session_id, '');
            if (chatSessionIdRef.current === null || chatSessionIdRef.current === logMessage.session_id) {
                setMessages((prevMessages) => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    return [
                        ...prevMessages.slice(0, -1),
                        { 
                            ...lastMessage, 
                            message: logMessage.message, 
                            loading: false, 
                            questionid: logMessage.questionid,
                            sources: logMessage.sources
                        }
                    ];
                });
                setMaxChatMessages(logMessage?.max_chat_messages || DEFAULT_MAX_CHAT_MESSAGES);
                setIsLoadingMessage(false);
                setIsGeneratingLog(false);
            }
        });
    }

    const onGenerateInspectionLogClick = () => {
        handleLogGeneration(MESSAGE_ROLE_TYPE.AI_INSPECTION_LOG, fetchInspectionLog);
    }

    const onGenerateOwnerDeliverablesLogClick = () => {
        handleLogGeneration(MESSAGE_ROLE_TYPE.AI_OWNER_DELIVERABLES_LOG, fetchOwnerDeliverablesLog);
    }

    const onClickChatLink = (chatSessionId) => {
        console.log("onClickChatLink", chatSessionId);
        setChatSessionId(chatSessionId);
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

    return (
        <>
            <Flex w={"100%"}  mx="auto" h="100vh" position="relative" >
                <Box display={{ base: "none", lg: "block" }}>
                    <Box w="280px" position={"absolute"} top={0} bottom={0} left={0} style={{ marginLeft: "-20px" }}>
                        <ChatSidebar
                            chatHistory={chatHistory}
                            onClickChatLink={onClickChatLink}
                            onNewChatClick={onNewChatClick}
                            onGenerateInspectionLogClick={onGenerateInspectionLogClick}
                            onGenerateOwnerDeliverablesLogClick={onGenerateOwnerDeliverablesLogClick}
                            isInspectionLogFeatureFlagActive={isInspectionLogFeatureFlagActive}
                        />
                    </Box>
                    <Box w={"280px"}></Box>
                </Box>
                <Box w="100%" h="100%" >
                    {isGeneratingLog && (
                        <Center h={"100%"} w={"100%"} flexDirection={"column"} gap={5}>
                            <Spinner size="xl" color="#1F2A43" />
                        </Center>
                    )}
                    {!isGeneratingLog && (
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
                            onGenerateInspectionLogClick={onGenerateInspectionLogClick}
                            onGenerateOwnerDeliverablesLogClick={onGenerateOwnerDeliverablesLogClick}
                            isInspectionLogFeatureFlagActive={isInspectionLogFeatureFlagActive}
                        />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default Chat