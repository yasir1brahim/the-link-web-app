import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";

const Procore = ({
  procoreModal,
  toggleProcoreModal
}) => {
  const [partnerCompany, setPartnerCompany] = useState({});
  const [projectName, setProjectName] = useState({});
  const [submittalManager, setSubmittalManager] = useState({});

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
                {/* <input
                  type="text"
                  className="form-control"
                  id="partnerCompany"
                  aria-describedby="partnerCompany"
                  placeholder="Enter"
                /> */}
                <SelectDropdown 
                label={'Select Partner Company'}
                setSelected={setPartnerCompany}
                // value={leadContact.label}
                selected={partnerCompany?.label}
                options={[
                  {
                    label: 'TheLink-FE',
                    value: 'draft'
                  },
                ]}
                className="form-control" />
                {/* <label className="text-label" htmlFor="partnerCompany">
                  Partner Company
                </label> */}
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                {/* <input
                  type="text"
                  className="form-control"
                  id="projectName"
                  aria-describedby="projectName"
                  placeholder="Enter"
                /> */}
                <SelectDropdown 
                label={'Select Project Name'}
                setSelected={setProjectName}
                // value={leadContact.label}
                selected={projectName?.label}
                options={[
                  {
                    label: 'Sandbox Test Project',
                    value: 'draft'
                  },
                  {
                    label: 'Standard Project Template',
                    value: 'pending'
                  },
                ]}
                className="form-control" />
                {/* <label className="text-label" htmlFor="projectName">
                  Project Name
                </label> */}
              </div>
            </div>
            <div className="col-12">
              <div className="form-group log-datepicker">
                {/* <input
                  type="text"
                  className="form-control"
                  id="submittalManager"
                  aria-describedby="submittalManager"
                  placeholder="Enter"
                /> */}
                <SelectDropdown 
                label={'Select  Submittal Manager'}
                setSelected={setSubmittalManager}
                // value={leadContact.label}
                selected={submittalManager?.label}
                options={[
                  {
                    label: 'Test Architect',
                    value: 'draft'
                  },
                ]}
                className="form-control" />
                {/* <label className="text-label" htmlFor="submittalManager">
                  Submittal Manager
                </label> */}
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