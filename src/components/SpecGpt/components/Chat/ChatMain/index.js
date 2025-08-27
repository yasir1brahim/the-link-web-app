import { Box, Grid, GridItem, Heading, Input, InputRightElement, Text, InputGroup, Center, Textarea, Button } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import { BrushIcon, QuestionIcon, SendIcon, SendMessageIcon } from '../../../assets/icons'
import Message from './Message'
import { MESSAGE_ROLE_TYPE } from '../../../utils/enums';
import { fetchPromptAnswer } from '../../../utils/apiUtils';
import { ArrowDownIcon } from '@chakra-ui/icons';


const quickActions = [
    {
        icon: <QuestionIcon />,
        title: "Ask me about",
        description: "the weather parameters to consider when pouring concrete",
        message: "What are the weather parameters to consider when pouring concrete?"
    },
    {
        icon: <BrushIcon />,
        title: "Ask me about",
        description: "what concrete tests are required?",
        message: "What concrete tests are required?"
    },
    {
        icon: <SendIcon />,
        title: "Ask me about",
        description: "the submittals required for cast in place concrete",
        message: "What submittals are required for cast in place concrete?"
    },
    {
        icon: <SendIcon />,
        title: "Create a list",
        description: "of third party inspectors I'm required to have on this project",
        message: "Create a list of third party inspectors I'm required to have on this project."
    }
]

const MessageInput = ({
    userInput,
    setUserInput,
    isLoadingMessage,
    submitMessage,
    onKeyDown,
    isChatEnabled,
    position = "absolute"
}) => {
    const textareaRef = useRef(null);
    const [needsScroll, setNeedsScroll] = useState(false);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 240);
            textareaRef.current.style.height = newHeight + 'px';
            setNeedsScroll(textareaRef.current.scrollHeight > 240);
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [userInput]);

    const handleChange = (e) => {
        setUserInput(e.target.value);
    };

    return (
        <Box 
            zIndex={1000} 
            position={position}
            bottom={position === "absolute" ? { base: "10px", lg: "20px" } : undefined}
            left={0} 
            right={0} 
            w={"100%"}
        >
            <Box 
                maxW="800px" 
                w="100%" 
                marginX="auto"
                position="relative"
                display="flex"
                alignItems="flex-end"
                bg="white"
                borderRadius="md"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            >
                <Textarea 
                    ref={textareaRef}
                    width={"100%"} 
                    value={userInput} 
                    placeholder='Message' 
                    border="1px" 
                    borderColor="#EDEDED" 
                    focusBorderColor='#1F2A43' 
                    py={4} 
                    pr="50px"
                    onKeyDown={onKeyDown}
                    onChange={handleChange} 
                    disabled={!isChatEnabled || isLoadingMessage}
                    resize="none"
                    minH="40px"
                    maxH="240px"
                    overflowY={needsScroll ? "auto" : "hidden"}
                    borderRadius="md"
                    bg="white"
                    _focus={{
                        bg: "white"
                    }}
                />
                <Box 
                    position="absolute"
                    right="12px"
                    bottom="8px"
                    cursor="pointer" 
                    zIndex={1001}
                    onClick={(e) => userInput && !isLoadingMessage ? submitMessage() : null}
                >
                    <SendMessageIcon />
                </Box>
            </Box>
        </Box>
    )
}

