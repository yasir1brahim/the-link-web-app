import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

const Procore = ({
  procoreModal,
  toggleProcoreModal
}) => {

  return (
    <Modal
      isOpen={procoreModal}
      fade={false}
      toggle={toggleProcoreModal}
      className="new-user modal-md"
    >
      <ModalHeader toggle={toggleProcoreModal}>Procore Project Details</ModalHeader>
      <ModalBody>
        <div className="create-user-content">
          <div className="row">
            <div className="col-12">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  id="partnerCompany"
                  aria-describedby="partnerCompany"
                  placeholder="Enter"
                />
                <label className="text-label" htmlFor="partnerCompany">
                  Partner Company
                </label>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  id="projectName"
                  aria-describedby="projectName"
                  placeholder="Enter"
                />
                <label className="text-label" htmlFor="projectName">
                  Project Name
                </label>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  id="submittalManager"
                  aria-describedby="submittalManager"
                  placeholder="Enter"
                />
                <label className="text-label" htmlFor="submittalManager">
                  Submittal Manager
                </label>
              </div>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button color="secondary" onClick={toggleProcoreModal}>
            Cancel
          </Button>
          <Button color="primary" onClick={toggleProcoreModal}>
            Save
          </Button>{" "}
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
};

export default Procore;