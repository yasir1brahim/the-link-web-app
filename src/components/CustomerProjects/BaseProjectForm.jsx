import { ToastContainer } from "react-toastify";
import UserSelector from "./UserSelector";
import DateSelector from "../shared/DateSelector/DateSelector";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { Typeahead } from "react-bootstrap-typeahead";
import { CircularProgress } from "@mui/material";

const BaseProjectForm = ({
    project,
    setProjectName,
    projectName,
    fullEmployeeList,
    selectedAdminMembersList,
    setSelectedAdminMembersList,
    selectedStandardMembersList,
    setSelectedStandardMembersList,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    setLeadContact,
    leadContact,
    handleSubmit,
    formTitle,
    toggleModal,
    modal,
    isAdminUser,
    typeaheadRef,
    isLoading,
}) => {
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
                                options={fullEmployeeList}
                                placeholder="Select Lead Contact"
                                onChange={(e) => setLeadContact(e)}
                                selected={leadContact}
                                filterBy={["label"]} // Use only string fields for filtering
                                labelKey="label"
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
    )
}

export default BaseProjectForm;