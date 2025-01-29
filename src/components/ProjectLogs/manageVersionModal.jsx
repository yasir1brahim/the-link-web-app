import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';

const ManageVersionModal = ({
    showVersionModal,
    toggleVersionModal,
    projectVersionIdToEdit,
    initialProjectVersionName,
    handleCreateProjectVersion,
    handleUpdateProjectVersion,
}) => {
    const [versionName, setVersionName] = useState(initialProjectVersionName);

    const handleSaveVersion = () => {
        if (projectVersionIdToEdit) {
            handleUpdateProjectVersion(projectVersionIdToEdit, versionName);
        } else {
            handleCreateProjectVersion(versionName);
        }
    }

  return (
    <Modal
      isOpen={showVersionModal}
      fade={false}
      toggle={toggleVersionModal}
      className="new-user modal-md"
    >
      <ModalHeader toggle={toggleVersionModal}>{projectVersionIdToEdit ? "Edit Version" : "Create Version"}</ModalHeader>
      <ModalBody>
        <Form>
            <FormGroup>
                <Label>Version Name</Label>
                <Input type="text" value={versionName} onChange={(e) => setVersionName(e.target.value)} />
            </FormGroup>
            <Button color="primary" className="mb-3" onClick={handleSaveVersion}>Save</Button>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default ManageVersionModal;