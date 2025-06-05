import React, {useState, useEffect} from "react";
import { HStack, Icon, Text, Badge, CardBody, CardHeader, Card, Heading,
     Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, useDisclosure,
    Button } from "@chakra-ui/react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import {ExternalLinkIcon} from "@chakra-ui/icons"
import { FaListUl } from "react-icons/fa6";
import { shortenFilename, shortenString } from "../../../../utils/textUtils";
import { fetchPdf } from "../../../../utils/apiUtils";


const MessageSources = ({sources, projectId}) => {
    console.log("sources", sources);
    const [focusedSource, setFocusedSource] = useState(null);
    const [focusedSourceSignedUrl, setFocusedSourceSignedUrl] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        console.log("focused source", focusedSource);
        if (focusedSource) {
            fetchPdf(projectId, focusedSource?.metadata?.s3_bucket, focusedSource?.metadata?.s3_key).then((url) => {
                console.log(url);
                setFocusedSourceSignedUrl(url);
            });
        }
    }, [focusedSource])

    return (
        <>
            {sources.length > 0 && <Accordion bg={"gray.100"} borderRadius={6} mt={2} p={1} ms={10} allowToggle>
                <AccordionItem border={"none"}>
                    <AccordionButton>
                        <HStack width={"100%"} bg={"transparent"} justify="space-between" align={"center"} >
                            <HStack>
                                <Icon as={FaListUl} />
                                <Text mb={0} pb={0}>Sources</Text>
                            </HStack>
                            <HStack>
                                <Badge borderRadius="full" colorScheme="lightBlue">{sources.length}</Badge>
                                <AccordionIcon/>
                            </HStack>
                        </HStack>
                    </AccordionButton>
                    <AccordionPanel>
                        <HStack bg={"transparent"} maxWidth={"100%"} p={0} overflowX={"scroll"} overflowY={"clip"}>
                            {sources.map((source, index) => (
                                <Card key={index} minWidth={"20ch"} height={"12ch"} _hover={{cursor: "pointer"}} onClick={() => {setFocusedSource(source); onOpen()}}>
                                    <CardHeader p={3}>
                                        <Heading size="sm">{shortenFilename(source?.metadata?.source, 20)}</Heading>
                                    </CardHeader>
                                    <CardBody p={3}>
                                        <Text>{shortenString(source?.page_content, 40)}</Text>
                                    </CardBody>
                                </Card>
                            ))}
                        </HStack>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>}
            <Modal
                isOpen={isOpen}
                fade={false}
                toggle={onClose}
                className="new-customer modal-md"
            >
                <ModalHeader toggle={onClose}>{focusedSource?.metadata?.source}</ModalHeader>
                <ModalBody>
                    <Text style={{whiteSpace: "pre-wrap"}}>{focusedSource?.page_content}</Text>
                </ModalBody>
                <ModalFooter justifyContent={'space-between'}>
                    <Button onClick={onClose}>Close</Button>
                    <Button as={"a"} href={`/view-pdf?url=${focusedSourceSignedUrl}` || ''} disabled={!focusedSourceSignedUrl} target={"_blank"} colorScheme="blue" alignItems={"center"}>
                        <ExternalLinkIcon/>&nbsp;Open Document
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default MessageSources;