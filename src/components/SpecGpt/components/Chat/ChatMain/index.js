import { Box, Grid, GridItem, Heading, Input, InputRightElement, Text, InputGroup } from '@chakra-ui/react'
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

const ChatMain = ({ messages, setMessages, chatSessionId, setChatSessionId, projectId, projectVersionId }) => {
    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            submitMessage();
        }
    }

    const [showLoadingMessage, setShowLoadingMessage] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [k, setK] = useState(21);

    const endOfMessagesRef = useRef(null);
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

    const getChatResponse = (userMessage) => {
        console.log('Submit message: ', userMessage);
        setMessages([...messages, {'role': MESSAGE_ROLE_TYPE.USER, 'message': userMessage, 'session_id': chatSessionId, questionid: ''}]);
        setShowLoadingMessage(true);
        setUserInput('');
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
        fetchPromptAnswer(userMessage, k, chatSessionId, projectId, projectVersionId).then((newMessage) => {
            setShowLoadingMessage(false);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setChatSessionId(newMessage.chat_id);
            endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    const onClickQuickQuestion = (text) => {
        setUserInput(text);
        submitMessageInline(text);
    }
    return (
        <Box w="100%" h={"calc(100vh - 87px)"} position={"relative"} pt={{ base: "20px", lg: "40px" }}>
            {messages?.length === 0 && (<Box pt={{ base: "0px", lg: "60px" }} display={messages?.length > 0 ? "none" : "block"} h={"calc(100vh - 175px)"} overflowY={"auto"}>
                <Box px={6} py={5} border="2px" borderRadius="12px" borderColor="#E7E7E7" mb={{ base: "10px", lg: "24px" }}>
                    <Heading mb={5} as="h4" fontSize={{ base: "14px", md: "18px", lg: "24px" }} fontWeight="semibold" color="#1F2A43">SpecGPT</Heading>
                    <Text mb={6} color="#0E2332" fontSize={{ base: "12px", md: "14px", lg: "16px" }}>
                        SpecGPT is a powerful AI tool that has been engineered to answer questions about your project specifications and related documents that you upload. It can help quickly find what you're looking for, summarize sections, and more. The power of SpecGPT is you can ask follow up questions and continue to get better answers.
                    </Text>
                    <Text color="#0E2332" fontSize={{ base: "12px", md: "14px", lg: "16px" }}>
                        However, like any tool, it has limits. If you ask questions that require expertise, like "if anything is missing;" or questions that are too broad, like "summarize the project," it will ask you to be more specific.
                    </Text>
                </Box>
                <Grid gap={{ base: "10px", lg: "20px" }} templateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}>
                    {quickActions?.map((item, idx) => {
                        return (
                            <GridItem w='100%'
                                cursor="pointer" border="2px" borderColor="#E7E7E7" borderRadius="12px" px={6} py={5}
                                onClick={() => onClickQuickQuestion(item?.message)}
                                key={idx}
                            >
                                <Box mb={5} display={{base:"none", lg:"block"}}>
                                    {item?.icon}
                                </Box>
                                <Heading mb={2.5} as="h5" fontSize={{ base: "14px", lg: "18px" }} fontWeight="semibold" color="#1F2A43">
                                    {item?.title}
                                </Heading>
                                <Text fontSize={{ base: "12px", lg: "14px" }} color="#676F74">
                                    {item?.description}
                                </Text>
                            </GridItem>
                        )
                    })}
                </Grid>
            </Box>)}
            <Box display={messages?.length > 0 ? "block" : "none"} h={"calc(100vh - 230px)"} overflowY={"auto"} >
                {messages.map(
                    (message, index) => {
                        return <Message key={index} 
                            messageType={message.role}
                            message={message.message} 
                            questionid={message.questionid} 
                            sources={message.sources}
                        />
                    }
                )}
                {showLoadingMessage && 
                    <Message
                        messageType={MESSAGE_ROLE_TYPE.ASSISTANT}
                        message={""}
                        isLoading={true}
                    />}
                <div ref={endOfMessagesRef}/>
            </Box>
            <Box position="absolute" bottom={{ base: "20px", lg: "40px" }} left={0} right={0}>
                <InputGroup>
                    <Input value={userInput} placeholder='Message' border="1px" borderColor="#EDEDED" focusBorderColor='#1F2A43' py={4} onKeyDown={onKeyDown}
                        onChange={(e) => setUserInput(e.target.value)} />
                    <InputRightElement cursor={"pointer"} onClick={(e) => userInput ? submitMessage() : null}>
                        <SendMessageIcon />
                    </InputRightElement>
                </InputGroup>
            </Box>
        </Box>
    )
}

export default ChatMain