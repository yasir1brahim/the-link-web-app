import { Box, Grid, GridItem, Heading, Input, InputRightElement, Text, InputGroup, Center } from '@chakra-ui/react'
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
    return <Box zIndex={1000} bottom={{ base: "20px", lg: "40px" }} maxH={"100px"} left={0} right={0} px={4} w={"100%"}>
        <InputGroup>
            <Input width={"100%"} value={userInput} placeholder='Message' border="1px" borderColor="#EDEDED" focusBorderColor='#1F2A43' py={4} onKeyDown={onKeyDown}
                onChange={(e) => setUserInput(e.target.value)} disabled={!isChatEnabled || isLoadingMessage} />
            <InputRightElement cursor={"pointer"} onClick={(e) => userInput && !isLoadingMessage ? submitMessage() : null}>
                <SendMessageIcon />
            </InputRightElement>
        </InputGroup>
    </Box>
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
        if (e.key === "Enter") {
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