import React from "react";
import { ReactComponent as Error } from "../../assets/images/error.svg";
import { Modal, ModalHeader, ModalBody } from "reactstrap";


export const ErrorModal = (props) => {
  const {    
    toggleModal,    
    errorModal,
    errorMessage
  } = props;


  return (
      <Modal
        isOpen={errorModal}
        fade={false}
        toggle={toggleModal}
        className="upload-doc-popup modal-sm"
      >
        <ModalHeader toggle={toggleModal}>Error</ModalHeader>
        <ModalBody>
          <div className="error-upload text-center">
            <Error />
            <p>{errorMessage}</p>            
          </div>
        </ModalBody>
      </Modal>
  );
};
