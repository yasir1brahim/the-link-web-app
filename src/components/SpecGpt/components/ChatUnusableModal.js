import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export const ChatUnusableModal = ({ isUnusable }) => {
    const navigator = useNavigate();
    return (
        <>
            {isUnusable && <Modal closeOnOverlayClick={false} isCentered isOpen={true} onClose={()=>{}}>
                <ModalOverlay/>
                <ModalContent>
                    <>
                        <ModalHeader>Upload Documents to Continue</ModalHeader>
                        <ModalBody>
                            <Text>
                                Upload documents to chat with SpecGPT.
                            </Text>
                        </ModalBody>
                        <ModalFooter justifyContent={'space-between'}>
                            <div></div>
                            <Button colorScheme='yellow' onClick={() => navigator('/getting-started')
                            }>
                                Upload Documents
                            </Button>
                        </ModalFooter>
                    </>
                </ModalContent>
            </Modal>}
        </>
    )
};

