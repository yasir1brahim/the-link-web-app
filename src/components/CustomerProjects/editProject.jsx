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
import { CircularProgress, TextField, Grid, Box } from "@mui/material";
import { PROJECT_TYPES } from "../../constants";
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";

const EditProject = ({
  modal,
  toggleModal,
  customer,
  project,
  defaultProjectType,
  pageRefresh,
  setPageRefresh,
  isAdminUser,
  customerID,
}) => {
  const [projectType, setProjectType] = useState([{ value: "", label: "" }]);
  const typeaheadRef = useRef(null);
  const [projectName, setProjectName] = useState({ value: "", errors: "" });
  const [projectNumber, setProjectNumber] = useState({ value: "", errors: "" });
  const [leadContact, setLeadContact] = useState({
    value: "",
    label: "",
    email: "",
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployeeList, setSelectedEmployeeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!modal) {
      setProjectName({ value: "", errors: "" });
      setProjectNumber({ value: "", errors: "" });
      setProjectType([{ value: "", label: "" }]);
      setLeadContact({
        value: "",
        label: "",
        email: "",
      });
      typeaheadRef?.current?.clear();
      setStartDate("");
      setEndDate("");
      setEmployeeList([]);
      setSelectedEmployeeList([]);
    }
  }, [modal, typeaheadRef]);

  useEffect(() => {
    if (modal) {
      const preSelectEmployeesForProject = async () => {
        setIsLoading(true);
        const project_type_list = PROJECT_TYPES.filter((project_type) => project_type.name === project.project_type);
        if (project_type_list.length > 0) {
          setProjectType([{
            value: project_type_list[0].id,
            label: project_type_list[0].name
          }]);
        }
        // fetch employees for customer
        const resp_employees_by_customer = await axiosInstance({
          method: "get",
          url: `/employeeList/${
            customer?.customer_id ||
            project?.customer_id ||
            customerID ||
            localStorage.getItem("userId")
          }`,
        });
        const emps_by_c = resp_employees_by_customer.data.message
        if (emps_by_c) {
          setEmployeeList(emps_by_c);
        }

        // fetch employees for project
        const resp_employees_by_project = await axiosInstance({
          method: "get",
          url: `/employees_by_project/${
            project?.project_id
          }`,
        });
        const emps_by_p = resp_employees_by_project.data.message;

        // pre-select employees for project
        if (emps_by_p.length > 0) {
          if (emps_by_c.length > 0) {
            const selected_emps = emps_by_c.filter((emp) => emps_by_p.includes(emp.emp_id));
            if (selected_emps.length > 0) {
              setSelectedEmployeeList(selected_emps.map((emp) => {
                return {
                  value: emp.emp_id,
                  label: emp.name,
                };
              }));
            }
          }
        }
        setIsLoading(false);
      };

      preSelectEmployeesForProject().catch(console.error);
    }
  }, [customer, modal, project?.customer_id, customerID]);

  const handleSubmit = async () => {
    let errors = false;
    if (!errors) {
      try {
        const response = await axiosInstance({
          method: "put",
          url: "/updateProject",
          data: {
            project_name: projectName.value || project?.project_name,
            project_number: projectNumber.value || project?.project_number,
            project_type: projectType[0].label,
            lead_contact: leadContact[0]
              ? leadContact[0].value
              : employeeList.find(
                  (employee) => employee.name === project?.lead_contact,
                )?.emp_id,
            employee_list: selectedEmployeeList.map(
              (employee) => employee.value,
            ),
            start_date: startDate
              ? moment(startDate).format("YYYY-MM-DD")
              : project?.start_date
              ? moment(
                  new Date((project?.start_date).replaceAll("-", "/")),
                ).format("YYYY-MM-DD")
              : "",
            end_date: endDate
              ? moment(endDate).format("YYYY-MM-DD")
              : project?.end_date
              ? moment(
                  new Date((project?.end_date).replaceAll("-", "/")),
                ).format("YYYY-MM-DD")
              : "",
            customer_id:
              customerID ||
              customer?.customer_id ||
              customer?.id ||
              project?.customer_id ||
              customer[0]?.id ||
              localStorage.getItem("userId"),
            status: "Open",
            project_id: project?.project_id,
          },
        });
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
                    <div className="customer-profile mb-0">
                      {/* <div className="col-6">
                        <div className="text-label-value">
                          <div className="text-label">
                            {"Address: " + customer?.address}
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="text-label-value">
                          <div className="text-label">
                            {"Contact: " + customer?.contact_number}
                          </div>
                        </div>
                      </div> */}
                      <Box component="form">
                        <Grid container spacing={3} alignItems="center">
                          {customer?.address && (<Grid item xs={6}>
                            <TextField 
                              variant="outlined" 
                              fullWidth 
                              label="Address" 
                              size="small"
                              defaultValue={customer?.address}
                              disabled
                            />
                          </Grid>)}
                          {customer?.contact_number && (<Grid item xs={6}>
                            <TextField 
                              variant="outlined" 
                              fullWidth 
                              label="Contact Number" 
                              size="small"
                              defaultValue={customer?.contact_number}
                              disabled
                            />
                          </Grid>)}
                        </Grid>
                      </Box>
                      {/* <div className="col-6">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          name="ticketHeading"
                          id="ticketHeading"
                          onClick={()=> 
                            {
                              if(visibilityType === "Personal")
                              { setVisibilityType("Contract") } else {
                                setVisibilityType("Personal")
                              }
                            }}
                          checked={visibilityType === "Personal"}
                        />
                        <label
                          style={{color: 'green', marginLeft: '5px'}}
                          for="ticketHeading"
                        >Personal Project</label>
                      </div>
                    </div> */}
                    </div>
                  </>
                )}
              </div>
              <div className="create-project-content">
                <div style={{ gap: "25px" }} className="d-flex">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="customerProjectName"
                      aria-describedby="customerProjectName"
                      placeholder="Enter"
                      defaultValue={project?.project_name}
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
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="customerProjectNumber"
                      aria-describedby="customerProjectNumber"
                      placeholder="Enter"
                      defaultValue={project?.project_number}
                      onChange={(e) => {
                        setProjectNumber({
                          ...projectNumber,
                          value: e.target.value,
                        });
                      }}
                    />
                    <label className="text-label" htmlFor="customerProjectNumber">
                      Project Number
                    </label>
                  </div>
                </div>
                <div style={{ gap: "25px" }} className="d-flex">
                  <div className="form-group">
                    <div className={`has-typehead`}>
                      <Typeahead
                        id="employee-list"
                        ref={typeaheadRef}
                        options={employeeList.map((project) => {
                          return {
                            value: project?.emp_id,
                            label: project?.name,
                            email: project?.emp_email,
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
                        {project?.lead_contact}
                      </label>
                    ) : null}
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control"
                      id="projectLeadEmail"
                      aria-describedby="projectLeadEmail"
                      placeholder="Enter"
                      value={
                        leadContact[0]
                          ? leadContact[0].email
                          : employeeList.length
                          ? employeeList?.find(
                              (employee) =>
                                employee.name === project?.lead_contact,
                            )?.emp_email
                          : leadContact.label
                      }
                      disabled
                    />
                    <label className="text-label" htmlFor="projectLeadEmail">
                      Email Address(Lead Contact)
                    </label>
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
                <div style={{ gap: "25px" }} className="d-flex">
                  <div className="form-group">
                    <SelectDropdown
                      label={'Project Type'}
                      setSelected={setProjectType}
                      defaultInputValue={defaultProjectType}
                      options={PROJECT_TYPES.map((project_type) => {
                        return {
                          value: project_type?.id,
                          label: project_type?.name,
                        };
                      })}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                  </div>
                </div>
                <div className="users-section">
                  <div className="form-group">
                    <Typeahead
                      multiple
                      value={selectedEmployeeList}
                      selected={selectedEmployeeList}
                      onChange={setSelectedEmployeeList}
                      options={employeeList.map((project) => {
                        return {
                          value: project.emp_id,
                          label: project.name,
                        };
                      })}
                      placeholder="Add Employees"
                      id="add-employees"
                    />
                  </div>
                  <span className="icon-locate">
                    {isLoading ? (
                      <CircularProgress size={12} />
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.99998 13.6666C3.31798 13.6666 0.333313 10.682 0.333313 6.99998C0.333313 3.31798 3.31798 0.333313 6.99998 0.333313C10.682 0.333313 13.6666 3.31798 13.6666 6.99998C13.6666 10.682 10.682 13.6666 6.99998 13.6666ZM6.33331 6.33331H3.66665V7.66665H6.33331V10.3333H7.66665V7.66665H10.3333V6.33331H7.66665V3.66665H6.33331V6.33331Z"
                          fill="#676F74"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="icon-right-locate">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.16671 0.64168C9.01057 0.486471 8.79936 0.399353 8.57921 0.399353C8.35905 0.399353 8.14784 0.486471 7.99171 0.64168L5.00004 3.59168L2.05004 0.64168C1.8939 0.486471 1.68269 0.399353 1.46254 0.399353C1.24238 0.399353 1.03117 0.486471 0.875039 0.64168C0.796932 0.719149 0.734936 0.811317 0.692629 0.912866C0.650322 1.01442 0.62854 1.12334 0.62854 1.23335C0.62854 1.34336 0.650322 1.45228 0.692629 1.55383C0.734936 1.65538 0.796932 1.74754 0.875039 1.82501L4.40837 5.35835C4.48584 5.43645 4.57801 5.49845 4.67956 5.54076C4.78111 5.58306 4.89003 5.60485 5.00004 5.60485C5.11005 5.60485 5.21897 5.58306 5.32052 5.54076C5.42207 5.49845 5.51424 5.43645 5.59171 5.35835L9.16671 1.82501C9.24481 1.74754 9.30681 1.65538 9.34911 1.55383C9.39142 1.45228 9.41321 1.34336 9.41321 1.23335C9.41321 1.12334 9.39142 1.01442 9.34911 0.912866C9.30681 0.811317 9.24481 0.719149 9.16671 0.64168Z"
                        fill="#0E2332"
                      />
                    </svg>
                  </span>
                </div>
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
