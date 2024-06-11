import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

export const RestoreProjectModal = (props) => {
  const {
    modal,
    toggleModal,
    handleSubmit,
  } = props;
  return (
    <>
      <Modal
        isOpen={modal}
        fade={false}
        toggle={toggleModal}
        className="modal-lg"
      >
        <ModalHeader toggle={toggleModal}>Restore Project</ModalHeader>
        <ModalBody className="pb-0">
          {/* Upload form code */}
          <form>
            <div>
              Are you sure you want to restore this project?
            </div>
            <ModalFooter className="mt-3 float-right">
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={handleSubmit}
                className="submit-accent"
              >
                Restore
              </Button>{" "}
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
};
