import React, { useState, useEffect } from "react";
// import ProfilePhoto from '../../assets/images/dummy-profile.svg';
// import { ReactComponent as Camera } from '../../assets/images/camera.svg';
import axiosInstance from "../../config/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import WhitingTurner from '../../assets/images/whiting-turner.svg';
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";
import DateSelector from "../shared/DateSelector/DateSelector";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import moment from "moment";
import { AddNewEmp } from "./addNewEmp";

const CreateProject = ({ modal, toggleModal, customer, pageRefresh, setPageRefresh, projects, isPersonalProject = false, customerID }) => {
  // const [email, setEmail] = useState({ value: '', errors: '' });
  // const [contactNumber, setContactNumber] = useState({ value: '', errors: '' });
  const [projectName, setProjectName] = useState({ value: "", errors: "" });
  const [leadContact, setLeadContact] = useState({
    value: "",
    label: "",
    email: "",
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState({ startError: "", endError: "" });
  // const [projectStatus, setProjectStatus] = useState({ value: '', errors: '' });
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployeeList, setSelectedEmployeeList] = useState([]);
  const [profilePicture, setProfilePicture] = useState("");
  const [refetchEmp, setRefetchEmp] = useState(false);
  const [empForm, openEmpForm] = useState(false);
  const [visibilityType, setVisibilityType] = useState("Contract");
  // const [accountId, setAccountId] = useState({ value: '', errors: '' });\

  useEffect(() => {
    if (!modal) {
      setProjectName({ value: "", errors: "" });
      setLeadContact({ value: "", errors: "", email: "" });
      setStartDate("");
      setEndDate("");
      setEmployeeList([]);
      setSelectedEmployeeList([]);
      setVisibilityType("Contract");
      openEmpForm(false);
    }
  }, [modal]);

  useEffect(() => {
    if (modal) {
      const fetchData = async () => {
        const response = await axiosInstance({
          method: "get",
          url: `/employeeList/${customer?.customer_id || customerID || localStorage.getItem("userId")}`,
        });
        setEmployeeList(response.data.message);
        console.log(response.data.message);
        const picture = await axiosInstance({
          method: "get",
          url: `/getLogo/${localStorage.getItem("roleId") === "0" ? customer?.customer_id || customerID : Number(localStorage.getItem("userId"))}`,
        });
        if (picture.data) {
          setProfilePicture(picture.data.url);
        }
      };

      fetchData().catch(console.error);
    }
  }, [customer, modal, refetchEmp, customerID]);

  const validate = () => {
    let error = false;
    if (projectName.value === "") {
      setProjectName({ ...projectName, errors: "Project Name is required." });
      error = true;
    }
    if (projects?.find((item) => item?.project_name === projectName?.value)) {
      setProjectName({
        ...projectName,
        errors: "Project Name already exists.",
      });
      error = true;
    }
    setDateError({ startError: "", endError: "" });
    // if (startDate === '') {
    //   setDateError({ ...dateError, startError: 'Start Date is required.' });
    //   error = true;
    // }
    // if (endDate === '') {
    //   setDateError({ ...dateError, endError: 'End Date is required.' });
    //   error = true;
    // }

    return error;
  };

  const handleSubmit = async () => {
    let errors = validate();
    if (!errors) {
      try {
        const response = await axiosInstance({
          method: "post",
          url: "/createProject",
          data: {
            project_name: projectName.value,
            lead_contact: leadContact[0]?.value || "",
            start_date: startDate ? moment(startDate).format("YYYY-MM-DD") : "",
            end_date: endDate ? moment(endDate).format("YYYY-MM-DD") : "",
            customer_id: customer?.customer_id || customerID || localStorage.getItem("userId"),
            status: "Open",
            employee_list: selectedEmployeeList.map((employee) => employee.value),
            project_type: "commercial",
            visibility_type: visibilityType,
          },
        });
        if (response.data) {
          console.log(response.data);
          setPageRefresh(!pageRefresh);
          toggleModal();
        }
      } catch (error) {
        console.log(error.message);
        toast.error(error.response.data.message, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        toggleModal();
      }
    }
  };

  return (
    <>
      <div className={"create-new-lproject " + (modal ? "show-lproject-popup" : "")}>
        <div className="lproject-backdrop"></div>
        <div className="lproject-content">
          <div className="lproject-header" style={{ marginBottom: "0px" }}>
            <h5>Create New Project</h5>
            <span className="close" onClick={toggleModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <div className="customer-profile">
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
              </div>
              <div className="create-project-content" style={{ marginTop: "0px" }}>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    id="customerProjectName"
                    aria-describedby="customerProjectName"
                    placeholder="Enter"
                    required
                    value={projectName.value}
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
                  {projectName.errors && (
                    <small className="form-error" style={{ color: "red" }}>
                      {projectName.errors}
                    </small>
                  )}
                </div>
                <div style={{ gap: "25px" }} className="d-flex">
                  <div className="form-group">
                    <DateSelector isClearable={false} placeholderText="Start Date" labelText="Start Date" onChange={setStartDate} selected={startDate} />
                    {dateError.startError && (
                      <small className="form-error" style={{ color: "red" }}>
                        {dateError.startError}
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <DateSelector isClearable={false} placeholderText="End Date" labelText="End Date" onChange={setEndDate} selected={endDate} />
                    {dateError.endError && (
                      <small className="form-error" style={{ color: "red" }}>
                        {dateError.endError}
                      </small>
                    )}
                  </div>
                </div>
                {/* <div className="col-4">
                    <div className="form-group">
                      <SelectDropdown label={'Project Type'} labelKey="name" />
                    </div>
                  </div> */}
                <div className="users-section">
                  <div className="">
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
                    <span className="icon-locate">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M6.99998 13.6666C3.31798 13.6666 0.333313 10.682 0.333313 6.99998C0.333313 3.31798 3.31798 0.333313 6.99998 0.333313C10.682 0.333313 13.6666 3.31798 13.6666 6.99998C13.6666 10.682 10.682 13.6666 6.99998 13.6666ZM6.33331 6.33331H3.66665V7.66665H6.33331V10.3333H7.66665V7.66665H10.3333V6.33331H7.66665V3.66665H6.33331V6.33331Z"
                          fill="#676F74"
                        />
                      </svg>
                    </span>
                    <span className="icon-right-locate">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M9.16671 0.64168C9.01057 0.486471 8.79936 0.399353 8.57921 0.399353C8.35905 0.399353 8.14784 0.486471 7.99171 0.64168L5.00004 3.59168L2.05004 0.64168C1.8939 0.486471 1.68269 0.399353 1.46254 0.399353C1.24238 0.399353 1.03117 0.486471 0.875039 0.64168C0.796932 0.719149 0.734936 0.811317 0.692629 0.912866C0.650322 1.01442 0.62854 1.12334 0.62854 1.23335C0.62854 1.34336 0.650322 1.45228 0.692629 1.55383C0.734936 1.65538 0.796932 1.74754 0.875039 1.82501L4.40837 5.35835C4.48584 5.43645 4.57801 5.49845 4.67956 5.54076C4.78111 5.58306 4.89003 5.60485 5.00004 5.60485C5.11005 5.60485 5.21897 5.58306 5.32052 5.54076C5.42207 5.49845 5.51424 5.43645 5.59171 5.35835L9.16671 1.82501C9.24481 1.74754 9.30681 1.65538 9.34911 1.55383C9.39142 1.45228 9.41321 1.34336 9.41321 1.23335C9.41321 1.12334 9.39142 1.01442 9.34911 0.912866C9.30681 0.811317 9.24481 0.719149 9.16671 0.64168Z"
                          fill="#0E2332"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
                {!empForm && (
                  <button className="new-btn" type="button" onClick={() => openEmpForm(true)}>
                    <span className="">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M6.99998 13.6666C3.31798 13.6666 0.333313 10.682 0.333313 6.99998C0.333313 3.31798 3.31798 0.333313 6.99998 0.333313C10.682 0.333313 13.6666 3.31798 13.6666 6.99998C13.6666 10.682 10.682 13.6666 6.99998 13.6666ZM6.33331 6.33331H3.66665V7.66665H6.33331V10.3333H7.66665V7.66665H10.3333V6.33331H7.66665V3.66665H6.33331V6.33331Z"
                          fill="#2F5AA3"
                        />
                      </svg>
                    </span>
                    <span className="content">Add New Employee</span>
                  </button>
                )}
                {empForm && (
                  <>
                    <AddNewEmp customerID={customerID || customer?.customer_id} openEmpForm={openEmpForm} setRefetchEmp={setRefetchEmp} />
                  </>
                )}
              </div>
              <div className="lproject-footer">
                <button style={{ background: "#D5E73E", color: "#0E2332" }} className="" type="button" onClick={handleSubmit}>
                  Create
                </button>{" "}
                <button style={{ border: "1px solid #D1D5DB", color: "#36454F",background:"white" }} className="" type="button" onClick={toggleModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-center" autoClose={5000} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default CreateProject;
