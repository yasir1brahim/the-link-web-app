import React from "react";
import { ReactComponent as Error } from "../../assets/images/error.svg";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

export const S3ExpiredLinkModal = ({ isOpen, onClose, onRefresh, message }) => {
  const handleRefresh = () => {
    onRefresh && onRefresh();
    onClose && onClose();
  };

  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      fade={false}
      toggle={handleClose}
      className="new-customer modal-lg"
      centered
    >
      <ModalHeader toggle={handleClose}>
        <div className="d-flex align-items-center">
          <Error style={{ marginRight: '10px', width: '20px', height: '20px' }} />
          Document Link Expired
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="text-center">
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#666', marginBottom: '10px' }}>
            {message || "The document link has expired and is no longer accessible."}
          </p>
          <p style={{ fontSize: '14px', color: '#888' }}>
            This usually happens when the document link has been inactive for too long.
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleClose} style={{ marginRight: '10px' }}>
          Close
        </Button>
        <Button color="primary" onClick={handleRefresh}>
          Refresh Page
        </Button>
      </ModalFooter>
    </Modal>
  );
}; 