import { Box, Flex, Heading, List, ListItem, Text } from '@chakra-ui/react'
import React from 'react'
import { ChatSvg, CloseIcon, PlusIcon } from '../../../assets/icons'

const ChatSidebar = ({ 
    chatHistory, 
    onClickChatLink, 
    onNewChatClick, 
    onGenerateInspectionLogClick, 
    onGenerateOwnerDeliverablesLogClick, 
    isInspectionLogFeatureFlagActive 
}) => {
    return (
        <Box w="100%" bgColor="#1F2A43" h="100vh" px={{ base: "24px", lg: "30px" }} overflowY={"auto"}>
            <Flex py="25px" align={"center"} justifyContent={"space-between"}>
                <Heading as="h4" fontSize={{ base: "18px", lg: "24px" }} fontWeight="semibold" color="#FFFFFF">
                    Compass
                </Heading>
            </Flex>
            <Box py={5}>
                <Flex onClick={onNewChatClick} mb={6} border="1px" borderColor="#FFFFFF33" px={3} py={4} borderRadius="6px" gap={3} align="center" cursor="pointer">
                    <PlusIcon />
                    <Text marginBottom={0} fontSize="14px" color="#FFFFFF">New chat</Text>
                </Flex>
                {isInspectionLogFeatureFlagActive && (
                    <>
                        <Flex onClick={onGenerateInspectionLogClick} mb={6} border="1px" borderColor="#FFFFFF33" px={3} py={4} borderRadius="6px" gap={3} align="center" cursor="pointer">
                            <Text marginBottom={0} fontSize="14px" color="#FFFFFF">Inspection Log</Text>
                        </Flex>
                        <Flex onClick={onGenerateOwnerDeliverablesLogClick} mb={6} border="1px" borderColor="#FFFFFF33" px={3} py={4} borderRadius="6px" gap={3} align="center" cursor="pointer">
                            <Text marginBottom={0} fontSize="14px" color="#FFFFFF">Owner Deliverables Log</Text>
                        </Flex>
                    </>
                )}
                <Flex flexDir="column" gap={6}>
                    {chatHistory?.map((chat, index) => {
                        return chat.chats.length > 0 && (
                            <Box key={index}>
                                <Text mb={4} color="#676F74" fontSize="13px" fontWeight="semibold" textTransform="uppercase">{chat?.day}</Text>
                                <List spacing={4}>
                                    {chat?.chats?.slice().reverse().map((item, index) => {
                                        return (
                                            <ListItem bgColor="#24314D" p={2.5} borderRadius="8px" cursor="pointer" key={index} 
                                                onClick={() => onClickChatLink(item?.session_id)}
                                            >
                                                <Flex gap={3}>
                                                    <ChatSvg />
                                                    <Text flex={1} marginBottom={0} color="#EDEDED" fontSize="14px">{item?.question}</Text>
                                                </Flex>
                                            </ListItem>
                                        )
                                    })}
                                </List>
                            </Box>
                        )
                    })}
                </Flex>
            </Box>
        </Box>
    )
}

export default ChatSidebar