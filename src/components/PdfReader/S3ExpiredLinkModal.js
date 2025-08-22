import React from "react";
import { ReactComponent as Error } from "../../assets/images/error.svg";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";

export const S3ExpiredLinkModal = ({ isOpen, onClose, onRefresh, message }) => {
  const handleRefresh = () => {
    onRefresh?.();
    onClose?.();
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      fade={false}
      toggle={handleClose}
      className="upload-doc-popup modal-lg"
    >
      <ModalHeader toggle={handleClose}>
        Document Link Error
      </ModalHeader>
      <ModalBody>
        <div className="error-upload">
          <div className="error-header">
            <Error />
            <h5>Link Expired</h5>
          </div>
          <p>
            {message || "The document link has expired and is no longer accessible. This usually happens when the document link has been inactive for too long or the session has timed out."}
          </p>
          <div className="button-container">
            <Button color="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button color="primary" onClick={handleRefresh}>
              Refresh Page
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};