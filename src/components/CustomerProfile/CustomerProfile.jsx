import React, { useState, useEffect } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import WhitingTurner from '../../assets/images/whiting-turner.svg';
import ProfilePhoto from '../../assets/images/dummy-profile.svg';
import { ReactComponent as Camera } from '../../assets/images/camera.svg';
import { ReactComponent as AddUser } from '../../assets/images/circle-add.svg';

import PaginatedItems from '../shared/Pagination/Pagination';
import CreateEmployee from './createEmployee';
import axiosInstance from '../../config/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomerProfile = (props) => {
  const [editProfile, setEditProfile] = useState(false);
  const toggleEditProfile = () => setEditProfile(!editProfile);
  const [modal, setModal] = useState(false);
  const toggleModal = () => setModal(!modal);
  const [employeeData, setEmployeeData] = useState([]);
  const [resetPwd, setResetPwd] = useState(false);
  const toggleResetPwd = () => setResetPwd(!resetPwd);
  const [email, setEmail] = useState({ value: '', errors: '' });
  const [companyName, setCompanyName] = useState({ value: '', errors: '' });
  const [accountOwner, setAccountOwner] = useState({ value: '', errors: '' });
  const [contactNumber, setContactNumber] = useState({ value: '', errors: '' });
  const [address, setAddress] = useState({ value: '', errors: '' });
  const [password, setPassword] = useState({ value: '', errors: '' });
  const [confirmPassword, setConfirmPassword] = useState({
    value: '',
    errors: '',
  });
  const [profilePicture, setProfilePicture] = useState('');
  const { state } = useLocation();
  const customer = state;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/employeeList/${state.customer_id}`,
      });
      setEmployeeData(response.data.message);
      console.log(response.data.message);
    };

    fetchData().catch((error) => {
      toast.error(error.message, {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });
  }, [state]);

  const handleViewEmployee = (employee) => {
    navigate('/project-list', { state: employee });
  };

  const handleDeleteEmployee = async (id) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `/deleteEmployee`,
        data: {
          employee_id: id,
        },
      });
      console.log(response.data);
      toast.success('Employee Deleted Successfully.', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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
    }
  };

  const validate = () => {
    let error = false;

    if (password.value && password.value !== confirmPassword.value) {
      setPassword({
        ...password,
        errors: 'Password not matched with confirm Passsword.',
      });
      error = true;
    }
    return error;
  };

  const handleSubmit = async () => {
    let errors = validate();
    if (!errors) {
      try {
        const response = await axiosInstance({
          method: 'put',
          url: '/updateCustomer',
          data: {
            email_address: email.value || customer.email_address,
            password: password.value || '',
            customer_name: companyName.value || customer.customer_name,
            account_owner: accountOwner.value || customer.account_owner,
            contact_number: contactNumber.value || customer.contact_number,
            address: address.value || customer.address,
            status: 'Active',
          },
        });

        if (response.data?.customer_id && profilePicture) {
          await axiosInstance({
            method: 'post',
            url: '/uploadLogo',
            data: {
              customer_id: response.data.customer_id,
              logo: profilePicture,
            },
          });
          console.log(response.data);
        }
        toggleEditProfile();
        toast.success('Profile Updated Successfully.', {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
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
      }
    }
  };

  return (
    <div className="page-wrap">
      <NavbarTop />
      <div className="page-wrap-content customer-profile-wrapper">
        <Header title={'Customer Profile'} />

        <div className="customer-profile-content">
          <div className="customer-profile-details d-flex align-items-start justify-content-start flex-wrap">
            {!editProfile ? (
              <>
                <div className="customer-dp-container">
                  <img src={WhitingTurner} alt="Company Logo" />
                </div>
                <div className="customer-profile">
                  <div className="row">
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">Company Name: </div>
                        <div className="text-value">
                          {customer.customer_name}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">Account ID: </div>
                        <div className="text-value">{customer.account_id}</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">Account Owner: </div>
                        <div className="text-value">
                          {customer.account_owner}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">Password: </div>
                        <div className="text-value">**********</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">Email ID: </div>
                        <div className="text-value">
                          {customer.email_address}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">Phone: </div>
                        <div className="text-value">
                          {customer.contact_number}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">Address: </div>
                        <div className="text-value">{customer.address} </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="customer-edit-container">
                  <button
                    type="button"
                    onClick={toggleEditProfile}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                </div>
              </>
            ) : (
              <form className="edit-customer-form w-100">
                <div className="edit-customer-content">
                  <div className="ec-left">
                    <div className="upload-documents">
                      <div className="image-holder">
                        <img
                          src={ProfilePhoto}
                          alt="Profile"
                          className="dummy-image"
                        />
                        {/* <img src={ProfilePhoto} alt="Profile Photo" className='uploaded-image'/> */}
                      </div>
                      <div className="select-File">
                        <input
                          className="d-none"
                          type="file"
                          name="files[]"
                          id="uploadDocs"
                          onChange={(e) => {
                            setProfilePicture(e.target.files[0]);
                          }}
                        />
                        <label htmlFor="uploadDocs">
                          <div className="upload-text d-flex align-items-center justify-content-center">
                            <Camera />
                            <span>Upload Logo</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="ec-right">
                    <div className="row">
                      <div className="col-4">
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            id="companyName"
                            aria-describedby="companyName"
                            placeholder="Enter"
                            required
                            defaultValue={customer.customer_name}
                            onChange={(e) => {
                              setCompanyName({
                                ...companyName,
                                value: e.target.value,
                              });
                            }}
                          />
                          <label className="text-label" htmlFor="companyName">
                            Company Name
                          </label>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            id="accountId"
                            aria-describedby="accountId"
                            placeholder="Enter"
                            required
                            disabled
                            value={localStorage.getItem('account_id')}
                          />
                          <label className="text-label" htmlFor="accountId">
                            Account Id
                          </label>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            id="accountOwner"
                            aria-describedby="accountOwner"
                            placeholder="Enter"
                            required
                            defaultValue={customer.account_owner}
                            onChange={(e) => {
                              setAccountOwner({
                                ...accountOwner,
                                value: e.target.value,
                              });
                            }}
                          />
                          <label className="text-label" htmlFor="accountOwner">
                            Account Owner
                          </label>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="form-group">
                          <input
                            type="email"
                            className="form-control"
                            id="accountEmail"
                            aria-describedby="accountEmail"
                            placeholder="Enter"
                            required
                            defaultValue={customer.email_address}
                            onChange={(e) => {
                              setEmail({
                                ...email,
                                value: e.target.value,
                              });
                            }}
                          />
                          <label className="text-label" htmlFor="accountEmail">
                            Email Address
                          </label>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            id="accountContact"
                            aria-describedby="accountContact"
                            placeholder="Enter"
                            required
                            defaultValue={customer.contact_number}
                            onChange={(e) => {
                              setContactNumber({
                                ...contactNumber,
                                value: e.target.value,
                              });
                            }}
                          />
                          <label
                            className="text-label"
                            htmlFor="accountContact"
                          >
                            Phone
                          </label>
                        </div>
                      </div>
                      <div className="col-8">
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            id="accountAddress"
                            aria-describedby="accountAddress"
                            placeholder="Enter"
                            required
                            defaultValue={customer.address}
                            onChange={(e) => {
                              setAddress({
                                ...address,
                                value: e.target.value,
                              });
                            }}
                          />
                          <label
                            className="text-label"
                            htmlFor="accountAddress"
                          >
                            Address
                          </label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div onClick={toggleResetPwd} className="pwd-link">
                          Reset Password?
                        </div>
                        {resetPwd ? (
                          <div className="row">
                            {/* <div className="col-4">
                              <div className="form-group">
                                <input
                                  type="password"
                                  className="form-control"
                                  id="oldPassword"
                                  aria-describedby="oldPassword"
                                  placeholder="Enter"
                                  required
                                />
                                <label
                                  className="text-label"
                                  htmlFor="oldPassword"
                                >
                                  Old Password
                                </label>
                              </div>
                            </div> */}
                            <div className="col-4">
                              <div className="form-group">
                                <input
                                  type="password"
                                  className="form-control"
                                  id="newPassword"
                                  aria-describedby="newPassword"
                                  placeholder="Enter"
                                  required
                                  value={password.value}
                                  onChange={(e) => {
                                    setPassword({
                                      ...password,
                                      value: e.target.value,
                                    });
                                  }}
                                />
                                <label
                                  className="text-label"
                                  htmlFor="newPassword"
                                >
                                  New Password
                                </label>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="form-group">
                                <input
                                  type="password"
                                  className="form-control"
                                  id="confirmNewPassword"
                                  aria-describedby="confirmNewPassword"
                                  placeholder="Enter"
                                  required
                                  value={confirmPassword.value}
                                  onChange={(e) => {
                                    setConfirmPassword({
                                      ...confirmPassword,
                                      value: e.target.value,
                                    });
                                  }}
                                />
                                <label
                                  className="text-label"
                                  htmlFor="confirmNewPassword"
                                >
                                  Confirm New Password
                                </label>
                              </div>
                            </div>
                          </div>
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ec-footerbtns d-flex align-items-center justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary mr-3"
                    onClick={toggleEditProfile}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="customer-users-details">
            {employeeData.length === 0 ? (
              <div
                onClick={toggleModal}
                className="nouser-wrapper d-flex align-items-center justify-content-center w-100"
              >
                <span
                  className="d-flex align-items-center justify-content-center"
                  onClick={toggleModal}
                >
                  <AddUser /> Add User/Employee
                </span>
              </div>
            ) : (
              <>
                <div className="table-top-content">
                  <div className="table-heading">
                    <h5 className="m-0">Employee/User List</h5>
                    <label className="table-entries">
                      Showing entries <span className="showing-strong">6 </span>
                      of <span className="showing-strong">90</span>.
                    </label>
                  </div>
                  <div className="table-bulk-changes">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={toggleModal}
                    >
                      + Add User/Employee
                    </button>
                  </div>
                </div>
                <div className="l-table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          <span className="has-sorting">
                            Employee Name <i className=""></i>
                          </span>
                        </th>
                        <th>
                          <span className="has-sorting">
                            Contact Details<i className="sort-d"></i>
                          </span>
                        </th>
                        <th>
                          <span className="has-sorting">
                            Associated Projects<i className="sort-i"></i>
                          </span>
                        </th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeData.map((employee) => {
                        return (
                          <tr>
                            <td>{employee.name}</td>
                            <td>
                              {employee.emp_email}
                              <br />
                              {employee.contact_number}
                            </td>
                            <td>
                              {/* 625 Adams
                              <br />
                              Gimmy’s hospital */}
                              {employee.projects}
                            </td>
                            <td>
                              <div className="action-wrapper">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    handleViewEmployee(employee);
                                  }}
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={toggleModal}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() =>
                                    handleDeleteEmployee(employee.emp_id)
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <div className="table-footer-content">
              <PaginatedItems itemsPerPage={4} />
            </div>
          </div>
        </div>
      </div>
      <CreateEmployee
        modal={modal}
        toggleModal={toggleModal}
        customer={customer}
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
    </div>
  );
};

export default CustomerProfile;
