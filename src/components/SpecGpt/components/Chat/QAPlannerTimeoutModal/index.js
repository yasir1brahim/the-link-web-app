import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    VStack,
    Icon
} from '@chakra-ui/react';

const QAPlannerTimeoutModal = ({ isOpen, onRestart, onCancel }) => {
    return (
        <Modal isOpen={isOpen} onClose={onCancel} isCentered closeOnOverlayClick={false}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Processing Timeout</ModalHeader>
                <ModalBody>
                    <VStack spacing={5} align="stretch">
                        <Text textAlign="center" fontSize="large" fontWeight="bold">
                            Processing has taken longer than expected
                        </Text>
                        <Text textAlign="center" fontSize="md" color="gray.600">
                            The QA Planner processing has exceeded the timeout threshold.
                            You can restart the process or go back to try again later.
                        </Text>
                    </VStack>
                </ModalBody>
                <ModalFooter justifyContent="center" gap={3}>
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        size="lg"
                    >
                        Cancel
                    </Button>
                    <Button
                        bg="#d5e73e"
                        color="black"
                        variant="solid"
                        onClick={onRestart}
                        size="lg"
                        _hover={{
                            bg: "#c5d730"
                        }}
                    >
                        Restart QA Planner
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default QAPlannerTimeoutModal;
