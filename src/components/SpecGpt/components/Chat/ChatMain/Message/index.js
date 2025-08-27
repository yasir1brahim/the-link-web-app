import { Flex, Image, Text, Skeleton, Container, SkeletonText, Button, useToast, Box, HStack, Heading } from '@chakra-ui/react'
import React, { useState } from 'react'
import SpecGptImage from "../../../../assets/spec-gpt.png"
import { DownloadIcon } from '@chakra-ui/icons'
import FileDownload from "js-file-download";
import { MESSAGE_ROLE_TYPE } from '../../../../utils/enums';
import { extractTablesToExcel } from '../../../../utils/apiUtils';
import MessageSources from '../MessageSources';
import { marked } from 'marked';


const Message = ({ messageType, message, sources, isLoading, projectId }) => {
    const [isExtracting, setIsExtracting] = useState(false);
    const toast = useToast();

    let messageHeading = "System"
    if (messageType === MESSAGE_ROLE_TYPE.USER) {
        messageHeading = "You"
    }
    if (messageType === MESSAGE_ROLE_TYPE.ASSISTANT) {
        messageHeading = "SpecGPT"
    }

    const isOwnerDeliverablesCommandMessage = messageType === MESSAGE_ROLE_TYPE.SYSTEM && message === "Generate owner deliverables log"
    const isInspectionLogCommandMessage = messageType === MESSAGE_ROLE_TYPE.SYSTEM && message === "Generate inspection log"

    const convertCommandMessageToHeading = (message) => {
        if (message === "Generate owner deliverables log") {
            return "Owner Deliverables"
        }
        if (message === "Generate inspection log") {
            return "Inspections"
        }
        return message
    }

    const handleExtractTables = async () => {
        if (!message) {
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
            const result = await extractTablesToExcel(projectId, message);
        
            console.log("result", result);
            if (result.status === 200) {
                let blob = new Blob([result.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                FileDownload(
                    blob,
                    `${
                        `Project`
                    }_inspection_log_${new Date().toLocaleDateString("en-US", { day: 'numeric' })}_${new Date().toLocaleDateString("en-US", { month: 'short' })}_${new Date().toLocaleDateString("en-US", { year: 'numeric' })}.xlsx`
                );
                toast({
                    title: "Inspection log exported successfully",
                    description: `Excel file downloaded`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                  
            } else if (result.errorType === 'no_tables') {
                toast({
                    title: "No exportable data found",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Export failed",
                    description: result.error || "Export failed",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Export failed",
                description: "An unexpected error occurred while exporting",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsExtracting(false);
        }
    };

    function convertUrlsToLinks(text) {
        console.log("text", text);
        const urlPattern = /(\bhttps?:\/\/[^\s/$.?#].[^\s]*)/gi;
        if (!!text) {
            return text.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        }
        return text;
    }
    
    const TextWithLinks = (text) => {
        let markdownConvertedToHtml = '';
        if (!!text) {
            const convertedText = convertUrlsToLinks(text);
            marked.setOptions({
                tables: true,
                breaks: false,
                pedantic: false,
            });
            markdownConvertedToHtml = marked(convertedText);
        }
        return (
            <>
                <style>
                    {`
                        .markdown-body {
                            line-height: 1.2;
                        }
                        .markdown-body p {
                            margin: 0 0;
                        }
                        .markdown-body h1, .markdown-body h2, .markdown-body h3, 
                        .markdown-body h4, .markdown-body h5, .markdown-body h6 {
                            margin: 0.8em 0 0.4em 0;
                        }
                        .markdown-body ul, .markdown-body ol {
                            margin: 0 0;
                            padding-left: 1.5em;
                        }
                        .markdown-body li {
                            margin: 0 0;
                        }
                        .markdown-body hr {
                            margin: 0 0;
                            border: none;
                            border-top: 1px solid #e2e8f0;
                        }
                        .markdown-body blockquote {
                            margin: 0 0;
                            padding-left: 1em;
                            border-left: 3px solid #e2e8f0;
                        }
                    `}
                </style>
                <div className="markdown-body" dangerouslySetInnerHTML={{ __html: markdownConvertedToHtml }} />
            </>
        );
    };
    return (
        <Container 
            borderRadius={6} 
            maxW={messageType === MESSAGE_ROLE_TYPE.USER ? "75%" : "100%"} 
            pt={isOwnerDeliverablesCommandMessage || isInspectionLogCommandMessage ? 0 : 4} 
            pb={isOwnerDeliverablesCommandMessage || isInspectionLogCommandMessage ? 0 : 4} 
            px={4} 
            backgroundColor={messageType === MESSAGE_ROLE_TYPE.USER ? "gray.100" : "white"}
            color={"gray.900"}
            ml={messageType === MESSAGE_ROLE_TYPE.USER ? "auto" : "0"}
            mr={messageType === MESSAGE_ROLE_TYPE.USER ? "0" : "auto"}
            mb={isOwnerDeliverablesCommandMessage || isInspectionLogCommandMessage ? "0" : "30px"}
            textAlign={isOwnerDeliverablesCommandMessage || isInspectionLogCommandMessage ? "center" : "left"}
        >
            <Text color={"gray.900"} whiteSpace={"pre-wrap"} m={0}>
                {messageType === MESSAGE_ROLE_TYPE.USER ? (
                    <Text color={"gray.900"} whiteSpace={"pre-wrap"} m={0}>
                        {message}
                    </Text>
                ) : 
                isOwnerDeliverablesCommandMessage || isInspectionLogCommandMessage ? (
                    <Heading color={"gray.900"} whiteSpace={"pre-wrap"} m={0} fontSize={"1.25rem"} fontWeight={"bold"}>
                        {convertCommandMessageToHeading(message)}
                    </Heading>
                ) : (
                    <SkeletonText isLoaded={!isLoading} noOfLines={4} skeletonHeight="20px" width={"100%"}>
                        {(messageType === MESSAGE_ROLE_TYPE.AI_INSPECTION_LOG || messageType === MESSAGE_ROLE_TYPE.AI_OWNER_DELIVERABLES_LOG) &&
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
                        }
                        {TextWithLinks(message)}
                    </SkeletonText>
                )}
            </Text>
            {!!sources && !isLoading && (
                <MessageSources
                    sources={sources}
                    projectId={projectId}
                />
            )}
        </Container>   
    )
}

export default Message