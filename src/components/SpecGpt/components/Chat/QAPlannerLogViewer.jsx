import React from 'react';
import { 
    Box, 
    Text, 
    VStack, 
    HStack, 
    Badge, 
    Divider,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer
} from '@chakra-ui/react';
import { 
    groupLogDataByItemType, 
    getCompletionStatusWithLabels, 
    getStatusDisplay,
    formatItemType 
} from '../../../utils/qaUtils';

const QAPlannerLogViewer = ({ logData, completionStatus, qaOptionsSelected }) => {
    if (!logData || !logData.log_data) {
        return (
            <Box p={4}>
                <Text>No QA Planner data available</Text>
            </Box>
        );
    }

    const groupedData = groupLogDataByItemType(logData.log_data);
    const prettyCompletionStatus = getCompletionStatusWithLabels(completionStatus);

    return (
        <Box>
            {/* Status Overview */}
            <Box mb={6} p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="lg" fontWeight="bold" mb={3}>QA Planner Status</Text>
                <HStack spacing={4} wrap="wrap">
                    {Object.entries(prettyCompletionStatus).map(([qaType, status]) => {
                        const { icon, color, text } = getStatusDisplay(status);
                        return (
                            <HStack key={qaType} spacing={2}>
                                <Text>{icon}</Text>
                                <Text fontWeight="medium">{qaType}:</Text>
                                <Badge colorScheme={color}>{text}</Badge>
                            </HStack>
                        );
                    })}
                </HStack>
            </Box>

            {/* Grouped Results */}
            <VStack spacing={4} align="stretch">
                <Text fontSize="xl" fontWeight="bold">QA Results by Category</Text>
                
                <Accordion allowMultiple defaultIndex={Object.keys(groupedData).map((_, index) => index)}>
                    {Object.entries(groupedData).map(([qaType, items]) => (
                        <AccordionItem key={qaType}>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    <HStack spacing={3}>
                                        <Text fontSize="lg" fontWeight="semibold">
                                            {qaType}
                                        </Text>
                                        <Badge colorScheme="blue" variant="subtle">
                                            {items.length} items
                                        </Badge>
                                    </HStack>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                                <TableContainer>
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>Spec Section #</Th>
                                                <Th>Spec Section Name</Th>
                                                <Th>Item Text</Th>
                                                <Th>Responsible Party</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {items.map((item, index) => (
                                                <Tr key={index}>
                                                    <Td>{item.spec_section_number || 'N/A'}</Td>
                                                    <Td>{item.spec_section_name || 'N/A'}</Td>
                                                    <Td>{item.item_text || 'N/A'}</Td>
                                                    <Td>{item.responsible_party || 'N/A'}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </AccordionPanel>
                        </AccordionItem>
                    ))}
                </Accordion>

                {Object.keys(groupedData).length === 0 && (
                    <Box p={8} textAlign="center">
                        <Text color="gray.500">No QA results available yet. Processing may still be in progress.</Text>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default QAPlannerLogViewer;
