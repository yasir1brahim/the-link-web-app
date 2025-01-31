import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
const ArchiveConfirmationModal = ({ 
    showArchiveConfirmationModal, 
    toggleArchiveConfirmationModal, 
    onConfirmArchive,
    versionId,
    versionName
}) => {
    return (
        <Modal isOpen={showArchiveConfirmationModal} toggle={toggleArchiveConfirmationModal}>
            <ModalHeader>Archive Version</ModalHeader>
            <ModalBody>
                <p>Are you sure you want to archive {versionName}?</p>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={() => onConfirmArchive(versionId)}>Archive</Button>
                <Button color="secondary" onClick={toggleArchiveConfirmationModal}>Cancel</Button>
            </ModalFooter>
        </Modal>
    )
}

export default ArchiveConfirmationModal;