import React, { useState, useEffect } from 'react';
// import ProfilePhoto from '../../assets/images/dummy-profile.svg';
// import { ReactComponent as Camera } from '../../assets/images/camera.svg';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axiosInstance from '../../config/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WhitingTurner from '../../assets/images/whiting-turner.svg';
import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
import DateSelector from '../shared/DateSelector/DateSelector';

const CreateProject = ({ modal, toggleModal, customer }) => {
  const [email, setEmail] = useState({ value: '', errors: '' });
  const [contactNumber, setContactNumber] = useState({ value: '', errors: '' });
  const [projectName, setProjectName] = useState({ value: '', errors: '' });
  const [leadContact, setLeadContact] = useState({ value: '', errors: '' });
  const [startDate, setStartDate] = useState({ value: '', errors: '' });
  const [endDate, setEndDate] = useState({ value: '', errors: '' });
  const [customerId, setCustomerId] = useState({ value: '', errors: '' });
  const [projectStatus, setProjectStatus] = useState({ value: '', errors: '' });
  const [employeeList, setEmployeeList] = useState([]);
  // const [accountId, setAccountId] = useState({ value: '', errors: '' });

  useEffect(() => {
    setEmail({ value: '', errors: '' });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/employeeList/${customer.customer_id}`,
      });
      setEmployeeList(response.data.message);
      console.log(response.data.message);
    };

    fetchData().catch(console.error);
  }, [customer]);

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
          method: 'post',
          url: '/createProject',
          data: {
            email_address: email.value,
            contact_number: contactNumber.value,
            project_name: projectName.value,
            lead_contact: leadContact.value,
            start_date: startDate.value,
            end_date: endDate.value,
            customer_id: customerId.value,
            status: projectStatus.value,
          },
        });
        if (response.data) {
          console.log(response.data);
          toggleModal();
        }
      } catch (error) {
        console.log(error.message);
        toast.error(error.message, {
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
      <Modal
        isOpen={modal}
        fade={false}
        toggle={toggleModal}
        className="new-project modal-lg"
      >
        <ModalHeader toggle={toggleModal}>Create New Project</ModalHeader>
        <ModalBody>
          <form className="create-project-form">
            <div className="customer-profile-details d-flex align-items-start justify-content-start flex-wrap">
              <div className="customer-dp-container">
                <img src={WhitingTurner} alt="Company Logo" />
              </div>
              <div className="customer-profile">
                <div className="row">
                  <div className="col-12">
                    <div className="text-label-value">
                      <div className="text-value">Whiting Turner</div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="text-label-value">
                      <div className="text-label">
                        Ms Alice Smith Apartment 1c 213,
                        <br />
                        Derrick Street, Boston, MA 02130 USA.{' '}
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="text-label-value">
                      <div className="text-label">
                        +(425) 555 0100, +(732) 622 4888
                      </div>
                    </div>
                  </div>
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
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <SelectDropdown
                      label={'Lead Contact'}
                      labelKey="name"
                      // options={employeeList.map((project) => {
                      //   return {
                      //     value: project.customer_id,
                      //     label: project.name,
                      //   };
                      // })}
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
                      required
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
                    />
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <DateSelector
                      isClearable={false}
                      placeholderText="End Date"
                      labelText="End Date"
                    />
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <SelectDropdown label={'Project Type'} labelKey="name" />
                  </div>
                </div>
                <div className="col-12">
                  <div className="users-section">
                    <ul>
                      <li>
                        <div className="row">
                          <div className="col-4">
                            <div className="form-group">
                              <SelectDropdown
                                label={'User Name'}
                                labelKey="name"
                              />
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="form-group">
                              <input
                                type="text"
                                className="form-control"
                                id="userEmailAddress"
                                aria-describedby="userEmailAddress"
                                placeholder="Enter"
                                required
                              />
                              <label
                                className="text-label"
                                htmlFor="userEmailAddress"
                              >
                                Email Address(user)
                              </label>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="d-flex align-itms-center justify-content-start mt-3">
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm mr-2"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                              >
                                Add User
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="row">
                          <div className="col-4">
                            <div className="form-group">
                              <SelectDropdown
                                label={'User Name'}
                                labelKey="name"
                              />
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="form-group">
                              <input
                                type="text"
                                className="form-control"
                                id="userEmailAddress"
                                aria-describedby="userEmailAddress"
                                placeholder="Enter"
                                required
                              />
                              <label
                                className="text-label"
                                htmlFor="userEmailAddress"
                              >
                                Email Address(user)
                              </label>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="d-flex align-itms-center justify-content-start mt-3">
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm mr-2"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                              >
                                Add User
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <ModalFooter>
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
              <Button color="primary" onClick={toggleModal}>
                Create
              </Button>{' '}
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
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
