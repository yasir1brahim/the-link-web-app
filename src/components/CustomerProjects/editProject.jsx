import React, { useState, useEffect } from "react";
// import ProfilePhoto from '../../assets/images/dummy-profile.svg';
// import { ReactComponent as Camera } from '../../assets/images/camera.svg';
import axiosInstance from "../../config/axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";
import DateSelector from "../shared/DateSelector/DateSelector";
// import { Typeahead } from 'react-bootstrap-typeahead';
import "react-bootstrap-typeahead/css/Typeahead.css";
import moment from "moment";
import handleError from "../../config/errorHandler";

const EditProject = ({
  modal,
  toggleModal,
  customer,
  project,
  pageRefresh,
  setPageRefresh,
  isAdminUser,
}) => {
  // const [email, setEmail] = useState({ value: '', errors: '' });
  // const [contactNumber, setContactNumber] = useState({ value: '', errors: '' });
  const [projectName, setProjectName] = useState({ value: "", errors: "" });
  const [leadContact, setLeadContact] = useState({
    value: "",
    label: project?.lead_contact,
    email: "",
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // const [projectStatus, setProjectStatus] = useState({ value: '', errors: '' });
  const [employeeList, setEmployeeList] = useState([]);
  // const [accountId, setAccountId] = useState({ value: '', errors: '' });
  // const startDateMoment = moment(
  //   new Date(project?.start_date?.replaceAll('-', '/'))
  // );
  useEffect(() => {
    if (!modal) {
      setProjectName({ value: "", errors: "" });
      setLeadContact({ value: "", errors: "", email: "" });
      setStartDate("");
      setEndDate("");
      setEmployeeList([]);
    }
  }, [modal]);

  useEffect(() => {
    if (modal) {
      const fetchData = async () => {
        const response = await axiosInstance({
          method: "get",
          url: `/employeeList/${customer?.customer_id || project?.customer_id}`,
        });
        if (response.data.message) {
          setEmployeeList(response.data.message);
        }
        console.log(response.data.message);
      };

      fetchData().catch(console.error);
    }
  }, [customer, modal, project?.customer_id]);

  // const validate = () => {
  //   let error = false;
  //   if (email.value === '') {
  //     setEmail({ ...email, errors: 'Email is required.' });
  //     error = true;
  //   }

  //   return error;
  // };

  const handleSubmit = async () => {
    let errors = false;
    if (!errors) {
      try {
        const response = await axiosInstance({
          method: "put",
          url: "/updateProject",
          data: {
            project_name: projectName.value || project?.project_name,
            lead_contact: leadContact[0]
              ? leadContact[0].value
              : employeeList.find(
                  (employee) => employee.name === project?.lead_contact
                )?.emp_id,
            start_date: startDate
              ? moment(startDate).format("YYYY-MM-DD")
              : project?.start_date
              ? moment(
                  new Date((project?.start_date).replaceAll("-", "/"))
                ).format("YYYY-MM-DD")
              : "",
            end_date: endDate
              ? moment(endDate).format("YYYY-MM-DD")
              : project?.end_date
              ? moment(
                  new Date((project?.end_date).replaceAll("-", "/"))
                ).format("YYYY-MM-DD")
              : "",
            customer_id:
              customer?.customer_id || customer?.id || project?.customer_id || customer[0]?.id,
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
        handleError(error)
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
              &times;
            </span>
          </div>
          <div className="lproject-body">
            <form className="create-project-form">
              <div className="customer-profile-details d-flex align-items-start justify-content-start flex-wrap">
                {!isAdminUser && (
                  <>
                    <div className="customer-dp-container">
                      {/* <img src={WhitingTurner} alt="Company Logo" /> */}
                    </div>
                    <div className="customer-profile">
                      <div className="row">
                        <div className="col-12">
                          <div className="text-label-value">
                            <div className="text-value">
                              {customer?.customer_name}
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="text-label-value">
                            <div className="text-label">{customer?.address}</div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="text-label-value">
                            <div className="text-label">
                              {customer?.contact_number}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="create-project-content">
                <div className="row">
                  <div className="col-4">
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
                      <label
                        className="text-label"
                        htmlFor="customerProjectName"
                      >
                        Project Name
                      </label>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <SelectDropdown
                        label={"Lead Contact"}
                        // labelKey="name"
                        setSelected={setLeadContact}
                        // value={leadContact.label}
                        selected={leadContact.label}
                        options={employeeList.map((project) => {
                          return {
                            value: project?.emp_id,
                            label: project?.name,
                            email: project?.emp_email,
                          };
                        })}
                      />
                    </div>
                  </div>
                  <div className="col-4">
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
                                  employee.name === project?.lead_contact
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
                  <div className="col-4">
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
                            ? new Date(
                                (project?.start_date).replaceAll("-", "/")
                              )
                            : ""
                        }
                      />
                    </div>
                  </div>
                  <div className="col-4">
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
                  {/* <div className="col-4">
                    <div className="form-group">
                      <SelectDropdown label={'Project Type'} labelKey="name" />
                    </div>
                  </div> */}
                  {/* <div className="col-12">
                    <div className="users-section">
                      <ul>
                        <li>
                          <div className="row">
                            <div className="col-11">
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
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div> */}
                </div>
              </div>
              <div className="lproject-footer">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={toggleModal}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleSubmit}
                >
                  Save
                </button>{" "}
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
