import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const DocumentDeletedModal = ({ isOpen, toggle }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={false} className="new-customer">
      <ModalHeader toggle={toggle}>Document Not Available</ModalHeader>
      <ModalBody>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📄</div>
          <h5 style={{ marginBottom: '15px' }}>Document Deleted</h5>
          <p style={{ color: '#666', lineHeight: '1.5' }}>
            At user's request, this document has been deleted. The document file is no longer available for viewing.
          </p>
          <p style={{ color: '#666', lineHeight: '1.5', marginTop: '10px' }}>
            <strong>Note:</strong> All submittal logs and other related data have been preserved and remain accessible.
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DocumentDeletedModal; 