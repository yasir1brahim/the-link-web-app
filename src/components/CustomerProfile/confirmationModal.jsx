import React from 'react';
import { Button, Modal, ModalHeader, ModalFooter } from 'reactstrap';

export const ConfirmationModal = (props) => {
  return (
    <Modal
      isOpen={props.modal}
      fade={false}
      toggle={props.toggleModal}
      className="new-user modal-lg"
      style={{ maxWidth: '500px' }}
    >
      <ModalHeader toggle={props.toggleModal} style={{}}>
        Are you sure?
      </ModalHeader>
      <ModalFooter style={{ justifyContent: 'center' }}>
        <Button color="secondary" onClick={props.toggleModal}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={() => props.handleDeleteEmployee(props.membershipId)}
        >
          Delete
        </Button>{' '}
      </ModalFooter>
    </Modal>
  );
};