const ChatMain = ({ 
    messages, 
    projectId, 
    getChatResponse,
    isLoadingMessage,
    userInput,
    setUserInput,
    endOfMessagesRef,
    isChatEnabled
}) => {
    const chatContainerRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const isFirstRender = useRef(true);

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitMessage();
        }
    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return; 
        }
        
        if (isAtBottom && endOfMessagesRef.current) {
            requestAnimationFrame(() => {
                if (endOfMessagesRef.current) {
                    endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }, [messages, endOfMessagesRef, isAtBottom]);

    useEffect(() => {
        const chatDiv = chatContainerRef.current;
        if (!chatDiv) return;
        
        const handleScroll = () => {
            const threshold = 20; 
            const { scrollHeight, scrollTop, clientHeight } = chatDiv;
            const atBottom = scrollHeight - scrollTop - clientHeight < threshold;
            
            const needsScrolling = scrollHeight > clientHeight;
            setIsAtBottom(atBottom || !needsScrolling);
        };
        
        chatDiv.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();
        
        const resizeObserver = new ResizeObserver(handleScroll);
        resizeObserver.observe(chatDiv);
        
        return () => {
            chatDiv.removeEventListener('scroll', handleScroll);
            resizeObserver.disconnect();
        };
    }, [messages]);

    const submitMessageInline = (message) => { 
        console.log(message)
        if (!message) return;
        getChatResponse(message);
    }

    const submitMessage = () => {
        getChatResponse(userInput);
    }

    const onClickQuickQuestion = (text) => {
        setUserInput(text);
        submitMessageInline(text);
    }
    const handleGoToBottom = () => {
        if (chatContainerRef.current) {
            requestAnimationFrame(() => {
                const chatDiv = chatContainerRef.current;
                if (chatDiv) {
                    chatDiv.scrollTo({ 
                        top: chatDiv.scrollHeight, 
                        behavior: 'smooth' 
                    });
                    if (endOfMessagesRef.current) {
                        endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        }
    };
    return (
        <Box
            w="100%"
            maxW="800px"
            h="100%"
            position="relative"
            pt={"10px"}
            marginX="auto"
            display="flex"
            flexDirection="column"
            className="chat-main-outer"
        >
            {messages?.length === 0 && 
                <Center h={"100%"} w={"100%"} flexDirection={"column"} gap={5}>
                    <MessageInput 
                        userInput={userInput}
                        setUserInput={setUserInput}
                        isLoadingMessage={isLoadingMessage}
                        submitMessage={submitMessage}
                        onKeyDown={onKeyDown}
                        isChatEnabled={true}
                        position="static"
                    />
                </Center>
            }
            {messages?.length > 0 && <>
                <Box
                    ref={chatContainerRef}
                    flex="1 1 auto"
                    overflowY="auto"
                    minHeight={0}
                    className="chat-messages-area"
                >
                {messages.map(
                    (message, index) => {
                        return <Message key={index} 
                            messageType={message.type}
                            message={message.message} 
                            questionid={message.questionid} 
                            sources={message.sources}
                            projectId={projectId}
                            isLoading={message.loading}
                        />
                    }
                    )}
                    <div ref={endOfMessagesRef}/>
                </Box>
                <Box
                    position="absolute"
                    bottom="100px"
                    left="50%"
                    transform="translateX(-50%)"
                    zIndex={999}
                    opacity={isAtBottom ? 0 : 0.8}
                    visibility={isAtBottom ? "hidden" : "visible"}
                    transition="all 0.3s ease-in-out"
                    pointerEvents={isAtBottom ? "none" : "auto"}
                    css={{ borderRadius: '50% !important', overflow: 'hidden'}}
                >
                    <Button 
                        colorScheme="blue"
                        variant="solid"
                        size="xs"
                        onClick={handleGoToBottom}
                        boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
                        width="32pxpx"
                        height="32px"
                        minW="32px"
                        p={0}
                        bg="#1F2A43"
                        transition="all 0.2s ease-in-out"
                        _hover={{
                            bg: "#2A3654",
                            transform: "scale(1.05)",
                            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)"
                        }}
                        _active={{
                            bg: "#1A2238",
                            transform: "scale(0.95)"
                        }}
                    >
                        <ArrowDownIcon boxSize={3} color="white" />
                    </Button>
                </Box>
                <MessageInput 
                    userInput={userInput}
                    setUserInput={setUserInput}
                    isLoadingMessage={isLoadingMessage}
                    submitMessage={submitMessage}
                    onKeyDown={onKeyDown}
                    isChatEnabled={isChatEnabled}
                    position="absolute"
                />
                </>
            }
        </Box>
    )
}

export default ChatMain