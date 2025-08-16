import { ToastContainer } from "react-toastify";
import UserSelector from "./UserSelector";
import DateSelector from "../shared/DateSelector/DateSelector";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { PROJECT_TYPES } from "../../constants";
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";
import { Typeahead } from "react-bootstrap-typeahead";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from 'react';

const BaseProjectForm = ({
    setProjectName,
    projectName,
    setProjectNumber,
    projectNumber,
    projectType,
    setProjectType,
    fullEmployeeList,
    selectedAdminMembersList,
    setSelectedAdminMembersList,
    selectedStandardMembersList,
    setSelectedStandardMembersList,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleSubmit,
    formTitle,
    toggleModal,
    modal,
    typeaheadRef,
    isLoading
}) => {

    const [filteredEmployeeListForAdmins, setFilteredEmployeeListForAdmins] = useState([]);
    const [filteredEmployeeListForMembers, setFilteredEmployeeListForMembers] = useState([]);

    useEffect(() => {
        const selectedAdminValues = selectedAdminMembersList?.map(admin => admin.value) || [];
        const selectedMemberValues = selectedStandardMembersList?.map(member => member.value) || [];

        // Filter list for admin selection
        const availableForAdmin = fullEmployeeList.filter(employee => {
            const isNotAdmin = !selectedAdminValues.includes(employee.value);
            const isNotMember = !selectedMemberValues.includes(employee.value);
            return isNotAdmin && isNotMember;
        })
        .sort((a, b) => a.label.localeCompare(b.label));
        setFilteredEmployeeListForAdmins(availableForAdmin);

        // Filter list for member selection
        const availableForMember = fullEmployeeList.filter(employee => {
            const isNotAdmin = !selectedAdminValues.includes(employee.value);
            const isNotMember = !selectedMemberValues.includes(employee.value);
            return isNotAdmin && isNotMember;
        })
        .sort((a, b) => a.label.localeCompare(b.label));
        setFilteredEmployeeListForMembers(availableForMember);
    }, [fullEmployeeList, selectedAdminMembersList, selectedStandardMembersList]);


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
                    <h5>{formTitle}</h5>
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
                    
                        <div className="create-project-content">
                            <div style={{ gap: "25px" }} className="d-flex">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="customerProjectName"
                                        aria-describedby="customerProjectName"
                                        placeholder="Enter"
                                        defaultValue={projectName?.value}
                                        onChange={(e) => {
                                        setProjectName({
                                            ...projectName,
                                            value: e.target.value,
                                        });
                                        }}
                                    />
                                    <label className="text-label" htmlFor="customerProjectName">
                                        Project Name*
                                    </label>
                                    {projectName.errors && (
                                        <small className="form-error" style={{ color: "red" }}>
                                            {projectName.errors}
                                        </small>
                                    )}
                                </div>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="customerProjectNumber"
                                        aria-describedby="customerProjectNumber"
                                        placeholder="Enter"
                                        defaultValue={projectNumber?.value}
                                        onChange={(e) => {
                                        setProjectNumber({
                                            ...projectNumber,
                                            value: e.target.value,
                                        });
                                        }}
                                    />
                                    <label className="text-label" htmlFor="customerProjectNumber">
                                        Project Number*
                                    </label>
                                    {projectNumber.errors && (
                                        <small className="form-error" style={{ color: "red" }}>
                                            {projectNumber.errors}
                                        </small>
                                    )}
                                </div>
                            </div>
                            <div style={{ gap: "25px" }} className="d-flex">
                                <div className="form-group">
                                    <DateSelector
                                    isClearable={false}
                                    placeholderText="Start Date"
                                    labelText="Start Date"
                                    onChange={setStartDate}
                                    dateFormat="yyyy-MM-dd"
                                    selected={startDate}
                                    preventManualInput={true}
                                    />
                                </div>
                                <div className="form-group">
                                    <DateSelector
                                    isClearable={false}
                                    placeholderText="End Date"
                                    labelText="End Date"
                                    onChange={setEndDate}
                                    dateFormat="yyyy-MM-dd"
                                    selected={endDate}
                                    preventManualInput={true}
                                    />
                                </div>
                            </div>
                            <div style={{ gap: "25px" }} className="d-flex">
                                <div className="form-group">
                                    <SelectDropdown
                                    label={'Project Type'}
                                    setSelected={setProjectType}
                                    selected={projectType}
                                    defaultInputValue={projectType.value}
                                    options={PROJECT_TYPES.map((project_type) => {
                                        return {
                                            value: project_type?.name,
                                            label: project_type?.name,
                                        };
                                    })}
                                    className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                </div>
                            </div>
                            <h6>Project Admins</h6>
                                <UserSelector
                                    selectedUsers={selectedAdminMembersList}
                                    setSelectedUsers={setSelectedAdminMembersList}
                                    employeeList={filteredEmployeeListForAdmins}
                                    isLoading={isLoading}
                                    placeholderText="Add Project Admins"
                                />
                                
                                <h6>Project Members</h6>
                                <UserSelector
                                    selectedUsers={selectedStandardMembersList}
                                    setSelectedUsers={setSelectedStandardMembersList}
                                    employeeList={filteredEmployeeListForMembers}
                                    isLoading={isLoading}
                                    placeholderText="Add Project Members"
                                />
                        </div>
                        <div style={{ margin: "10px", fontSize: "14px", color: "#374151" }}>
                            * required field
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
    )
}

export default BaseProjectForm;