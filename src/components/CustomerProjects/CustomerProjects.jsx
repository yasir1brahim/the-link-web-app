import React, { useEffect, useState } from "react";
import Loader from "../shared/Loader/Loader";
// import WhitingTurner from '../../assets/images/whiting-turner.svg';
// import { ReactComponent as AddUser } from '../../assets/images/circle-add.svg';
// import ProfilePhoto from '../../assets/images/dummy-profile.svg';
// import { ReactComponent as Camera } from '../../assets/images/camera.svg';
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
// import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
// import DateSelector from '../shared/DateSelector/DateSelector';
import PaginatedItems from "../shared/Pagination/Pagination";
import axiosInstance from "../../config/axios";
import { useLocation } from "react-router-dom";
import CreateProject from "./createProject";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditProject from "./editProject";
import CreateEmployee from "../CustomerProfile/createEmployee";
import moment from "moment";
import handleError from "../../config/errorHandler";
import { ArchiveIcon } from "../shared/icons/archiveIcon";
import { EditIcon } from "../shared/icons/editIcon";
import { UploadIcon } from "../shared/icons/uploadIcon";
import { LaunchIcon } from "../shared/icons/launchIcon";
import { ArchiveProjectModal } from "../PersonalProject/archiveProjectModal";
import { Tooltip } from "reactstrap";
import { RestoreProjectModal } from "../PersonalProject/restoreProjectModal";
import { RestoreIcon } from "../shared/icons/restoreIcon";

