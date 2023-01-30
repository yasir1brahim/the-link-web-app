import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import React, { useState } from "react";
// import { Typeahead } from "react-bootstrap-typeahead";

const UpdateListing = (props) => {
  const isEmpExtTab =
    props.activeTab === "employees" || props.activeTab === "external";
  const modalData = isEmpExtTab ? props.projectData : props.employeeData;

  const [searchValue, setSearchValue] = useState("");

  const handleSelectEmp = (id) => {
    console.log("selectedEmp", props.selectedEmployeeList, id);
    if (props.selectedEmployeeList?.includes(id)) {
      let selectedEmp = props.selectedEmployeeList.filter(
        (empId) => empId !== id
      );
      props.setSelectedEmployeeList(selectedEmp);
    } else {
      props.setSelectedEmployeeList([...props.selectedEmployeeList, id]);
    }
  };

  return (
    <Modal
      isOpen={props.updateListModal}
      fade={false}
      toggle={props.toggleUpdateList}
      className="updatelist-admin modal-md"
    >
      <ModalHeader toggle={props.toggleUpdateList}>
        {isEmpExtTab ? "Projects" : "Employees"}
      </ModalHeader>
      <ModalBody>
        <form className="update-list-form">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              id="saveSelectionName"
              aria-describedby="saveSelectionName"
              placeholder="Enter"
              // required
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
            />
            <label
              className="text-label"
              style={{ textTransform: "capitalize" }}
              htmlFor="saveSelectionName"
            >
              {`Search ${isEmpExtTab ? "Project" : "Employee"} Values`}
            </label>
          </div>
          <div className="row">
            {modalData?.map((project, index) => {
              const projectName = isEmpExtTab
                ? project.project_name
                : project.full_name;
              return (
                projectName?.includes(searchValue) && (
                  <div className="col-6">
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        name="updateList"
                        id={`project-${index}`}
                        checked={props.selectedEmployeeList?.includes(
                          isEmpExtTab ? project.project_id : project.id
                        )}
                        onChange={() =>
                          handleSelectEmp(
                            isEmpExtTab ? project.project_id : project.id
                          )
                        }
                      />
                      <label
                        className="custom-control-label"
                        for={`project-${index}`}
                      >
                        {isEmpExtTab ? project.project_name : project.full_name}
                      </label>
                    </div>
                  </div>
                )
              );
            })}
          </div>
          {/* <div className="col-12">
            <div className="users-section">
              <div className="form-group">
                <Typeahead
                  multiple
                  value={props.selectedEmployeeList}
                  selected={props.selectedEmployeeList}
                  onChange={setSelectedEmployeeList}
                  // defaultSelected={props.selectedList}
                  options={optionsList}
                  placeholder="Add Employees"
                />
              </div>
            </div>
          </div> */}
          <ModalFooter>
            <Button color="secondary" onClick={props.toggleUpdateList}>
              Cancel
            </Button>
            <Button
              color="primary"
              type="button"
              onClick={props.handleUpdateList}
            >
              Save
            </Button>{" "}
          </ModalFooter>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default UpdateListing;
