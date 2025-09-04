import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import QAPlannerModal from '../index';

// Mock the toast hook
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => ({
    ...jest.requireActual('@chakra-ui/react'),
    useToast: () => mockToast,
}));

const renderWithChakra = (component) => {
    return render(
        <ChakraProvider>
            {component}
        </ChakraProvider>
    );
};

describe('QAPlannerModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all QA options as checkboxes', () => {
        renderWithChakra(
            <QAPlannerModal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        expect(screen.getByText('Inspections')).toBeInTheDocument();
        expect(screen.getByText('Mock-ups')).toBeInTheDocument();
        expect(screen.getByText('Pre-installation meetings')).toBeInTheDocument();
        expect(screen.getByText('Warranties')).toBeInTheDocument();
        expect(screen.getByText('Certificates')).toBeInTheDocument();
        expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('allows selecting multiple options', () => {
        renderWithChakra(
            <QAPlannerModal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        const inspectionsCheckbox = screen.getByLabelText('Inspections');
        const mockUpsCheckbox = screen.getByLabelText('Mock-ups');

        fireEvent.click(inspectionsCheckbox);
        fireEvent.click(mockUpsCheckbox);

        expect(inspectionsCheckbox).toBeChecked();
        expect(mockUpsCheckbox).toBeChecked();
    });

    it('shows warning toast when submitting without selection', () => {
        renderWithChakra(
            <QAPlannerModal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        const submitButton = screen.getByText('Generate QA Logs');
        fireEvent.click(submitButton);

        expect(mockToast).toHaveBeenCalledWith({
            title: 'No options selected',
            description: 'Please select at least one QA option to continue.',
            status: 'warning',
            duration: 3000,
            isClosable: true,
        });
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with selected options when submitting', () => {
        renderWithChakra(
            <QAPlannerModal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        const inspectionsCheckbox = screen.getByLabelText('Inspections');
        fireEvent.click(inspectionsCheckbox);

        const submitButton = screen.getByText('Generate QA Logs');
        fireEvent.click(submitButton);

        expect(mockOnSubmit).toHaveBeenCalledWith(['inspections']);
    });

    it('calls onClose when cancel button is clicked', () => {
        renderWithChakra(
            <QAPlannerModal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('resets selection when modal is closed', () => {
        const { rerender } = renderWithChakra(
            <QAPlannerModal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        const inspectionsCheckbox = screen.getByLabelText('Inspections');
        fireEvent.click(inspectionsCheckbox);
        expect(inspectionsCheckbox).toBeChecked();

        // Close modal
        rerender(
            <QAPlannerModal
                isOpen={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        // Reopen modal
        rerender(
            <QAPlannerModal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        const reopenedInspectionsCheckbox = screen.getByLabelText('Inspections');
        expect(reopenedInspectionsCheckbox).not.toBeChecked();
    });

    it('shows loading state when isLoading is true', () => {
        renderWithChakra(
            <QAPlannerModal
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
                isLoading={true}
            />
        );

        const submitButton = screen.getByText('Generate QA Logs');
        expect(submitButton).toHaveAttribute('disabled');
        expect(submitButton).toHaveTextContent('Generating...');
    });
});
