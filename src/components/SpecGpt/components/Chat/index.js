import {
    Box, Flex, useDisclosure, Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
} from '@chakra-ui/react'
import ChatSidebar from './ChatSidebar'
import ChatMain from './ChatMain'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { fetchChatHistory, fetchChatSessionHistory, loadUserDocs } from '../../utils/apiUtils';

const Chat = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const navigator = useNavigate();
    const [messages, setMessages] = useState([]);
    const [chatSessionId, setChatSessionId] = useState(new URLSearchParams(window.location.search).get('chatId'));
    const [chatHistory, setChatHistory] = useState([]);
    const [userDocs, setUserDocs] = useState([]);
    const [projectId, setProjectId] = useState(new URLSearchParams(window.location.search).get('projectId'));
    const [projectVersionId, setProjectVersionId] = useState(new URLSearchParams(window.location.search).get('projectVersionId'));


    useEffect(() => {
        loadUserDocs().then((docs) => {
            setUserDocs(docs)
        });
    }, []);

    useEffect(() => {
        fetchChatHistory().then((data) => {
            setChatHistory(data);
        });
    }, []);  

    const onNewChatClick = () => {
        navigator('/chat');
    }

    const onClickChatLink = (chatSessionId) => {
        fetchChatSessionHistory(chatSessionId, projectId, projectVersionId).then((messages) => {
            setMessages(messages);
            setChatSessionId(chatSessionId);
        });
    }

    return (
        <>
            <Flex w={"100%"}  mx="auto" h="100vh" position="relative" >
                <Box display={{ base: "none", lg: "block" }}>
                    <Box w="280px" position={"absolute"} top={0} bottom={0} left={0} >
                        <ChatSidebar
                            chatHistory={chatHistory}
                            onClickChatLink={onClickChatLink}
                            onNewChatClick={onNewChatClick}
                            onClose={onClose}
                        />
                    </Box>
                    <Box w={"280px"}></Box>
                </Box>
                <Box w={{ base: "100%", lg: "calc(100vw - 280px)" }} >
                    <Flex flexDir="column" w="100%" h="100vh">
                        <Box flex={1} px={{ base: '16px', xl: '0px' }}>
                            <Box w="100%" maxW="800px" mx="auto" >
                                <ChatMain 
                                    messages={messages} 
                                    setMessages={setMessages} 
                                    chatSessionId={chatSessionId} 
                                    setChatSessionId={setChatSessionId}
                                    projectId={projectId} 
                                    projectVersionId={projectVersionId} 
                                />
                            </Box>
                        </Box>
                    </Flex>
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
                            onClose={onClose}
                        />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default Chat