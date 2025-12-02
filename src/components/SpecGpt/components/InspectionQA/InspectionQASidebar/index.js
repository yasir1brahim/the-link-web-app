import { Box, Flex, Text, Button, VStack, Heading } from '@chakra-ui/react'
import React from 'react'

const InspectionQASidebar = ({
    onShowOwnerDeliverablesLogsClick,
    onShowQAPlannerClick,
    isInspectionLogFeatureFlagActive,
    isQaPlannerFlagActive,
    isSidebarExpanded,
    selectedFeature
}) => {
    // If sidebar is expanded (viewing a log), show compact sidebar
    if (isSidebarExpanded) {
        return (
            <Box w="100%" bgColor="#1F2A43" h="100%" display="flex" flexDirection="column">
                <Box px={{ base: "24px", lg: "30px" }} flexShrink={0}>
                    <Flex py="20px" align={"center"} justifyContent={"space-between"}>
                        <Heading as="h2" fontSize={{ base: "18px", lg: "24px" }} fontWeight="semibold" color="#FFFFFF">
                            Inspection & QA
                        </Heading>
                    </Flex>

                    <Box pb={4}>
                        {isInspectionLogFeatureFlagActive && (
                            <Flex
                                onClick={onShowOwnerDeliverablesLogsClick}
                                mb={3}
                                border="1px"
                                borderColor="#FFFFFF33"
                                px={3}
                                py={3}
                                borderRadius="6px"
                                gap={3}
                                align="center"
                                cursor="pointer"
                                _hover={{ bgColor: "#FFFFFF11" }}
                                bg={selectedFeature === 'owner-deliverables' ? '#FFFFFF11' : 'transparent'}
                            >
                                <Text marginBottom={0} fontSize="14px" color="#FFFFFF">Owner Deliverables</Text>
                            </Flex>
                        )}

                        {isQaPlannerFlagActive && (
                            <Flex
                                onClick={onShowQAPlannerClick}
                                mb={3}
                                border="1px"
                                borderColor="#FFFFFF33"
                                px={3}
                                py={3}
                                borderRadius="6px"
                                gap={3}
                                align="center"
                                cursor="pointer"
                                _hover={{ bgColor: "#FFFFFF11" }}
                                bg={selectedFeature === 'qa-planner' ? '#FFFFFF11' : 'transparent'}
                            >
                                <Text marginBottom={0} fontSize="14px" color="#FFFFFF">QA Planner</Text>
                            </Flex>
                        )}
                    </Box>
                </Box>

                {/* Disclaimer at the bottom */}
                <Box
                    px={{ base: "24px", lg: "30px" }}
                    py={4}
                    flexShrink={0}
                    borderTop="1px solid"
                    borderColor="#FFFFFF22"
                    mt="auto"
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

    // Default centered view with white background
    return (
        <Flex
            w="100%"
            h="100%"
            bg="white"
            align="center"
            justify="center"
            flexDirection="column"
            px={8}
        >
            <VStack spacing={4} maxW="600px" w="100%">
                <Heading
                    as="h1"
                    fontSize="36px"
                    fontWeight="bold"
                    color="#1F2A43"
                    textAlign="center"
                    mb={2}
                >
                    Inspection & QA
                </Heading>

                <Text
                    fontSize="16px"
                    color="#666"
                    textAlign="center"
                    mb={6}
                >
                    Select a feature to view and manage your project's owner deliverables or QA planning data
                </Text>

                {isInspectionLogFeatureFlagActive && (
                    <Button
                        onClick={onShowOwnerDeliverablesLogsClick}
                        w="100%"
                        h="60px"
                        bg="#1F2A43"
                        color="white"
                        fontSize="16px"
                        fontWeight="600"
                        borderRadius="8px"
                        _hover={{ bg: "#1F2A49" }}
                        _active={{ bg: "#1F2A49" }}
                    >
                        Owner Deliverables
                    </Button>
                )}

                {isQaPlannerFlagActive && (
                    <Button
                        onClick={onShowQAPlannerClick}
                        w="100%"
                        h="60px"
                        bg="#1F2A43"
                        color="white"
                        fontSize="16px"
                        fontWeight="600"
                        borderRadius="8px"
                        _hover={{ bg: "#1F2A49" }}
                        _active={{ bg: "#1F2A49" }}
                    >
                        QA Planner
                    </Button>
                )}
            </VStack>
        </Flex>
    )
}

export default InspectionQASidebar
