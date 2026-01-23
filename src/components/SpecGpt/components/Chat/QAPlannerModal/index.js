import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Checkbox,
    VStack,
    Text,
    Icon,
    useToast
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { getQAOptionsWithLabels } from '../../../utils/qaUtils';

const QA_OPTIONS = getQAOptionsWithLabels();

const QAPlannerModal = ({ isOpen, onClose, onSubmit, onSuccessClose, isLoading = false, isSuccess = false }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const toast = useToast();

    const handleOptionChange = (optionId, isChecked) => {
        if (isChecked) {
            setSelectedOptions(prev => [...prev, optionId]);
        } else {
            setSelectedOptions(prev => prev.filter(id => id !== optionId));
        }
    };

    const handleSubmit = () => {
        if (selectedOptions.length === 0) {
            toast({
                title: 'No options selected',
                description: 'Please select at least one QA option to continue.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        onSubmit(selectedOptions);
    };

    const handleClose = () => {
        setSelectedOptions([]);
        onClose();
    };

    const handleSuccessClose = () => {
        setSelectedOptions([]);
        if (onSuccessClose) {
            onSuccessClose();
        }
    };

    // Success view
    if (isSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={handleSuccessClose} isCentered closeOnOverlayClick={false}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader textAlign="center">QA Planner</ModalHeader>
                    <ModalBody textAlign="center" py={6}>
                        <Icon as={CheckCircleIcon} w={12} h={12} color="green.500" mb={4} />
                        <Text fontSize="lg" fontWeight="medium" mb={2}>
                            QA Planner generation started!
                        </Text>
                        <Text color="gray.600">
                            This process may take a few minutes to complete. You can monitor the progress on the next screen.
                        </Text>
                    </ModalBody>
                    <ModalFooter justifyContent="center">
                        <Button
                            bg="#d5e73e"
                            color="black"
                            variant="solid"
                            onClick={handleSuccessClose}
                            _hover={{ bg: "#c4d535" }}
                            _active={{ bg: "#b3c42c" }}
                        >
                            View Progress
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>QA Planner</ModalHeader>
                <ModalBody>
                    <Text mb={4} color="gray.600">
                        Select the QA items you would like to extract:
                    </Text>
                    <VStack spacing={3} align="stretch">
                        {QA_OPTIONS.map((option) => (
                            <Checkbox
                                key={option.id}
                                isChecked={selectedOptions.includes(option.id)}
                                onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                                size="lg"
                                sx={{
                                    '.chakra-checkbox__control': {
                                        borderColor: '#B4B4B4',
                                        _checked: {
                                            bg: '#202A44',
                                            borderColor: '#202A44',
                                        },
                                        _hover: {
                                            borderColor: '#202A44',
                                            _checked: {
                                                bg: '#202A44',
                                                borderColor: '#202A44',
                                            }
                                        }
                                    }
                                }}
                            >
                                {option.label}
                            </Checkbox>
                        ))}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        bg="#d5e73e"
                        color="black"
                        variant="solid"
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        loadingText="Generating..."
                        isDisabled={selectedOptions.length === 0}
                        _hover={{ bg: "#c4d535" }}
                        _active={{ bg: "#b3c42c" }}
                        _disabled={{
                            bg: "#e5e5e5",
                            color: "#999999",
                            cursor: "not-allowed"
                        }}
                    >
                        Generate QA Planner
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default QAPlannerModal;
