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
import { getTeamDetails } from "../../api/Authentication/api";
import { addUsersToProject } from "../../api/Projects/api";
import UserSelector from "./UserSelector";
import BaseProjectForm from "./BaseProjectForm";

const AddUsersModal = ({
  modal,
  toggleModal,
  customer,
  project,
  pageRefresh,
  setPageRefresh,
}) => {
  console.log("project", project)

  const typeaheadRef = useRef(null);

  const [fullEmployeeList, setFullEmployeeList] = useState([]);
  const [selectedStandardMembersList, setSelectedStandardMembersList] = useState([]);
  const [filteredEmployeeListForMembers, setFilteredEmployeeListForMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!modal) {
      setFullEmployeeList([]);
      setSelectedStandardMembersList([]);
    }
  }, [modal, project, typeaheadRef]);


  useEffect(() => {
    if (modal) {
      const preSelectEmployeesForProject = async () => {
        setIsLoading(true);
        // fetch employees for customer
        const resp_employees_by_customer = await getTeamDetails(project?.team)
        console.log("resp_employees_by_customer", resp_employees_by_customer)
        const emps_by_c = resp_employees_by_customer.data.members
        if (emps_by_c) {
          setFullEmployeeList(emps_by_c.map((emp) => ({
            value: emp.user_id ?? "",
            label: emp.display_name ?? "",
          })));
        }
        setIsLoading(false);
      };
      preSelectEmployeesForProject().catch(console.error);
    }
  }, [customer, modal, project]);

  useEffect(() => {
    console.log("fullEmployeeList", fullEmployeeList)
    const selectedMemberValues = selectedStandardMembersList?.map(member => member.value) || [];
    const project_members = project?.members ? project.members.map(member => member.user_id) : []

    // Filter list for member selection
    const availableForMember = fullEmployeeList.filter(employee => {
        const isNotAlreadyInProject = !project_members.includes(employee.value);
        const isNotSelected = !selectedMemberValues.includes(employee.value);
        return isNotAlreadyInProject && isNotSelected;
    })
    .sort((a, b) => a.label.localeCompare(b.label));
    setFilteredEmployeeListForMembers(availableForMember);
  }, [fullEmployeeList, selectedStandardMembersList]);

  const handleSubmit = async () => {
    try {
        const response = await addUsersToProject(
            project?.id,
            selectedStandardMembersList.map((emp) => emp.value), 
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
  };

  return (
    <>
        <div
            className={
            "create-new-lproject" +
            (modal ? " show-lproject-popup " : "")
            }
        >
            <div className="lproject-backdrop"></div>
            <div className="lproject-content">
            <div className="lproject-header">
                <h5>Add Users to Project: {project?.name}</h5>
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
                    <h5>Users in Project</h5>
                    {project?.members?.map((member) => (
                        <div key={member.user_id}>{member.display_name}</div>
                    ))}
                    <hr/>
                    <div className="create-project-content">
                        <h5>Users to Add</h5>
                        <UserSelector
                            selectedUsers={selectedStandardMembersList}
                            setSelectedUsers={setSelectedStandardMembersList}
                            employeeList={filteredEmployeeListForMembers}
                            isLoading={isLoading}
                            placeholderText="Add Project Members"
                        />
                    </div>
                    <div className="lproject-footer">
                        <button
                        style={{ background: "#D5E73E", color: "#0E2332" }}
                        className="btn btn-primary"
                        type="button"
                        onClick={handleSubmit}
                        >
                        Add Users
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

export default AddUsersModal;
