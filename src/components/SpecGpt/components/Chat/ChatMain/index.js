import { Box, Grid, GridItem, Heading, Input, InputRightElement, Text, InputGroup, Center, Textarea } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import { BrushIcon, QuestionIcon, SendIcon, SendMessageIcon } from '../../../assets/icons'
import Message from './Message'
import { MESSAGE_ROLE_TYPE } from '../../../utils/enums';
import { fetchPromptAnswer } from '../../../utils/apiUtils';


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
    isChatEnabled
}) => {
    const textareaRef = useRef(null);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 240) + 'px';
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
            position="absolute"
            bottom={{ base: "20px", lg: "40px" }} 
            left={0} 
            right={0} 
            px={4} 
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
                    overflowY="auto"
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
    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitMessage();
        }
    }

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    return (
        <Box w="100%" maxW={"800px"} h={"100%"} position={"relative"} pt={{ base: "20px", lg: "40px" }} marginX={"auto"}>
            {messages?.length === 0 && 
                <Center h={"100%"} w={"100%"} flexDirection={"column"} gap={5}>
                    <Heading mb={5} as="h2" size="xl" marginX="auto" fontWeight="semibold" color="#1F2A43">
                        SpecGPT
                    </Heading>
                    <MessageInput 
                        userInput={userInput}
                        setUserInput={setUserInput}
                        isLoadingMessage={isLoadingMessage}
                        submitMessage={submitMessage}
                        onKeyDown={onKeyDown}
                        isChatEnabled={true}
                    />
                </Center>
            }
            {messages?.length > 0 && <>
                <Box display={messages?.length > 0 ? "block" : "none"} h={"calc(100% - 100px)"} w={"100%"} overflowY={"auto"}>
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
                <MessageInput 
                    userInput={userInput}
                    setUserInput={setUserInput}
                    isLoadingMessage={isLoadingMessage}
                    submitMessage={submitMessage}
                    onKeyDown={onKeyDown}
                    isChatEnabled={isChatEnabled}
                />
                </>
            }
        </Box>
    )
}

export default ChatMain