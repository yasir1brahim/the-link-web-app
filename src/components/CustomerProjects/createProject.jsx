import React, { useState, useEffect } from 'react';
// import ProfilePhoto from '../../assets/images/dummy-profile.svg';
// import { ReactComponent as Camera } from '../../assets/images/camera.svg';
import axiosInstance from '../../config/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import WhitingTurner from '../../assets/images/whiting-turner.svg';
import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
import DateSelector from '../shared/DateSelector/DateSelector';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import moment from 'moment';
import { AddNewEmp } from './addNewEmp';

const CreateProject = ({
  modal,
  toggleModal,
  customer,
  pageRefresh,
  setPageRefresh,
  projects,
  isPersonalProject = false
}) => {
  // const [email, setEmail] = useState({ value: '', errors: '' });
  // const [contactNumber, setContactNumber] = useState({ value: '', errors: '' });
  const [projectName, setProjectName] = useState({ value: '', errors: '' });
  const [leadContact, setLeadContact] = useState({
    value: '',
    label: '',
    email: '',
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectType, setProjectType] = useState('commercial');
  const [dateError, setDateError] = useState({ startError: '', endError: '' });
  // const [projectStatus, setProjectStatus] = useState({ value: '', errors: '' });
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployeeList, setSelectedEmployeeList] = useState([]);
  const [profilePicture, setProfilePicture] = useState('');
  const [refetchEmp, setRefetchEmp] = useState(false);
  const [empForm, openEmpForm] = useState(false);
  const [visibilityType, setVisibilityType] = useState('Contract')
  // const [accountId, setAccountId] = useState({ value: '', errors: '' });\
  console.log('customer', projects)

  useEffect(() => {
    if (!modal) {
      setProjectName({ value: '', errors: '' });
      setLeadContact({ value: '', errors: '', email: '' });
      setStartDate('');
      setEndDate('');
      setEmployeeList([]);
      setSelectedEmployeeList([]);
      setVisibilityType('Contract')
    }
  }, [modal]);

  useEffect(() => {
    if (modal) {
      const fetchData = async () => {
        const response = await axiosInstance({
          method: 'get',
          url: `/employeeList/${customer?.customer_id}`,
        });
        setEmployeeList(response.data.message);
        console.log(response.data.message);
        const picture = await axiosInstance({
          method: 'get',
          url: `/getLogo/${localStorage.getItem('roleId') === '0' ? customer?.customer_id : Number(localStorage.getItem('userId'))}`,
        });
        if (picture.data) {
          setProfilePicture(picture.data.url);
        }
      };

      fetchData().catch(console.error);
    }
  }, [customer, modal, refetchEmp]);

  const validate = () => {
    let error = false;
    if (projectName.value === '') {
      setProjectName({ ...projectName, errors: 'Project Name is required.' });
      error = true;
    }
    if (projects?.find(item => item?.project_name === projectName?.value)) {
      setProjectName({ ...projectName, errors: 'Project Name already exists.' });
      error = true;
    }
    setDateError({ startError: '', endError: '' });
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
          method: 'post',
          url: '/createProject',
          data: {
            project_name: projectName.value,
            lead_contact: leadContact[0]?.value || '',
            start_date: startDate ? moment(startDate).format('YYYY-MM-DD') : '',
            end_date: endDate ? moment(endDate).format('YYYY-MM-DD') : '',
            customer_id: customer?.customer_id,
            status: 'Open',
            employee_list: selectedEmployeeList.map(
              (employee) => employee.value
            ),
            project_type: projectType,
            visibility_type: visibilityType
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
          position: 'bottom-center',
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
      <div className={"create-new-lproject " + (modal ? 'show-lproject-popup' : '')}>
        <div className="lproject-backdrop"></div>
        <div className="lproject-content">
          <div className="lproject-header">
            <h5>Create New Project</h5>
            <span className="close" onClick={toggleModal}>&times;</span>
          </div>
          <div className="lproject-body">
            <form className="create-project-form">
              <div className="customer-profile-details d-flex align-items-start justify-content-start flex-wrap">
                <div className="customer-dp-container">
                  <img src={profilePicture} alt="Company Logo" />
                </div>
                <div className="customer-profile">
                  <div className="row">
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-value">{customer?.customer_name}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="radio"
                          name="ticketHeading"
                          id="ticketHeading"
                          onClick={()=> setProjectType('commercial')}
                          checked={projectType === 'commercial'}
                        />
                        <label
                          for="ticketHeading"
                          style={{color: '#212121', marginLeft: '5px'}}
                        >Commercial Project</label>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">{customer?.address}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="radio"
                          name="ticketHeading"
                          id="ticketHeading"
                          onClick={()=> setProjectType('ufgs')}
                          checked={projectType === 'ufgs'}
                        />
                        <label
                          style={{color: '#212121', marginLeft: '5px'}}
                          for="ticketHeading"
                        >Military/Gov Project(UFGS Specs)</label>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">
                          {customer?.contact_number}
                        </div>
                      </div>
                    </div>
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
                        <small className="form-error" style={{ color: 'red' }}>
                          {projectName.errors}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <SelectDropdown
                        label={'Lead Contact'}
                        // labelKey="name"
                        setSelected={setLeadContact}
                        value={leadContact.label}
                        selected={leadContact.label}
                        options={employeeList.map((project) => {
                          return {
                            value: project.emp_id,
                            label: project.name,
                            email: project.emp_email,
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
                            : leadContact.email
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
                        selected={startDate}
                      />
                      {dateError.startError && (
                        <small className="form-error" style={{ color: 'red' }}>
                          {dateError.startError}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <DateSelector
                        isClearable={false}
                        placeholderText="End Date"
                        labelText="End Date"
                        onChange={setEndDate}
                        selected={endDate}
                      />
                      {dateError.endError && (
                        <small className="form-error" style={{ color: 'red' }}>
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
                  <div className="col-12">
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
                        />
                      </div>
                    </div>
                  </div>
                  {!empForm && <div className="col-4" style={{marginBottom: '10px'}}>
                    <button className="btn btn-primary" type="button" onClick={() => openEmpForm(true)}>
                      Add New Employee
                    </button>
                  </div>}
                  {empForm && <>
                    <AddNewEmp
                     customer={customer}
                     openEmpForm={openEmpForm}
                     setRefetchEmp={setRefetchEmp}
                    />
                  </>}
                </div>
              </div>
              <div className="lproject-footer">
                <button className="btn btn-secondary" type="button" onClick={toggleModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="button" onClick={handleSubmit}>
                  Create
                </button>{' '}
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

export default CreateProject;
