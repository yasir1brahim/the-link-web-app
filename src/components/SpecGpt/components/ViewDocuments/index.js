import {
    Box, Button, Flex, Heading, Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Text,
    useDisclosure,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, CircularProgress,
    HStack
} from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { ChevronLeft, DeleteIcon, PDFIcon } from '../../assets/icons'
import { useNavigate } from 'react-router-dom';
import { loadUserDocs, purgeFiles, Document, ProcessingStatus } from '../../utils/apiUtils';

const ViewDocuments = () => {
    const navigator = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [userDocs, setUserDocs] = useState([]);
    const [showPurgeFilesModal, setShowPurgeFilesModal] = useState(false);
    const [showPurgingSpinnerModal, setShowPurgingSpinnerModal] = useState(false);

    useEffect(() => {
        loadUserDocs().then((docs) => {
            setUserDocs(docs);
        });
    }, []);

    const deleteUserFiles = () => {
        setShowPurgingSpinnerModal(true);
        setShowPurgeFilesModal(false);
        purgeFiles().then(success => {
            if (success) {
                setUserDocs([]);
                setShowPurgingSpinnerModal(false);
                navigator('/getting-started');
            }
        });
    }

    const closeModals = () => {
        setShowPurgeFilesModal(false);
        setShowPurgingSpinnerModal(false);
        onClose()
    }
    return (
        <Box w="100%" maxW="800px" mx="auto" py={{ base: "0px", md: "60px" }} >
            <Box>
                <Flex mb={"24px"} align={"center"} justifyContent={"space-between"} bgColor={{ base: "#FAFAFA", md: "white" }} px={{ base: "16px", lg: "0px" }} py={{ base: "14px", md: "0px" }}>
                    <Flex align={"center"} gap={2.5}>
                        <Box
                            display={{ base: "block", md: "none" }}
                            onClick={() => {
                                navigator(-1);
                            }}
                        >
                            <ChevronLeft />
                        </Box>
                        <Heading as="h4" fontSize={{ base: "16px", md: "20px", lg: "24px" }} fontWeight={"semibold"} color="#1F2A43">
                            Uploaded Files
                        </Heading>
                    </Flex>
                    <Button size='md' variant='outline' px={"28px"} fontWeight={"semibold"} color={"#676F74"}
                        onClick={() => {
                            setShowPurgeFilesModal(true);
                            onOpen();
                        }}
                    >
                        Delete All
                    </Button>
                </Flex>
                <TableContainer display={{ base: "none", md: "block" }} px={{ base: "16px", lg: "0px" }}>
                    <Table variant='simple' >
                        <Thead bgColor={"#FAFAFA"} border={"2px"} borderColor={"#E7E7E7"}>
                            <Tr>
                                <Th textTransform={"uppercase"}>FILE NAME</Th>
                                <Th textTransform={"uppercase"} >Uploaded on</Th>
                                <Th textTransform={"uppercase"}>PROCESSING STATUS</Th>
                                <Th isNumeric></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {userDocs?.map((item, index) => {
                                return (
                                    <Tr border={"2px"} borderColor={"#E7E7E7"} color="#0E2332" key={index}>
                                        <Td>{item?.filename}</Td>
                                        <Td>{item?.uploaded_display}</Td>
                                        <Td>
                                            <Flex align={"center"} gap={2.5} w={"fit-content"} bgColor={item?.processing_status === ProcessingStatus.PROCESSED ? "#38A1690F" : "#A526260F"} borderRadius={"6px"} py={"6px"} px={2.5}>
                                                {item?.processing_status === ProcessingStatus.PROCESSING ? (
                                                    <>
                                                        <CircularProgress size='16px' isIndeterminate color='red.500' />
                                                        <Text color="#36454F">
                                                            {'Processing'}
                                                        </Text>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Box h={"5px"} w={"5px"} bgColor={item?.processing_status === ProcessingStatus.PROCESSED ? "#38A169" : "#A52626"} borderRadius={"100%"} />
                                                        <Text color="#36454F">
                                                            {item?.processing_status === ProcessingStatus.IN_QUEUE ? 'In queue' : ''}
                                                            {item?.processing_status === ProcessingStatus.PROCESSED ? 'Processed' : ''}
                                                            {item?.processing_status === ProcessingStatus.FAILED ? 'Failed' : ''}
                                                        </Text>
                                                    </>
                                                )}
                                            </Flex>
                                        </Td>
                                        <Td isNumeric>
                                            <DeleteIcon />
                                        </Td>
                                    </Tr>
                                )
                            })}
                        </Tbody>
                    </Table>
                </TableContainer>
                <Flex flexDir={"column"} gap={"10px"} display={{ base: "flex", md: "none" }} px={{ base: "16px", lg: "0px" }}>
                    {userDocs?.map((item, index) => {
                        return (
                            <Flex gap={4} p={3} border="2px" borderColor="#EDEDED" borderRadius={"6px"} key={index}>
                                <PDFIcon fill="#E5ECF6" />
                                <Box flex={1}>
                                    <Text fontSize={"14px"}>{item?.filename}</Text>
                                    <Text fontSize={"13px"} color={"#CBCBCB"}>{item?.uploaded_display}</Text>
                                    <Flex mt={"5px"} align={"center"} gap={2.5} w={"fit-content"} bgColor={item?.processing_status === ProcessingStatus.PROCESSED ? "#38A1690F" : "#A526260F"} borderRadius={"6px"} py={"6px"} px={2.5}>
                                        {item?.processing_status === ProcessingStatus.PROCESSING ? (
                                            <>
                                                <CircularProgress size='16px' isIndeterminate color='red.500' />
                                                <Text color="#36454F" fontSize={"12px"}>
                                                    {'Processing'}
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                <Box h={"5px"} w={"5px"} bgColor={item?.processing_status === ProcessingStatus.PROCESSED ? "#38A169" : "#A52626"} borderRadius={"100%"} />
                                                <Text color="#36454F" fontSize={"12px"}>
                                                    {item?.processing_status === ProcessingStatus.IN_QUEUE ? 'In queue' : ''}
                                                    {item?.processing_status === ProcessingStatus.PROCESSED ? 'Processed' : ''}
                                                    {item?.processing_status === ProcessingStatus.FAILED ? 'Failed' : ''}
                                                </Text>
                                            </>
                                        )}
                                    </Flex>
                                </Box>
                                <Box>
                                    <DeleteIcon width={16} height={16} />
                                </Box>
                            </Flex>
                        )
                    })}
                </Flex>
            </Box>
            <Modal isCentered isOpen={isOpen} onClose={closeModals} closeOnOverlayClick={!showPurgingSpinnerModal}>
                <ModalOverlay/>
                <ModalContent>
                    {showPurgeFilesModal && <>
                        <ModalHeader>Confirm File Deletion</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>Are you sure you want to delete all your files?</Text>
                        </ModalBody>
                        <ModalFooter>
                            <HStack>
                                <Button variant={'outline'} onClick={() => closeModals()}>Cancel</Button>
                                <Button colorScheme={'red'} onClick={() => deleteUserFiles()}>Delete</Button>
                            </HStack>
                        </ModalFooter>
                    </>}
                    {showPurgingSpinnerModal && <>
                        <ModalHeader>Deleting Files</ModalHeader>
                        <ModalBody display={'flex'} flexDirection={'column'} alignItems={'center'}>
                            <CircularProgress isIndeterminate color='blue.500' />
                            <Text mt={4}>Deleting Files</Text>
                        </ModalBody>
                    </>}
                </ModalContent>
            </Modal>
        </Box>
    )
}

export default ViewDocuments