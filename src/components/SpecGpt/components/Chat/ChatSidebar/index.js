import { Box, Button, Flex, Heading, List, ListItem, Text, Spinner } from '@chakra-ui/react'
import React from 'react'
import { ChatSvg, CloseIcon, PlusIcon } from '../../../assets/icons'

const ChatSidebar = ({
    chatHistory,
    onClickChatLink,
    onNewChatClick,
    // QA props (optional - only passed in sidebar mode)
    onShowOwnerDeliverablesLogsClick,
    onShowQAPlannerClick,
    isInspectionLogFeatureFlagActive,
    isQaPlannerFlagActive,
    selectedFeature,
    isLoadingLog,
}) => {
    const hasQAFeatures = !!(onShowOwnerDeliverablesLogsClick || onShowQAPlannerClick);
    return (
        <Box w="100%" bgColor="#1F2A43" h="100%" display="flex" flexDirection="column">
            <Box px={{ base: "24px", lg: "30px" }} flexShrink={0}>
                <Flex py="20px" align={"center"} justifyContent={"space-between"}>
                    <Heading as="h4" fontSize={{ base: "18px", lg: "24px" }} fontWeight="semibold" color="#FFFFFF">
                        Assistant
                    </Heading>
                </Flex>
                
                <Box pb={4}>
                    <Flex onClick={onNewChatClick} mb={3} border="1px" borderColor="#FFFFFF33" px={3} py={3} borderRadius="6px" gap={3} align="center" cursor="pointer" _hover={{ bgColor: "#FFFFFF11" }}>
                        <PlusIcon />
                        <Text marginBottom={0} fontSize="14px" color="#FFFFFF">New chat</Text>
                    </Flex>
                </Box>

                {/* QA Feature Buttons - only shown in sidebar mode */}
                {hasQAFeatures && (
                    <Box pb={4} borderBottom="1px solid" borderColor="#FFFFFF22" mb={4}>
                        <Text mb={3} color="#676F74" fontSize="13px" fontWeight="semibold" textTransform="uppercase">
                            QA Tools
                        </Text>
                        <Flex flexDir="column" gap={2}>
                            {isInspectionLogFeatureFlagActive && (
                                <Button
                                    onClick={onShowOwnerDeliverablesLogsClick}
                                    isDisabled={isLoadingLog}
                                    bg={selectedFeature === 'owner-deliverables' ? '#007bff' : '#24314D'}
                                    color="#FFFFFF"
                                    border="1px solid"
                                    borderColor={selectedFeature === 'owner-deliverables' ? '#007bff' : '#FFFFFF33'}
                                    borderRadius="6px"
                                    px={3}
                                    py={3}
                                    height="auto"
                                    fontSize="14px"
                                    fontWeight="normal"
                                    _hover={{ bg: selectedFeature === 'owner-deliverables' ? '#0056b3' : '#2A3651' }}
                                    _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
                                >
                                    {isLoadingLog && selectedFeature === 'owner-deliverables' ? (
                                        <Flex align="center" gap={2}>
                                            <Spinner size="sm" />
                                            <Text mb={0}>Loading...</Text>
                                        </Flex>
                                    ) : (
                                        'Owner Deliverables'
                                    )}
                                </Button>
                            )}
                            {isQaPlannerFlagActive && (
                                <Button
                                    onClick={onShowQAPlannerClick}
                                    isDisabled={isLoadingLog}
                                    bg={selectedFeature === 'qa-planner' ? '#007bff' : '#24314D'}
                                    color="#FFFFFF"
                                    border="1px solid"
                                    borderColor={selectedFeature === 'qa-planner' ? '#007bff' : '#FFFFFF33'}
                                    borderRadius="6px"
                                    px={3}
                                    py={3}
                                    height="auto"
                                    fontSize="14px"
                                    fontWeight="normal"
                                    _hover={{ bg: selectedFeature === 'qa-planner' ? '#0056b3' : '#2A3651' }}
                                    _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
                                >
                                    {isLoadingLog && selectedFeature === 'qa-planner' ? (
                                        <Flex align="center" gap={2}>
                                            <Spinner size="sm" />
                                            <Text mb={0}>Loading...</Text>
                                        </Flex>
                                    ) : (
                                        'QA Planner'
                                    )}
                                </Button>
                            )}
                        </Flex>
                    </Box>
                )}
            </Box>

            <Box 
                flex={1} 
                overflowY="auto" 
                px={{ base: "24px", lg: "30px" }}
                minH={0}
                className="sidebar-scroller"
            >
                <Flex flexDir="column" gap={6} pb={4}>
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

            {/* Disclaimer at the bottom */}
            <Box 
                px={{ base: "24px", lg: "30px" }} 
                py={4}
                flexShrink={0}
                borderTop="1px solid"
                borderColor="#FFFFFF22"
            >
                <Text 
                    fontSize="11px" 
                    color="#9CA3AF" 
                    lineHeight="1.5"
                    textAlign="center"
                >
                    AI results may vary. Please double check original sources to ensure completeness and accuracy.
                </Text>
            </Box>
        </Box>
    )
}

export default ChatSidebar