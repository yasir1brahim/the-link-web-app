import React, { useState } from 'react'
import { Box, Center, Heading, Spinner, Button, useToast, HStack, Text } from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import Message from './ChatMain/Message';
import { MESSAGE_ROLE_TYPE } from '../../utils/enums';
import { extractTablesToExcel } from '../../utils/apiUtils';
import FileDownload from "js-file-download";



const InspectionLog = ({ 
    inspectionLog, 
    projectId
}) => {
    const [isExtracting, setIsExtracting] = useState(false);
    const toast = useToast();

    const handleExtractTables = async () => {
        if (!inspectionLog) {
            toast({
                title: "No content to extract",
                description: "Please wait for the inspection log to load first.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsExtracting(true);
        try {
            const result = await extractTablesToExcel(projectId, inspectionLog);
        
              let blob = new Blob([result.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              });
              FileDownload(
                blob,
                `${
                  `Project`
                }_inspection_log_${new Date().toLocaleDateString("en-US", { day: 'numeric' })}_${new Date().toLocaleDateString("en-US", { month: 'short' })}_${new Date().toLocaleDateString("en-US", { year: 'numeric' })}.xlsx`
              );
            console.log("result", result);
            if (result.status === 200) {
                toast({
                    title: "Inspection log exported successfully",
                    description: `Excel file downloaded`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Export failed",
                    description: result.error || "No inspection log found in the content",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Export failed",
                description: "An unexpected error occurred while exporting the inspection log",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <Box w="100%" maxW={"1200px"} h={"100%"} position={"relative"} pt={{ base: "20px", lg: "40px" }} marginX={"auto"}>
            {!inspectionLog && 
                <Center h={"100%"} w={"100%"} flexDirection={"column"} gap={5}>
                    <Spinner size="xl" color="#1F2A43" />
                </Center>
            }
            {inspectionLog &&
                <Box display={"block"} h={"calc(100% - 100px)"} w={"100%"} overflowY={"auto"}>
                    {/* Extract Tables Button */}
                    <Box mb={4} px={4}>
                        <HStack spacing={3} justify="flex-end">
                            <Button
                                size="sm"
                                colorScheme="blue"
                                leftIcon={<DownloadIcon />}
                                onClick={() => handleExtractTables(true)}
                                isLoading={isExtracting}
                                loadingText="Exporting..."
                            >
                                Export to Excel
                            </Button>
                        </HStack>
                    </Box>
                    
                    <Message 
                        messageType={MESSAGE_ROLE_TYPE.ASSISTANT}
                        message={inspectionLog} 
                        questionid={''} 
                        sources={[]}
                        projectId={projectId}
                        isLoading={false}
                    />
                </Box>
            }
        </Box>
    )
}

export default InspectionLog