const CustomerProjects = ({
  toggleSlider,
  slider,
  customerData,
  setCustomerData,
  pageRefresh,
  setPageRefresh,
  toggleCreateProjectModal,
  createProjectModal,
  archiveProjectModal,
  toggleArchiveProjectModal,
  restoreProjectModal,
  toggleRestoreProjectModal,
  projectData,
  setProjectData,
  handleLaunch,
  isArchived,
  toggleArchive,
  customerId,
  toggleUploadSpecsModal,
  setSpecUploadProject,
  toggleUploadSpecsButton,
}) => {
  const [employeeModal, setEmployeeModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const toggleEditModal = () => setEditModal(!editModal);
  const toggleEmployeeModal = () => setEmployeeModal(!employeeModal);
  const [archiveProject, setArchiveProject] = useState(null);
  const [restoreProject, setRestoreProject] = useState(null);
  const [launchTooltip, setLaunchTooltip] = useState(null);
  const [uploadTooltip, setUploadTooltip] = useState(null);
  const [editTooltip, setEditTooltip] = useState(null);
  const [archiveTooltip, setArchiveTooltip] = useState(null);
  const [restoreTooltip, setRestoreTooltip] = useState(null);
  const [project, setProject] = useState({});
  const [currentItems, setCurrentItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setLoading] = useState(false);
  const { state } = useLocation();
  // const customer = state;
  const roleId = localStorage.getItem("roleId");

  useEffect(() => {
    const custId = customerId || state?.customer_id;
    if (roleId !== "6" && roleId !== "7") {
      const fetchData = async () => {
        setLoading(true);
        const response = await axiosInstance({
          method: "get",
          url: custId
            ? `/customer/${custId}`
            : `/customer/${localStorage.getItem("userId")}`,
        });
        setLoading(false);
        setCustomerData(response.data.message[0]);
        console.log(response.data.message);
      };

      fetchData().catch((error) => {
        handleError(error);
      });
    }
  }, [state, pageRefresh, setCustomerData, roleId, customerId]);

  const handleEdit = (project) => {
    setProject(project);
    toggleEditModal();
  };

  const getEmployeeList = async (project) => {
    try {
      const response = await axiosInstance({
        method: "get",
        url: `/employeeList/${
          project?.customer_id
        }`,
      });
      if (response.data.message) {
        return(response.data.message);
      }
    } catch (error) {
      return null;
    }
  }

  const handleArchiveProject = async () => {
    let errors = false;
    if (!errors) {
      try {
        const employeeList = await getEmployeeList(archiveProject);
        const response = await axiosInstance({
          method: "put",
          url: "/updateProject",
          data: {
            project_name: archiveProject.project_name,
            lead_contact: employeeList.find(
              (employee) => employee.name === archiveProject.lead_contact,
            )?.emp_id,
            start_date: archiveProject?.start_date
              ? moment(
                  new Date((archiveProject?.start_date).replaceAll("-", "/")),
                ).format("YYYY-MM-DD")
              : "",
            end_date: archiveProject?.end_date
              ? moment(
                  new Date((archiveProject?.end_date).replaceAll("-", "/")),
                ).format("YYYY-MM-DD")
              : "",
            customer_id:
              localStorage.getItem("roleId") === "0"
                ? customerId || state.customer_id
                : localStorage.getItem("userId"),
            status: isArchived ? "Active" : "Archived",
            project_id: archiveProject.project_id,
          },
        });
        if (response.data) {
          console.log(response.data);
          setPageRefresh(!pageRefresh);
          toggleArchiveProjectModal();
        }
      } catch (error) {
        console.log(error.message);
        handleError(error);
      }
    }
  };

  const handleRestoreProject = async () => {
    let errors = false;
    if (!errors) {
      try {
        const employeeList = await getEmployeeList(restoreProject);
        const response = await axiosInstance({
          method: "put",
          url: "/updateProject",
          data: {
            project_name: restoreProject.project_name,
            lead_contact: employeeList.find(
              (employee) => employee.name === restoreProject.lead_contact,
            )?.emp_id,
            employee_list: employeeList,
            start_date: restoreProject?.start_date
              ? moment(
                  new Date((restoreProject?.start_date).replaceAll("-", "/")),
                ).format("YYYY-MM-DD")
              : "",
            end_date: restoreProject?.end_date
              ? moment(
                  new Date((restoreProject?.end_date).replaceAll("-", "/")),
                ).format("YYYY-MM-DD")
              : "",
            customer_id:
              localStorage.getItem("roleId") === "0"
                ? customerId || state.customer_id
                : localStorage.getItem("userId"),
            status: "Open",
            project_id: restoreProject.project_id,
          },
        });
        if (response.data) {
          console.log(response.data);
          setPageRefresh(!pageRefresh);
          toggleRestoreProjectModal();
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  const generateInitials = (name) => {
    // Split the name into words
    const words = name.split(" ");

    const initials = words
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2);

    return initials.toUpperCase();
  }
  console.log("currentItems+++++", currentItems);
  return (
    <>
      <div className="customer-projects-content">
        <div className="customer-project-details">
          {/* when there are Zero Users */}
          {/* <a className='noprojects-wrapper d-flex align-items-center justify-content-center w-100' href='javascript:void(0);'>
                            <span className='d-flex align-items-center justify-content-center'><AddUser /> Create Users/Employees, then Add a Project</span>
                        </a> */}
          <div className="table-top-content">
            <div className="table-heading">
              <label className="table-entries">
                Showing entries:{" "}
                <span className="showing-strong">{currentItems.length}</span>
              </label>
            </div>

            <div className="grid-list-toggle">
              <div
                className="table-bulk-changes"
                style={{ marginRight: "30px" }}
              >
                {roleId !== "6" && roleId !== "7" && (
                  <div style={{ marginLeft: "10px" }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm  add-employe"
                      onClick={toggleEmployeeModal}
                    >
                      + Add Employee
                    </button>
                  </div>
                )}

                {/* {roleId !== '6' && roleId !== '7' && (
                  <button
                    onClick={() => toggleArchive(!isArchived)}
                    type="button"
                    className="btn btn-secondary btn-sm"
                  >
                    {isArchived ? 'View Active' : 'View Archived'}
                  </button>
                )} */}
              </div>

              <div className="icons-wrapper">
                <div
                  onClick={() => toggleSlider(!slider)}
                  className={`left-icon ${
                    slider ? "active-left-icon" : "not-active"
                  }`}
                >
                  <span className="">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.5833 1.75H14.5602H14.5602C14.153 1.74999 13.8131 1.74999 13.5335 1.76749C13.2426 1.78569 12.9673 1.8249 12.698 1.92626C11.9568 2.20521 11.3719 2.79015 11.0929 3.53131C10.9916 3.80062 10.9524 4.07595 10.9342 4.36681C10.9167 4.6464 10.9167 4.98635 10.9167 5.39356V5.41667V5.43978C10.9167 5.84698 10.9167 6.18694 10.9342 6.46653C10.9524 6.75738 10.9916 7.03271 11.0929 7.30202C11.3719 8.04319 11.9568 8.62812 12.698 8.90708C12.9673 9.00844 13.2426 9.04764 13.5335 9.06585C13.8131 9.08335 14.153 9.08334 14.5602 9.08333H14.5833H14.6064C15.0136 9.08334 15.3536 9.08335 15.6332 9.06585C15.9241 9.04764 16.1994 9.00844 16.4687 8.90708C17.2099 8.62812 17.7948 8.04319 18.0737 7.30202C18.1751 7.03271 18.2143 6.75738 18.2325 6.46653C18.25 6.18698 18.25 5.84708 18.25 5.43996V5.4399V5.43983V5.43976V5.41667V5.39357V5.3935V5.39344V5.39337C18.25 4.98625 18.25 4.64636 18.2325 4.36681C18.2143 4.07595 18.1751 3.80062 18.0737 3.53131C17.7948 2.79015 17.2099 2.20521 16.4687 1.92626C16.1994 1.8249 15.9241 1.78569 15.6332 1.76749C15.3536 1.74999 15.0137 1.74999 14.6065 1.75H14.6064H14.5833ZM13.2264 3.33012C13.2976 3.30329 13.406 3.2784 13.6272 3.26456C13.8543 3.25034 14.1471 3.25 14.5833 3.25C15.0196 3.25 15.3124 3.25034 15.5395 3.26456C15.7606 3.2784 15.869 3.30329 15.9403 3.33012C16.2772 3.45692 16.5431 3.72279 16.6699 4.05969C16.6967 4.13097 16.7216 4.23936 16.7354 4.46051C16.7497 4.68765 16.75 4.98042 16.75 5.41667C16.75 5.85292 16.7497 6.14568 16.7354 6.37282C16.7216 6.59397 16.6967 6.70237 16.6699 6.77365C16.5431 7.11054 16.2772 7.37642 15.9403 7.50322C15.869 7.53004 15.7606 7.55493 15.5395 7.56878C15.3124 7.58299 15.0196 7.58333 14.5833 7.58333C14.1471 7.58333 13.8543 7.58299 13.6272 7.56878C13.406 7.55493 13.2976 7.53004 13.2264 7.50322C12.8895 7.37642 12.6236 7.11054 12.4968 6.77365C12.47 6.70237 12.4451 6.59397 12.4312 6.37282C12.417 6.14568 12.4167 5.85292 12.4167 5.41667C12.4167 4.98042 12.417 4.68765 12.4312 4.46051C12.4451 4.23936 12.47 4.13097 12.4968 4.05969C12.6236 3.72279 12.8895 3.45692 13.2264 3.33012ZM5.41667 1.75H5.39356H5.39351C4.98633 1.74999 4.64639 1.74999 4.36681 1.76749C4.07595 1.78569 3.80062 1.8249 3.53131 1.92626C2.79015 2.20522 2.20522 2.79015 1.92626 3.53131C1.8249 3.80062 1.78569 4.07595 1.76749 4.36681C1.74999 4.64639 1.75 4.98632 1.75 5.3935V5.39356V5.41667V5.43978V5.43984C1.75 5.84701 1.74999 6.18695 1.76749 6.46653C1.78569 6.75738 1.8249 7.03271 1.92626 7.30202C2.20522 8.04319 2.79015 8.62812 3.53131 8.90708C3.80062 9.00844 4.07595 9.04764 4.36681 9.06585C4.6464 9.08335 4.98635 9.08334 5.39356 9.08333H5.39356H5.39357H5.39357H5.41667H5.43977H5.43977H5.43978H5.43978C5.84698 9.08334 6.18694 9.08335 6.46653 9.06585C6.75738 9.04764 7.03271 9.00844 7.30202 8.90708C8.04319 8.62812 8.62812 8.04319 8.90708 7.30202C9.00844 7.03271 9.04764 6.75738 9.06585 6.46653C9.08335 6.18694 9.08334 5.84698 9.08334 5.43978V5.43978V5.43977V5.43977V5.41667V5.39357V5.39357V5.39356V5.39356C9.08334 4.98635 9.08335 4.6464 9.06585 4.36681C9.04764 4.07595 9.00844 3.80062 8.90708 3.53131C8.62812 2.79015 8.04319 2.20522 7.30202 1.92626C7.03271 1.8249 6.75738 1.78569 6.46653 1.76749C6.18695 1.74999 5.84701 1.74999 5.43982 1.75H5.43978H5.41667ZM4.05969 3.33012C4.13097 3.30329 4.23936 3.2784 4.46051 3.26456C4.68765 3.25034 4.98042 3.25 5.41667 3.25C5.85292 3.25 6.14568 3.25034 6.37282 3.26456C6.59398 3.2784 6.70237 3.30329 6.77365 3.33012C7.11054 3.45692 7.37642 3.72279 7.50322 4.05969C7.53005 4.13097 7.55493 4.23936 7.56878 4.46051C7.58299 4.68765 7.58334 4.98042 7.58334 5.41667C7.58334 5.85292 7.58299 6.14568 7.56878 6.37282C7.55493 6.59398 7.53005 6.70237 7.50322 6.77365C7.37642 7.11054 7.11054 7.37642 6.77365 7.50322C6.70237 7.53005 6.59398 7.55493 6.37282 7.56878C6.14568 7.58299 5.85292 7.58333 5.41667 7.58333C4.98042 7.58333 4.68765 7.58299 4.46051 7.56878C4.23936 7.55493 4.13097 7.53005 4.05969 7.50322C3.7228 7.37642 3.45692 7.11054 3.33012 6.77365C3.30329 6.70237 3.2784 6.59398 3.26456 6.37282C3.25034 6.14568 3.25 5.85292 3.25 5.41667C3.25 4.98042 3.25034 4.68765 3.26456 4.46051C3.2784 4.23936 3.30329 4.13097 3.33012 4.05969C3.45692 3.72279 3.7228 3.45692 4.05969 3.33012ZM5.39356 10.9167H5.41667H5.43978C5.84698 10.9167 6.18694 10.9167 6.46653 10.9342C6.75738 10.9524 7.03271 10.9916 7.30202 11.0929C8.04319 11.3719 8.62812 11.9568 8.90708 12.698C9.00844 12.9673 9.04764 13.2426 9.06585 13.5335C9.08335 13.8131 9.08334 14.153 9.08333 14.5602V14.5833V14.6064C9.08334 15.0136 9.08335 15.3536 9.06585 15.6332C9.04764 15.924 9.00844 16.1994 8.90708 16.4687C8.62812 17.2099 8.04319 17.7948 7.30202 18.0737C7.03271 18.1751 6.75738 18.2143 6.46653 18.2325C6.18693 18.25 5.84697 18.25 5.43976 18.25H5.41667H5.39357C4.98636 18.25 4.6464 18.25 4.36681 18.2325C4.07595 18.2143 3.80062 18.1751 3.53131 18.0737C2.79015 17.7948 2.20521 17.2099 1.92626 16.4687C1.8249 16.1994 1.78569 15.924 1.76749 15.6332C1.74999 15.3536 1.74999 15.0137 1.75 14.6065V14.6064V14.5833V14.5602V14.5602C1.74999 14.153 1.74999 13.8131 1.76749 13.5335C1.78569 13.2426 1.8249 12.9673 1.92626 12.698C2.20521 11.9568 2.79015 11.3719 3.53131 11.0929C3.80062 10.9916 4.07595 10.9524 4.36681 10.9342C4.6464 10.9167 4.98635 10.9167 5.39356 10.9167ZM4.46051 12.4312C4.23936 12.4451 4.13097 12.47 4.05969 12.4968C3.72279 12.6236 3.45692 12.8895 3.33012 13.2264C3.30329 13.2976 3.2784 13.406 3.26456 13.6272C3.25034 13.8543 3.25 14.1471 3.25 14.5833C3.25 15.0196 3.25034 15.3123 3.26456 15.5395C3.2784 15.7606 3.30329 15.869 3.33012 15.9403C3.45692 16.2772 3.72279 16.5431 4.05969 16.6699C4.13097 16.6967 4.23936 16.7216 4.46051 16.7354C4.68765 16.7497 4.98042 16.75 5.41667 16.75C5.85292 16.75 6.14568 16.7497 6.37282 16.7354C6.59397 16.7216 6.70237 16.6967 6.77365 16.6699C7.11054 16.5431 7.37642 16.2772 7.50322 15.9403C7.53004 15.869 7.55493 15.7606 7.56878 15.5395C7.58299 15.3123 7.58333 15.0196 7.58333 14.5833C7.58333 14.1471 7.58299 13.8543 7.56878 13.6272C7.55493 13.406 7.53004 13.2976 7.50322 13.2264C7.37642 12.8895 7.11054 12.6236 6.77365 12.4968C6.70237 12.47 6.59397 12.4451 6.37282 12.4312C6.14568 12.417 5.85292 12.4167 5.41667 12.4167C4.98042 12.4167 4.68765 12.417 4.46051 12.4312ZM14.5833 10.9167H14.5602C14.153 10.9167 13.8131 10.9167 13.5335 10.9342C13.2426 10.9524 12.9673 10.9916 12.698 11.0929C11.9568 11.3719 11.3719 11.9568 11.0929 12.698C10.9916 12.9673 10.9524 13.2426 10.9342 13.5335C10.9167 13.8131 10.9167 14.153 10.9167 14.5602V14.5833V14.6064C10.9167 15.0137 10.9167 15.3536 10.9342 15.6332C10.9524 15.9241 10.9916 16.1994 11.0929 16.4687C11.3719 17.2099 11.9568 17.7948 12.698 18.0737C12.9673 18.1751 13.2426 18.2143 13.5335 18.2325C13.8131 18.25 14.153 18.25 14.5602 18.25H14.5602H14.5833H14.6064H14.6065C15.0137 18.25 15.3536 18.25 15.6332 18.2325C15.9241 18.2143 16.1994 18.1751 16.4687 18.0737C17.2099 17.7948 17.7948 17.2099 18.0737 16.4687C18.1751 16.1994 18.2143 15.9241 18.2325 15.6332C18.25 15.3536 18.25 15.0137 18.25 14.6065V14.6064V14.5833V14.5602V14.5602C18.25 14.153 18.25 13.8131 18.2325 13.5335C18.2143 13.2426 18.1751 12.9673 18.0737 12.698C17.7948 11.9568 17.2099 11.3719 16.4687 11.0929C16.1994 10.9916 15.9241 10.9524 15.6332 10.9342C15.3536 10.9167 15.0137 10.9167 14.6064 10.9167H14.5833ZM13.2264 12.4968C13.2976 12.47 13.406 12.4451 13.6272 12.4312C13.8543 12.417 14.1471 12.4167 14.5833 12.4167C15.0196 12.4167 15.3124 12.417 15.5395 12.4312C15.7606 12.4451 15.869 12.47 15.9403 12.4968C16.2772 12.6236 16.5431 12.8895 16.6699 13.2264C16.6967 13.2976 16.7216 13.406 16.7354 13.6272C16.7497 13.8543 16.75 14.1471 16.75 14.5833C16.75 15.0196 16.7497 15.3123 16.7354 15.5395C16.7216 15.7606 16.6967 15.869 16.6699 15.9403C16.5431 16.2772 16.2772 16.5431 15.9403 16.6699C15.869 16.6967 15.7606 16.7216 15.5395 16.7354C15.3124 16.7497 15.0196 16.75 14.5833 16.75C14.1471 16.75 13.8543 16.7497 13.6272 16.7354C13.406 16.7216 13.2976 16.6967 13.2264 16.6699C12.8895 16.5431 12.6236 16.2772 12.4968 15.9403C12.47 15.869 12.4451 15.7606 12.4312 15.5395C12.417 15.3123 12.4167 15.0196 12.4167 14.5833C12.4167 14.1471 12.417 13.8543 12.4312 13.6272C12.4451 13.406 12.47 13.2976 12.4968 13.2264C12.6236 12.8895 12.8895 12.6236 13.2264 12.4968Z"
                        fill={`${slider ? "white" : "#0E2332"}`}
                      />
                    </svg>
                  </span>
                </div>
                <div
                  onClick={() => toggleSlider(!slider)}
                  className={`right-icon ${
                    !slider ? "right-active" : "not-active"
                  }`}
                >
                  <span className="">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.33337 2.58325C2.91916 2.58325 2.58337 2.91904 2.58337 3.33325C2.58337 3.74747 2.91916 4.08325 3.33337 4.08325L16.6667 4.08325C17.0809 4.08325 17.4167 3.74747 17.4167 3.33325C17.4167 2.91904 17.0809 2.58325 16.6667 2.58325L3.33337 2.58325ZM2.58337 7.49992C2.58337 7.08571 2.91916 6.74992 3.33337 6.74992L16.6667 6.74992C17.0809 6.74992 17.4167 7.08571 17.4167 7.49992C17.4167 7.91414 17.0809 8.24992 16.6667 8.24992L3.33337 8.24992C2.91916 8.24992 2.58337 7.91413 2.58337 7.49992ZM3.33337 10.9166C2.91916 10.9166 2.58337 11.2524 2.58337 11.6666C2.58337 12.0808 2.91916 12.4166 3.33337 12.4166L16.6667 12.4166C17.0809 12.4166 17.4167 12.0808 17.4167 11.6666C17.4167 11.2524 17.0809 10.9166 16.6667 10.9166L3.33337 10.9166ZM3.33337 15.0833C2.91916 15.0833 2.58337 15.419 2.58337 15.8333C2.58337 16.2475 2.91916 16.5833 3.33337 16.5833L16.6667 16.5833C17.0809 16.5833 17.4167 16.2475 17.4167 15.8333C17.4167 15.419 17.0809 15.0833 16.6667 15.0833L3.33337 15.0833Z"
                        fill={`${!slider ? "white" : "#0E2332"}`}
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="l-table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {/* <th className="ticket-checkbox">
                        <div className="form-group">
                          <div className="custom-control custom-checkbox">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              name="ticketHeading"
                              id="ticketHeading"
                            />
                            <label
                              className="custom-control-label"
                              for="ticketHeading"
                            ></label>
                          </div>
                        </div>
                      </th> */}
                  <th>
                    <span>
                      Existing Projects <i className=""></i>
                    </span>
                  </th>
                  <th>
                    <span>
                      Status<i className="sort-d"></i>
                    </span>
                  </th>
                  <th>
                    <span>
                      Lead Contact<i className="sort-i"></i>
                    </span>
                  </th>
                  <th>
                    <span>
                      Users<i className="sort-i"></i>
                    </span>
                  </th>
                  <th>
                    <span>
                      Start Date<i className="sort-d"></i>
                    </span>
                  </th>
                  <th>
                    <span>
                      End Date<i className="sort-d"></i>
                    </span>
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              {project ? (
                <tbody>
                  {currentItems.map((project, index) => {
                    return (
                      <tr key={index}>
                        {/* <td className="ticket-checkbox">
                              <div className="form-group">
                                <div className="custom-control custom-checkbox">
                                  <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="ticketRow1"
                                    id="ticketRow1"
                                  />
                                  <label
                                    className="custom-control-label"
                                    for="ticketRow1"
                                  ></label>
                                </div>
                              </div>
                            </td> */}
                        <td>{project.project_name}</td>
                        <td>
                          {" "}
                          <div
                            className={`content-wrapper-secondary ${
                              project.status === "Open" 
                                ? "open-theme"
                                : "complete-theme"
                            }`}
                          >
                            <span className="">
                              {project.status === "Open" ? (
                                <svg
                                  width="6"
                                  height="6"
                                  viewBox="0 0 6 6"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle cx="3" cy="3" r="3" fill="#3B82F6" />
                                </svg>
                              ) : (
                                <svg
                                  width="7"
                                  height="6"
                                  viewBox="0 0 7 6"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="3.33334"
                                    cy="3"
                                    r="3"
                                    fill="#DC2626"
                                  />
                                </svg>
                              )}
                            </span>
                            <p className="content">{project.status}</p>
                          </div>{" "}
                        </td>
                        <td>
                          {!!project.lead_contact ? (
                            <div className="icon-wrap">
                              <div className="icon">
                                <p className="content">
                                  {generateInitials(project.lead_contact)}
                                </p>
                              </div>
                              <p className="content">{project.lead_contact}</p>
                            </div>
                          ) : (
                            ""
                          )}
                        </td>
                        <td>{project.users}</td>
                        <td>{project.start_date}</td>
                        <td>{project.end_date}</td>
                        <td>
                          <div className="action-wrapper">
                            <span
                              onClick={() => handleLaunch(project)}
                              id={"launch-tooltip" + index + 1}
                            >
                              <LaunchIcon />
                            </span>
                            <span>
                              <Tooltip
                                placement="left"
                                target={"launch-tooltip" + index + 1}
                                isOpen={launchTooltip === index + 1}
                                toggle={() =>
                                  setLaunchTooltip(
                                    launchTooltip
                                      ? launchTooltip === index + 1
                                        ? null
                                        : index + 1
                                      : index + 1,
                                  )
                                }
                              >
                                Launch Project
                              </Tooltip>
                            </span>
                            {toggleUploadSpecsButton ? (
                              project.status !== "Archived" && <>
                                <span
                                  onClick={() => {
                                    toggleUploadSpecsModal();
                                    setSpecUploadProject(project);
                                  }}
                                  style={{ cursor: "pointer" }}
                                  id={"upload-tooltip" + index + 1}
                                >
                                  <UploadIcon />
                                </span>
                                <span>
                                  <Tooltip
                                    placement="left"
                                    target={"upload-tooltip" + index + 1}
                                    isOpen={uploadTooltip === index + 1}
                                    toggle={() =>
                                      setUploadTooltip(
                                        uploadTooltip
                                          ? uploadTooltip === index + 1
                                            ? null
                                            : index + 1
                                          : index + 1,
                                      )
                                    }
                                  >
                                    Upload Document
                                  </Tooltip>
                                </span>
                              </>
                            ) : null}
                            {roleId !== "6" && roleId !== "7" && (
                              project.status === "Archived" ? (
                                <>
                                  <span
                                    onClick={() => {
                                      toggleRestoreProjectModal()
                                      setRestoreProject(project)
                                    }}
                                    style={{ cursor: "pointer" }}
                                    id={"restore-tooltip" + index + 1}
                                  >
                                    <RestoreIcon />
                                  </span>
                                  <span>
                                    <Tooltip
                                      placement="left"
                                      target={"restore-tooltip" + index + 1}
                                      isOpen={restoreTooltip === index + 1}
                                      toggle={() =>
                                        setRestoreTooltip(
                                          restoreTooltip
                                            ? restoreTooltip === index + 1
                                              ? null
                                              : index + 1
                                            : index + 1,
                                        )
                                      }
                                    >
                                      Restore Project
                                    </Tooltip>
                                  </span>
                                </>
                              ) :
                              <>
                                <span
                                  onClick={() => handleEdit(project)}
                                  id={"edit-tooltip" + index + 1}
                                >
                                  <EditIcon />
                                </span>
                                <span>
                                  <Tooltip
                                    placement="left"
                                    target={"edit-tooltip" + index + 1}
                                    isOpen={editTooltip === index + 1}
                                    toggle={() =>
                                      setEditTooltip(
                                        editTooltip
                                          ? editTooltip === index + 1
                                            ? null
                                            : index + 1
                                          : index + 1,
                                      )
                                    }
                                  >
                                    Edit Project
                                  </Tooltip>
                                </span>
                                <span
                                  onClick={() => {
                                    toggleArchiveProjectModal()
                                    setArchiveProject(project)
                                  }}
                                  id={"archive-tooltip" + index + 1}
                                >
                                  <ArchiveIcon />
                                </span>
                                <span>
                                  <Tooltip
                                    placement="left"
                                    target={"archive-tooltip" + index + 1}
                                    isOpen={archiveTooltip === index + 1}
                                    toggle={() =>
                                      setArchiveTooltip(
                                        archiveTooltip
                                          ? archiveTooltip === index + 1
                                            ? null
                                            : index + 1
                                          : index + 1,
                                      )
                                    }
                                  >
                                    Archive Project
                                  </Tooltip>
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td className="text-center" colSpan={7}>
                      No data
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
          <div className="table-footer-content">
            <PaginatedItems
              items={projectData}
              setCurrentItems={setCurrentItems}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
            />
          </div>
          <CreateEmployee
            modal={employeeModal}
            toggleModal={toggleEmployeeModal}
            customer={state || customerData}
            customerID={customerId}
            pageRefresh={pageRefresh}
            setPageRefresh={setPageRefresh}
          />
          <CreateProject
            modal={createProjectModal}
            toggleModal={toggleCreateProjectModal}
            customer={state || customerData}
            pageRefresh={pageRefresh}
            setPageRefresh={setPageRefresh}
            customerID={customerId}
          />
          <EditProject
            modal={editModal}
            toggleModal={toggleEditModal}
            customer={state || customerData}
            project={project}
            pageRefresh={pageRefresh}
            setPageRefresh={setPageRefresh}
            customerID={customerId}
          />
        </div>
      </div>
      <Loader showComponentLoader={isLoading} />

      <ArchiveProjectModal
        modal={archiveProjectModal}
        toggleModal={toggleArchiveProjectModal}
        handleSubmit={handleArchiveProject}
      />

      <RestoreProjectModal
        modal={restoreProjectModal}
        toggleModal={toggleRestoreProjectModal}
        handleSubmit={handleRestoreProject}
      />

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

export default CustomerProjects;
