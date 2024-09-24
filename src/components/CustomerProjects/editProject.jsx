import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../config/axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DateSelector from "../shared/DateSelector/DateSelector";
import "react-bootstrap-typeahead/css/Typeahead.css";
import moment from "moment";
import handleError from "../../config/errorHandler";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { CircularProgress } from "@mui/material";
import { getUsersByTeam } from "../../api/Authentication/api";
import { updateProject } from "../../api/Projects/api";
import UserSelector from "./UserSelector";
const EditProject = ({
  modal,
  toggleModal,
  customer,
  project,
  pageRefresh,
  setPageRefresh,
  isAdminUser,
  customerID,
}) => {
  console.log("project", project)

  const typeaheadRef = useRef(null);
  const [projectName, setProjectName] = useState({ value: "", errors: "" });
  const [leadContact, setLeadContact] = useState({
    value: "",
    label: "",
    email: "",
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [fullEmployeeList, setFullEmployeeList] = useState([]);
  const [selectedStandardMembersList, setSelectedStandardMembersList] = useState([]);
  const [selectedAdminMembersList, setSelectedAdminMembersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!modal) {
      setProjectName({ value: "", errors: "" });
      setLeadContact({
        value: "",
        label: "",
        email: "",
      });
      typeaheadRef?.current?.clear();
      setStartDate("");
      setEndDate("");
      setFullEmployeeList([]);
      setSelectedStandardMembersList([]);
      setSelectedAdminMembersList([]);
    }
  }, [modal, typeaheadRef]);

  useEffect(() => {
    if (modal) {
      const preSelectEmployeesForProject = async () => {
        setIsLoading(true);
        // fetch employees for customer
        const resp_employees_by_customer = await getUsersByTeam(project?.team)
        const emps_by_c = resp_employees_by_customer.data.members
        if (emps_by_c) {
          setFullEmployeeList(emps_by_c);
        }
        const project_members = project?.members ? project.members : []

        setSelectedStandardMembersList(project_members.filter((member) => member.role === "project_member").map((member) => {
          return {
            value: member.user_id,
            label: member.display_name,
          }
        }))
        setSelectedAdminMembersList(project_members.filter((member) => member.role === "project_admin").map((member) => {
          return {
            value: member.user_id,
            label: member.display_name,
          }
        }))
        setIsLoading(false);
      };

      preSelectEmployeesForProject().catch(console.error);
    }
  }, [customer, modal, project]);

  const handleSubmit = async () => {
    let errors = false;
    if (!errors) {
      try {
        const response = await updateProject(
          project?.id,
          projectName.value || project?.project_name, 
          leadContact[0] ? leadContact[0].value : project?.owner, 
          selectedStandardMembersList.map((emp) => emp.value), 
          selectedAdminMembersList.map((emp) => emp.value), 
          startDate, 
          endDate
        )
        
        if (response.data) {
          console.log(response.data);
          setPageRefresh(!pageRefresh);
          toggleModal();
        }
      } catch (error) {
        handleError(error);
        toggleModal();
      }
    }
  };

  return (
    <>
      <div
        className={
          "create-new-lproject" +
          (modal ? " show-lproject-popup " : "") +
          (isAdminUser ? " edit-new-lproject " : "")
        }
      >
        <div className="lproject-backdrop"></div>
        <div className="lproject-content">
          <div className="lproject-header">
            <h5>Edit Project</h5>
            <span className="close" onClick={toggleModal}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.29289 6.29289C6.68342 5.90237 7.31658 5.90237 7.70711 6.29289L12 10.5858L16.2929 6.29289C16.6834 5.90237 17.3166 5.90237 17.7071 6.29289C18.0976 6.68342 18.0976 7.31658 17.7071 7.70711L13.4142 12L17.7071 16.2929C18.0976 16.6834 18.0976 17.3166 17.7071 17.7071C17.3166 18.0976 16.6834 18.0976 16.2929 17.7071L12 13.4142L7.70711 17.7071C7.31658 18.0976 6.68342 18.0976 6.29289 17.7071C5.90237 17.3166 5.90237 16.6834 6.29289 16.2929L10.5858 12L6.29289 7.70711C5.90237 7.31658 5.90237 6.68342 6.29289 6.29289Z"
                  fill="#0E2332"
                />
              </svg>
            </span>
          </div>
          <div className="lproject-body">
            <form className="create-project-form">
              <div className="customer-profile-details d-flex align-items-start justify-content-start flex-wrap">
                {!isAdminUser && (
                  <>
                    {/* <div className="customer-dp-container"><img src={WhitingTurner} alt="Company Logo" /></div> */}
                    {/* <div className="customer-profile">
                      <div className="row">
                        <div className="col-12">
                          <div className="text-label-value">
                            <div className="text-value">{customer?.customer_name}</div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="text-label-value">
                            <div className="text-label">{customer?.address}</div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="text-label-value">
                            <div className="text-label">{customer?.contact_number}</div>
                          </div>
                        </div>
                      </div>
                    </div> */}
                  </>
                )}
              </div>
              <div className="create-project-content">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    id="customerProjectName"
                    aria-describedby="customerProjectName"
                    placeholder="Enter"
                    defaultValue={project?.name}
                    onChange={(e) => {
                      setProjectName({
                        ...projectName,
                        value: e.target.value,
                      });
                    }}
                  />
                  <label className="text-label" htmlFor="customerProjectName">
                    Project Name
                  </label>
                </div>
                <div style={{ gap: "25px" }} className="d-flex">
                  <div className="form-group">
                    <div className={`has-typehead`}>
                      <Typeahead
                        id="employee-list"
                        ref={typeaheadRef}
                        options={fullEmployeeList.map((employee) => {
                          return {
                            value: employee.user_id,
                            label: employee.display_name,
                            email: employee.email,
                          };
                        })}
                        onChange={(e) => setLeadContact(e)}
                        selected={leadContact?.label}
                      />

                      <label className="text-label">{"Lead Contact"}</label>
                      <i className="has-icon icon-dropdown"></i>
                    </div>
                    {!leadContact[0]?.label ? (
                      <label className="text-label typehead-label">
                        {project?.owner?.display_name}
                      </label>
                    ) : null}
                  </div>
                </div>
                <div style={{ gap: "25px" }} className="d-flex">
                  <div className="form-group">
                    <DateSelector
                      isClearable={false}
                      placeholderText="Start Date"
                      labelText="Start Date"
                      onChange={setStartDate}
                      // selected={
                      //   project.start_date
                      //     ? moment(project.start_date, 'DD-MM-YYYY')
                      //     : null
                      // }
                      selected={
                        startDate
                          ? startDate
                          : project?.start_date
                          ? new Date((project?.start_date).replaceAll("-", "/"))
                          : ""
                      }
                    />
                  </div>
                  <div className="form-group">
                    <DateSelector
                      isClearable={false}
                      placeholderText="End Date"
                      labelText="End Date"
                      onChange={setEndDate}
                      // selected={
                      //   project.end_date
                      //     ? moment(project.end_date, 'DD-MM-YYYY')
                      //     : null
                      // }
                      selected={
                        endDate
                          ? endDate
                          : project?.end_date
                          ? new Date((project?.end_date).replaceAll("-", "/"))
                          : ""
                      }
                    />
                  </div>
                </div>
                <h6>Project Admins</h6>
                <UserSelector selectedUsers={selectedAdminMembersList} setSelectedUsers={setSelectedAdminMembersList} employeeList={fullEmployeeList} isLoading={isLoading} placeholderText={"Add Project Admins"} />

                <h6>Project Members</h6>
                <UserSelector selectedUsers={selectedStandardMembersList} setSelectedUsers={setSelectedStandardMembersList} employeeList={fullEmployeeList} isLoading={isLoading} placeholderText={"Add Project Members"} />
              </div>
              <div className="lproject-footer">
                <button
                  style={{ background: "#D5E73E", color: "#0E2332" }}
                  className="btn btn-primary"
                  type="button"
                  onClick={handleSubmit}
                >
                  Save
                </button>{" "}
                <button
                  style={{
                    border: "1px solid #D1D5DB",
                    color: "#36454F",
                    background: "white",
                  }}
                  className="btn btn-secondary"
                  type="button"
                  onClick={toggleModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default EditProject;
