import { Box, Flex, Heading, List, ListItem, Text } from '@chakra-ui/react'
import React from 'react'
import { ChatSvg, CloseIcon, PlusIcon } from '../../../assets/icons'

const ChatSidebar = ({ 
    chatHistory, 
    onClickChatLink, 
    onNewChatClick, 
    onShowInspectionLogsClick, 
    onShowOwnerDeliverablesLogsClick, 
    isInspectionLogFeatureFlagActive 
}) => {
    return (
        <Box w="100%" bgColor="#1F2A43" h="100vh" display="flex" flexDirection="column">
            <Box px={{ base: "24px", lg: "30px" }} flexShrink={0}>
                <Flex py="20px" align={"center"} justifyContent={"space-between"}>
                    <Heading as="h4" fontSize={{ base: "18px", lg: "24px" }} fontWeight="semibold" color="#FFFFFF">
                        Compass
                    </Heading>
                </Flex>
                
                <Box pb={4}>
                    <Flex onClick={onNewChatClick} mb={3} border="1px" borderColor="#FFFFFF33" px={3} py={3} borderRadius="6px" gap={3} align="center" cursor="pointer" _hover={{ bgColor: "#FFFFFF11" }}>
                        <PlusIcon />
                        <Text marginBottom={0} fontSize="14px" color="#FFFFFF">New chat</Text>
                    </Flex>
                    {isInspectionLogFeatureFlagActive && (
                        <>
                            <Flex onClick={onShowInspectionLogsClick} mb={3} border="1px" borderColor="#FFFFFF33" px={3} py={3} borderRadius="6px" gap={3} align="center" cursor="pointer" _hover={{ bgColor: "#FFFFFF11" }}>
                                <Text marginBottom={0} fontSize="14px" color="#FFFFFF">View Inspection Log</Text>
                            </Flex>
                            <Flex onClick={onShowOwnerDeliverablesLogsClick} mb={3} border="1px" borderColor="#FFFFFF33" px={3} py={3} borderRadius="6px" gap={3} align="center" cursor="pointer" _hover={{ bgColor: "#FFFFFF11" }}>
                                <Text marginBottom={0} fontSize="14px" color="#FFFFFF">View Owner Deliverables Log</Text>
                            </Flex>
                        </>
                    )}
                </Box>
            </Box>

            <Box 
                flex={1} 
                overflowY="auto" 
                px={{ base: "24px", lg: "30px" }}
                minH={0}
                className="sidebar-scroller"
            >
                <Flex flexDir="column" gap={6} pb={40}>
                    {chatHistory?.map((chat, index) => {
                        return chat.chats.length > 0 && (
                            <Box key={index}>
                                <Text mb={4} color="#676F74" fontSize="13px" fontWeight="semibold" textTransform="uppercase">{chat?.day}</Text>
                                <List spacing={3}>
                                    {chat?.chats?.slice().reverse().map((item, index) => {
                                        return (
                                            <ListItem 
                                                bgColor="#24314D" 
                                                p={2.5} 
                                                borderRadius="8px" 
                                                cursor="pointer" 
                                                key={index} 
                                                onClick={() => onClickChatLink(item?.session_id)}
                                                _hover={{ bgColor: "#2A3651" }}
                                                transition="background-color 0.2s"
                                            >
                                                <Flex gap={3}>
                                                    <ChatSvg />
                                                    <Text flex={1} marginBottom={0} color="#EDEDED" fontSize="14px" noOfLines={2}>{item?.question}</Text>
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