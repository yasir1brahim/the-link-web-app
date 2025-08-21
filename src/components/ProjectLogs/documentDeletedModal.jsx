import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import {ReactComponent as DocumentLogo } from '../../assets/images/file-document.svg';

const DocumentDeletedModal = ({ isOpen, toggle }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={false} className="new-customer">
      <ModalHeader toggle={toggle}>Document Not Available</ModalHeader>
      <ModalBody>
        <div style={{ textAlign: 'center', padding: '15px' }}>
          <div className="document-delete-modal-heading">
            <div><DocumentLogo/></div>
            <h4>Document Deleted</h4>
          </div>
          <p style={{ color: '#666', lineHeight: '1.5' }}>
            At user's request, this document has been deleted. The document file is no longer available for viewing.
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