import React, { useState, useEffect, useMemo } from 'react'
import { Box, Button, Flex, Heading, Link, List, ListItem, Progress, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, CircularProgress } from '@chakra-ui/react'
import SelectFilesIcon, { ChatICon, CircularPlus, DeleteIcon, FolderIcon, InprocessIcon, PDFIcon } from '../../assets/icons'
import { FaTriangleExclamation, FaCheck } from 'react-icons/fa6';
import ChunkedUploady,
 {
    useItemFinishListener,
    UPLOADER_EVENTS,
    Batch,
    BatchItem,
 } from "@rpldy/chunked-uploady";
import UploadButton from "@rpldy/upload-button";
import UploadDropZone from "@rpldy/upload-drop-zone";
import { useNavigate } from 'react-router-dom';
import { countUserDocs, UploadItemResponse, Filename, loadUserDocs } from '../../utils/apiUtils';
import { useDisclosure, HStack, Icon } from '@chakra-ui/react';
import { config } from '../../utils/config';

const DocumentUpload = () => {
    const navigator = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [showUploadingModal, setShowUploadingModal] = useState(false);
    const [showUploadCompleteModal, setShowUploadCompleteModal] = useState(false);

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [userDocs, setUserDocs] = useState([]);
    const [docCount, setDocCount] = useState(0);
    const [token, setToken] = useState('');
    const [uploadingFilesProgressText, setUploadingFilesProgressText] = useState('Uploading Files.');
    const [totalFilesToUpload, setTotalFilesToUpload] = useState(0);
    const [filesUploaded, setFilesUploaded] = useState(0);
    const [showUploadMaxError, setShowUploadMaxError] = useState(false);
    const [uploadErrors, setUploadErrors] = useState([]);    
    const ProcessingStatus = {
        IN_QUEUE: 'IN_QUEUE',
        UPLOADING: 'UPLOADING',
        PROCESSING: 'PROCESSING',
        PROCESSED: 'PROCESSED',
        FAILED: 'FAILED',
    }

    // Define a new component that will use the useItemFinishListener hook
    // This component needs to be rendered inside the <ChunkedUploady> component
    const UploadListenerComponent = () => {
        useItemFinishListener((item) => {
            console.log('item: ', item)
            uploadCompleteCallback(item.uploadResponse.results[0]);
            console.log(`item ${item.id} finished uploading, response was: `, item.uploadResponse, item.uploadStatus);  
        });

        // This component does not render anything itself
        return null;
    };

    const closeModals = () => {
        setTotalFilesToUpload(0);
        setFilesUploaded(0);
        setUploadErrors([]);
        setShowUploadMaxError(false);
        setShowUploadingModal(false);
        setShowUploadCompleteModal(false);
        onClose()
    }

    const uploadCompleteCallback = (item) => {        
        updateDocCount();
        console.log('upload call back ', item);
        if (item.data?.reachedUploadLimit) {
            setShowUploadMaxError(true);
            return;
        } else if (!item.data.success) {
            if (item.data.error && item.data.error !== '') {
                setUploadErrors([...uploadErrors, item.data.error]);
            }
        }
        updateUploadText(filesUploaded, totalFilesToUpload);
        if(item.data.filenames) {
            let newUploadedFiles = [...uploadedFiles, ...item.data.filenames];
            // sort newUploadedFiles
            newUploadedFiles.sort((a, b) => {
                if (a.filename < b.filename) {
                    return -1;
                }
                if (a.filename > b.filename) {
                    return 1;
                }
                return 0;
            });
            console.log('newUploadedFiles: ', newUploadedFiles);        
            setUploadedFiles([...newUploadedFiles]);
        }
    }

    const updateDocCount = () => {
        countUserDocs().then((count) => {
            setDocCount(count || 0);
        });
    }

    useEffect(() => {
        updateDocCount()
    }, []);

    const updateUploadText = (filesUploadedSoFar, totalFilesToUpload) => {
        setFilesUploaded(filesUploadedSoFar + 1); 
        setTotalFilesToUpload(totalFilesToUpload);
        const percent = (filesUploadedSoFar / totalFilesToUpload) * 100;
        const text = `Uploading Files. ${filesUploadedSoFar} of ${totalFilesToUpload} uploaded. ${percent.toFixed(0)}% complete.`;
        setUploadingFilesProgressText(text);
    }

    const listeners = useMemo(() => ({
        [UPLOADER_EVENTS.BATCH_START]: (batch) => {
            updateUploadText(filesUploaded, batch.items.length);
            onOpen();
            setShowUploadingModal(true);
            //console.log(`Batch Start - ${batch.id} - item count = ${batch.items.length}`);
        },
        [UPLOADER_EVENTS.BATCH_FINISH]: (batch) => {
            onOpen();
            setShowUploadingModal(false);
            setShowUploadCompleteModal(true);
            //console.log(`Batch Finish - ${batch.id} - item count = ${batch.items.length}`);
        },
        [UPLOADER_EVENTS.ITEM_START]: (item) => {
            //console.log(`Item Start - ${item.id} : ${item.file.name}`);
        },
        [UPLOADER_EVENTS.ITEM_FINISH]: (item) => {
            //console.log(`Item Finish - ${item.id} : ${item.file.name}`);
        },

    }), []);

    useEffect(() => {
        const fetchDocs = () => {
            loadUserDocs().then((docs) => {
                setUserDocs(docs.sort((a, b) => b.uploaded - a.uploaded));
            });
        };
        fetchDocs();

        const intervalId = setInterval(fetchDocs, 5000); // Then every 5 seconds
    
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);
    return (
        <Box w={"100%"} py={{ base: "20px", md: "30px", lg: "51px" }} px={{ base: '16px', xl: '0px' }}>
            <Box w="100%" maxW={"1280px"} mx="auto">
                <Flex gap={{ base: "44px", lg: "30px" }} flexDir={{ base: 'column-reverse', lg: 'row' }}>
                    <Box w={{ base: '100%', lg: '50%' }}>
                        <Heading mb={9} as='h2' size='lg' fontSize={{ base: "30px", md: "36px", lg: "46px" }} color={"#0E2332"} fontWeight='medium'>Getting Started</Heading>
                        <Flex flexDir="column" gap="33px" maxW="480px">
                            <Box>
                                <Flex align={{ md: "center" }} gap={{ base: "16px", md: "24px" }} border='2px' borderColor='#E7E7E7' py={{ base: "14px", md: "20px" }} px={{ base: "16px", md: "24px" }} borderRadius="8px">
                                    <SelectFilesIcon />
                                    <Box w="3px" h={{ base: "83px", sm: "60px" }} bgColor="#D5E73E" />
                                    <Box flex={1}>
                                        <Heading mb={2} as='h5' size='sm' fontSize="13px" fontWeight="semibold" color="#2F5AA3">
                                            Step 1
                                        </Heading>
                                        <Text fontSize={{ base: "14px", md: "18px" }} fontWeight="semibold" color="#1F2A43">
                                            Click “Select files” or “Select Folders” to upload specification documents.
                                        </Text>
                                    </Box>
                                </Flex>
                                <Text mt={2.5} fontSize="16px" color="#36454F">
                                    Note: At this time, SpecGPT has a file upload limit of 300 files.
                                </Text>
                            </Box>
                            <Box>
                                <Flex align={{ md: "center" }} gap={{ base: "16px", md: "24px" }} border='2px' borderColor='#E7E7E7' py={{ base: "14px", md: "20px" }} px={{ base: "16px", md: "24px" }} borderRadius="8px">
                                    <InprocessIcon />
                                    <Box w="3px" h={{ base: "83px", sm: "60px" }} bgColor="#D5E73E" />
                                    <Box flex={1}>
                                        <Heading mb={2} as='h5' size='sm' fontSize="13px" fontWeight="semibold" color="#2F5AA3">
                                            Step 2
                                        </Heading>
                                        <Text fontSize={{ base: "14px", md: "18px" }} fontWeight="semibold" color="#1F2A43">
                                            Let the system upload & process your documents. This can take 5+ minutes depending on file sizes
                                        </Text>
                                    </Box>
                                </Flex>

                            </Box>
                            <Box>
                                <Flex align={{ md: "center" }} gap={{ base: "16px", md: "24px" }} border='2px' borderColor='#E7E7E7' py={{ base: "14px", md: "20px" }} px={{ base: "16px", md: "24px" }} borderRadius="8px">
                                    <ChatICon />
                                    <Box w="3px" h={{ base: "83px", sm: "60px" }} bgColor="#D5E73E" />
                                    <Box flex={1}>
                                        <Heading mb={2} as='h5' size='sm' fontSize="13px" fontWeight="semibold" color="#2F5AA3">
                                            Step 3
                                        </Heading>
                                        <Text fontSize={{ base: "14px", md: "18px" }} fontWeight="semibold" color="#1F2A43">
                                            Chat with your project, ask questions and follow ups to get your answers.
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>
                            <Text fontSize="16px" color="#36454F">
                                For help email:{' '}
                                <Link color='#2F5AA3' href='mailto:support@thelink.ai' target="_blank">
                                    support@thelink.ai
                                </Link>
                            </Text>
                        </Flex>
                    </Box>
                    <Box w={{ base: '100%', lg: '50%' }} pt={3}>
                        <Box w={"100%"} bgColor="#FAFAFA" border="3px" borderColor="#EDEDED" borderRadius="4px" borderStyle="dashed" py={{ base: "67px", md: "80px", lg: "110px" }}>
                            <Box maxW="480px" mx="auto">
                                <ChunkedUploady
                                    listeners={listeners}
                                    chunkSize={process.env.NODE_ENV === 'development' ? 5 * 1024 * 1024 : 10 * 1024 * 1024} // 5MB for dev, 10MB for prod
                                    destination={{url: `${config.BASE_URL}/api/upload`,
                                            headers: {
                                            "Authorization": "Bearer " + token,
                                        },
                                    }}>
                                    <UploadDropZone
                                        onDragOverClassName="drag-over"
                                    >
                                        <Flex
                                            mb={6}
                                            flexDir="column"
                                            gap={6}
                                            maxW={"405px"}
                                            mx="auto"
                                            align="center"
                                            justify="center"
                                        >
                                            <label htmlFor="pdf-input" style={{ cursor: "pointer" }}>
                                                <CircularPlus />
                                            </label>
                                            <Heading
                                                as="h4"
                                                size="lg"
                                                fontSize={{ base: "18px", md: '24px' }}
                                                color={"#0E2332"}
                                                fontWeight="semibold"
                                            >
                                                Drag & Drop File(s) or Folders here
                                            </Heading>
                                        </Flex>
                                    </UploadDropZone>
                                    <UploadListenerComponent />
                                </ChunkedUploady>
                                <Flex flexDir={{ base: 'column', md: 'row' }} rowGap={2.5} columnGap={{ md: "24px" }} maxW={"400px"} mx="auto" align="center" justify="center">
                                    <Box >
                                        <ChunkedUploady
                                            listeners={listeners}
                                            chunkSize={process.env.NODE_ENV === 'development' ? 5 * 1024 * 1024 : 10 * 1024 * 1024} // 5MB for dev, 10MB for prod
                                            accept='application/pdf'
                                            destination={{url: `${config.BASE_URL}/api/upload`,
                                                headers: {
                                                    "Authorization": "Bearer " + token,
                                                }
                                            }}
                                        >   
                                            <Button px={7} py={3} gap={2.5} align="center" bgColor="#ECECEC" borderRadius="3px" minW="236px" justifyContent="center" whiteSpace="nowrap" fontSize="14px" color="#0E2332">
                                                <UploadButton
                                                    text="Click to select PDFs"
                                                />
                                                <PDFIcon />
                                            </Button>
                                            <UploadListenerComponent />
                                        </ChunkedUploady>
                                    </Box>
                                    <Box minW="236px">
                                        <ChunkedUploady
                                            listeners={listeners}
                                            chunkSize={process.env.NODE_ENV === 'development' ? 5 * 1024 * 1024 : 10 * 1024 * 1024} // 5MB for dev, 10MB for prod
                                            destination={{url: `${config.BASE_URL}/api/upload`,
                                                headers: {
                                                    "Authorization": "Bearer " + token,
                                                }
                                            }}
                                        >
                                            <Button px={7} py={3} gap={2.5} align="center" bgColor="#ECECEC" justifyContent="center" borderRadius="3px" minW="236px" whiteSpace="nowrap" fontSize="14px" color="#0E2332">
                                                <UploadButton
                                                    text="Click to select Folders"
                                                />
                                                <FolderIcon />
                                            </Button>
                                            <UploadListenerComponent />
                                        </ChunkedUploady>
                                    </Box>
                                </Flex>
                            </Box>
                        </Box>
                        <Box>
                            <Button
                                fontWeight="semibold" color="#1F2A43" w="100%" h="51px" bgColor="#D5E73E" mt={userDocs.length > 0 ? 4 : 0} _hover={{ bg: '#ecff4f' }}
                                onClick={() => {
                                    navigator('/chat');
                                }}
                                mb={4}
                            >
                                Go to chat page
                            </Button>
                            {uploadErrors.map((error, index) => {
                                return (
                                    <Text key={index}>
                                        <Icon as={FaTriangleExclamation} size="lg" style={{color: "red.400",}} />
                                        {' '} {error}
                                    </Text>
                                )
                            })}
                            {showUploadMaxError && (
                                <Text style={{color: 'red'}}>
                                    You have reached the maximum number of files allowed. Please delete some files and try again.
                                </Text>
                            )}
                            {userDocs.length > 0 && (
                                <Box>
                                    <Text fontSize="13px" color="#676F74" fontWeight="semibold">
                                        Uploaded files
                                    </Text>
                                    <List spacing={3} mt={2.5}>
                                        {Array.from(userDocs).map((file, index) => (
                                            file.processing_status !== ProcessingStatus.UPLOADING ? 
                                                <ListItem border="2px" borderColor="#EDEDED" borderRadius="6px" p={6} key={index}>
                                                    <Flex w="100%" align="center" justifyContent="space-between">
                                                        <Flex align="center" gap={3} >
                                                            <PDFIcon fill="#E5ECF6" />
                                                            <Text>
                                                                {file?.filename}
                                                            </Text>
                                                        </Flex>
                                                        <Flex>
                                                            <Flex mt={"5px"} align={"center"} gap={2.5} w={"fit-content"} bgColor={file?.processing_status === ProcessingStatus.PROCESSED ? "#38A1690F" : "#A526260F"} borderRadius={"6px"} py={"6px"} px={2.5}>
                                                                {file?.processing_status === ProcessingStatus.PROCESSING ? (
                                                                    <>
                                                                        <CircularProgress size='16px' isIndeterminate color='red.500' />
                                                                        <Text color="#36454F" fontSize={"12px"}>
                                                                            {'Processing'}
                                                                        </Text>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Box h={"5px"} w={"5px"} bgColor={file?.processing_status === ProcessingStatus.PROCESSED ? "#38A169" : "#A52626"} borderRadius={"100%"} />
                                                                        <Text color="#36454F" fontSize={"12px"}>
                                                                            {file?.processing_status === ProcessingStatus.IN_QUEUE ? 'In queue' : ''}
                                                                            {file?.processing_status === ProcessingStatus.PROCESSED ? 'Processed' : ''}
                                                                            {file?.processing_status === ProcessingStatus.FAILED ? 'Failed' : ''}
                                                                        </Text>
                                                                    </>
                                                                )}
                                                            </Flex>
                                                            <Box mt={"8px"} ml={"5px"} cursor="pointer">
                                                                <DeleteIcon />
                                                            </Box>
                                                        </Flex>
                                                    </Flex>
                                                </ListItem> : ''
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Flex>
            </Box >
            <Modal closeOnOverlayClick={showUploadingModal ? false : true} isCentered isOpen={isOpen} onClose={closeModals}>
                <ModalOverlay/>
                <ModalContent>
                    {showUploadingModal && <>
                        <ModalHeader>Uploading Files</ModalHeader>
                        <ModalBody>
                            <Flex justify={'center'} mb={2}>
                                <CircularProgress isIndeterminate color='blue.500' />
                            </Flex>
                            <Text>{uploadingFilesProgressText}</Text>
                        </ModalBody>
                    </>}
                    {showUploadCompleteModal && <>
                        <ModalHeader>Success</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>Your files have been uploaded. SpecGPT is now processing your files. This may take a few minutes. When this is done, you can proceed to the chat page.</Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={closeModals}>OK</Button>
                        </ModalFooter>
                    </>}
                </ModalContent>
            </Modal>
        </Box >
    )
}

export default DocumentUpload