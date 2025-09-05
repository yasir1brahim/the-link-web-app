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
    useToast
} from '@chakra-ui/react';
import { getQAOptionsWithLabels } from '../../../utils/qaUtils';

const QA_OPTIONS = getQAOptionsWithLabels();

const QAPlannerModal = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
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
                                colorScheme="green"
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
