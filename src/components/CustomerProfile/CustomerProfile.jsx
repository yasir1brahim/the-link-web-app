import React, { useState, useEffect } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
// import WhitingTurner from '../../assets/images/whiting-turner.svg';
import ProfilePhoto from '../../assets/images/dummy-profile.svg';
import { ReactComponent as Camera } from '../../assets/images/camera.svg';
import { ReactComponent as AddUser } from '../../assets/images/circle-add.svg';

import PaginatedItems from '../shared/Pagination/Pagination';
import CreateEmployee from './createEmployee';
import axiosInstance from '../../config/axios';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditEmployee from './editEmployee';
import { MaskedInput } from '../shared/MaskedInput/maskedInput';
import { ConfirmationModal } from './confirmationModal';
import handleError from '../../config/errorHandler';
import { get } from 'lodash';
import Procore from '../ProjectLogs/procore';
import Loader from '../shared/Loader/Loader';

const CustomerProfile = (props) => {
  const [editProfile, setEditProfile] = useState(false);
  const toggleEditProfile = () => setEditProfile(!editProfile);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [confirmationModal, setConfirmModal] = useState(false);
  const [pageRefresh, setPageRefresh] = useState(false);
  const toggleModal = () => setModal(!modal);
  const toggleEditModal = () => setEditModal(!editModal);
  const toggleConfirmModal = () => setConfirmModal(!confirmationModal);
  const [employeeData, setEmployeeData] = useState([]);
  const [empId, setEmpId] = useState('');
  // const [projectData, setProjectData] = useState([]);
  const [email, setEmail] = useState({ value: '', errors: '' });
  const [companyName, setCompanyName] = useState({
    value: undefined,
    errors: ''
  });
  const [accountOwner, setAccountOwner] = useState({ value: '', errors: '' });
  const [contactNumber, setContactNumber] = useState({ value: '', errors: '' });
  const [address, setAddress] = useState({ value: '', errors: '' });
  const [employee, setEmployee] = useState({});
  const [customerData, setCustomerData] = useState({});
  const [profilePicture, setProfilePicture] = useState('');
  const [currentItems, setCurrentItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setLoading] = useState(false);
  const [procoreModal, setProcoreModal] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const toggleProcoreModal = () => setProcoreModal(!procoreModal);
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const customerId = searchParams.get('id');
  const authCode = searchParams.get('code');

  let customer = state;
  const customerID =
    localStorage.getItem('roleId') === '0'
      ? customerId || state?.customer_id || customer?.id || customer[0]?.id
      : Number(localStorage.getItem('userId'));
  const redirectUri = window.location.href.includes('https://app.thelink.ai')
    ? `https://app.thelink.ai/customer-profile?id=${customerId || customerID}`
    : window.location.href.includes('http://localhost:3000')
    ? `http://localhost:3000/customer-profile?id=${customerId || customerID}`
    : `https://app-sl.thelink.ai/customer-profile?id=${
        customerId || customerID
      }`;
  const clientId = window.location.href.includes('https://app.thelink.ai')
    ? 'ce62990f797459a3dd5005c1323a30beb75fafd0ac6304353101b44e809ddcc9'
    : 'ce62990f797459a3dd5005c1323a30beb75fafd0ac6304353101b44e809ddcc9';

  const navigate = useNavigate();
  useEffect(() => {
    if (authCode) {
      const fetchData = async () => {
        const accessTokenData = await axiosInstance({
          method: 'post',
          url: '/procore/access_token',
          data: {
            code: authCode,
            redirect_uri: redirectUri
          }
        });
        localStorage.setItem(
          'procore_access_token',
          accessTokenData?.data.data.access_token
        );
        const res = await axiosInstance({
          method: 'get',
          url: `/procore/company_mapping/${customerId}`
        });

        if (get(res, 'status') === 200) {
          navigate(`/submital-mappings?customerId=${customerId}`);
        }

        if (get(res, 'status') === 204) {
          setProcoreModal(true);
          const companyResp = await axiosInstance({
            method: 'get',
            url: '/procore/companies'
          });
          setCompanyList(companyResp?.data.data);
        }
      };

      fetchData().catch((error) => {
        handleError(error);
      });
    }
  }, [authCode, customerId, navigate, redirectUri]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/customer/${customerID}`
      });
      setCustomerData(response.data.message[0]);
      console.log('customerData', response.data.message);
    };

    fetchData().catch((error) => {
      handleError(error);
    });
  }, [pageRefresh, customerID]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/employeeList/${customerID}`
      });
      setEmployeeData(response.data.message);
      console.log('employeeData', response.data.message);
    };
    fetchData().catch((error) => {
      handleError(error);
    });
  }, [customerID, pageRefresh]);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const response = await axiosInstance({
  //       method: 'get',
  //       url: `/projects/${state.customer_id}`,
  //     });
  //     setProjectData(response.data.message);
  //     console.log(response.data.message);
  //   };
  //   fetchData().catch((error) => {
  //     toast.error(error?.response?.data?.message || error?.message, {
  //       position: 'bottom-center',
  //       autoClose: 5000,
  //       hideProgressBar: true,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //     });
  //   });
  // }, [state, pageRefresh]);

  useEffect(() => {
    const fetchData = async () => {
      const picture = await axiosInstance({
        method: 'get',
        url: `/getLogo/${
          localStorage.getItem('roleId') === '0'
            ? customerID || state.customer_id 
            : Number(localStorage.getItem('userId'))
        }`
      });
      if (picture.data) {
        setProfilePicture(picture.data.url);
      }
    };
    fetchData().catch((error) => {
      console.log(error);
    });
  }, [state, pageRefresh, customerID]);

  // const handleViewEmployee = (employee) => {
  //   navigate('/project-list', { state: employee });
  // };

  const handleDeleteEmployee = async (id) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `/deleteEmployee`,
        data: {
          employee_id: id
        }
      });
      console.log(response.data);
      toggleConfirmModal();
      setPageRefresh(!pageRefresh);
      toast.success('Employee Deleted Successfully.', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      });
    } catch (error) {
      console.log(error.message);
      handleError(error);
    }
  };

  const validate = () => {
    let error = false;
    if (companyName.value === '') {
      setCompanyName({ ...companyName, errors: 'Company name is required' });
      error = true;
    }
    if (
      contactNumber.value.replace(/[^0-9]/g, '').length &&
      contactNumber.value.replace(/[^0-9]/g, '').length < 10
    ) {
      setContactNumber({
        ...contactNumber,
        errors: 'Contact Number should be of 10 digits.'
      });
      error = true;
    } else if (contactNumber.value.replace(/[^0-9]/g, '').length === 10) {
      setContactNumber({
        ...contactNumber,
        errors: ''
      });
      error = false;
    }
    return error;
  };
  const handleEdit = (employee) => {
    console.log('first', employee);
    setEmployee(employee);
    toggleEditModal();
  };

  const handleSubmit = async () => {
    let errors = validate();
    if (!errors) {
      try {
        const response = await axiosInstance({
          method: 'put',
          url: '/updateCustomer',
          data: {
            email_address: email.value || customerData?.email_address,
            customer_name: companyName.value || customerData?.customer_name,
            account_owner: accountOwner?.value || customerData?.account_owner,
            contact_number:
              contactNumber.value.replace(/[^0-9]/g, '') ||
              customerData?.contact_number,
            address: address.value || customerData?.address,
            status: 'Active',
            customer_id: customerData?.customer_id
          }
        });
        if (response.data.message) {
          customer = response.data.message;
          setCompanyName({ ...companyName, errors: '' });
        }

        if (
          response.data?.message &&
          profilePicture &&
          // !profilePicture?.includes('https')
          typeof profilePicture === 'object'
        ) {
          const data = new FormData();
          data.append('customer_id', customer[0]?.customer_id || customerID);
          data.append('logo', profilePicture);
          await axiosInstance({
            method: 'post',
            url: '/uploadLogo',
            data
          });
          console.log(response.data);
        }
        toggleEditProfile();
        setPageRefresh(!pageRefresh);

        toast.success('Profile Updated Successfully.', {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
      } catch (error) {
        console.log(error.message);
        handleError(error);
      }
    }
  };
  const handleContactNumberChange = (e) => {
    let value = contactNumber.value.replace(/[^0-9]/g, '');
    let regex = /^[0-9]*$/;
    if (regex.test(value)) {
      setContactNumber({
        ...contactNumber,
        value: e.target.value
      });
    }
  };

  return (
    <div className="page-wrap">
      <NavbarTop />
      <div className="page-wrap-content customer-profile-wrapper">
        <Header title={'Customer Profile'} breadcrumb={'Customer Details'} />

        <div className="customer-profile-content">
          <div className="customer-profile-details d-flex align-items-start justify-content-start flex-wrap">
            {!editProfile ? (
              <>
                <div className="customer-dp-container">
                  <img src={profilePicture} alt="Company Logo" />
                </div>
                <div className="customer-profile">
                  <div className="row">
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">Company Name: </div>
                        <div className="text-value">
                          {customerData.customer_name}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">Account ID: </div>
                        <div className="text-value">
                          {customerData.account_id}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">Account Owner: </div>
                        <div className="text-value">
                          {customerData.account_owner}
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
                          {customerData.email_address}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">Phone: </div>
                        <div className="text-value">
                          {customerData.contact_number}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-label-value">
                        <div className="text-label">Address: </div>
                        <div className="text-value">
                          {customerData.address}{' '}
                        </div>
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
                          src={
                            profilePicture
                              ? typeof profilePicture === 'string'
                                ? profilePicture
                                : URL.createObjectURL(profilePicture)
                              : ProfilePhoto
                          }
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
                            defaultValue={customerData.customer_name}
                            onChange={(e) => {
                              setCompanyName({
                                ...companyName,
                                value: e.target.value
                              });
                            }}
                          />
                          <label className="text-label" htmlFor="companyName">
                            Company Name
                          </label>
                          {companyName.errors && (
                            <small
                              className="form-error"
                              style={{ color: 'red' }}
                            >
                              {companyName.errors}
                            </small>
                          )}
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
                            // value={localStorage.getItem('account_id')}
                            value={customerData.account_id}
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
                            defaultValue={customerData.account_owner}
                            onChange={(e) => {
                              setAccountOwner({
                                ...accountOwner,
                                value: e.target.value
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
                            defaultValue={customerData.email_address}
                            onChange={(e) => {
                              setEmail({
                                ...email,
                                value: e.target.value
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
                          {/* <input
                            type="text"
                            className="form-control"
                            id="accountContact"
                            aria-describedby="accountContact"
                            placeholder="Enter"
                            required
                            defaultValue={customerData.contact_number}
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
                          </label> */}
                          <MaskedInput
                            // value={
                            //   contactNumber.value
                            //     ? contactNumber.value
                            //     : customerData.contact_number
                            // }
                            defaultValue={customerData.contact_number}
                            onChange={(e) => handleContactNumberChange(e)}
                            name="contactNumber"
                            error={contactNumber.errors}
                            mask={[
                              '(',
                              /[1-9]/,
                              /\d/,
                              /\d/,
                              ')',
                              ' ',
                              /\d/,
                              /\d/,
                              /\d/,
                              '-',
                              /\d/,
                              /\d/,
                              /\d/,
                              /\d/
                            ]}
                            labelClass={'text-label'}
                            label={'Phone'}
                          />
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
                            defaultValue={customerData.address}
                            onChange={(e) => {
                              setAddress({
                                ...address,
                                value: e.target.value
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
                    </div>
                  </div>
                </div>
                <div className="ec-footerbtns d-flex align-items-center justify-content-end">
                  {/* <button
                    type="button"
                    className="btn btn-secondary mr-3"
                    onClick={toggleEditProfile}
                  >
                    Reset
                  </button> */}
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
              <>
                <div style={{ float: 'right' }}>
                  <div className="table-bulk-changes">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ marginBottom: '2px', float: 'right' }}
                    >
                      <a
                        href={`https://login-sandbox.procore.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`}
                        className="breadcrumb-text"
                      >
                        Procore Submittal Mappings
                      </a>
                    </button>
                  </div>
                  <label className="information-message">
                    <b>Procore users </b>: be sure to click the Procore
                    submittal mappings button.
                  </label>
                </div>
                <div
                  onClick={toggleModal}
                  className="nouser-wrapper d-flex align-items-center justify-content-center w-100"
                >
                  <span
                    className="d-flex align-items-center justify-content-center"
                    onClick={toggleModal}
                  >
                    <AddUser /> Add Employee
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="table-top-content">
                  <div className="table-heading">
                    <h5 className="m-0">Employee List</h5>
                    <label
                      className="table-entries"
                      style={{ paddingTop: '5px' }}
                    >
                      Showing entries{' '}
                      <span className="showing-strong">
                        {currentItems.length}
                      </span>{' '}
                      of{' '}
                      <span className="showing-strong">
                        {employeeData.length}
                      </span>
                      .
                    </label>
                  </div>
                  <div>
                    <div className="table-bulk-changes">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                      >
                        <a
                          href={`https://login-sandbox.procore.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`}
                          className="breadcrumb-text"
                        >
                          Procore Submittal Mappings
                        </a>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm btn-gap"
                        onClick={toggleModal}
                      >
                        + Add Employee
                      </button>
                    </div>
                    <label className="table-entries">
                      <b>Procore users </b>: be sure to click the Procore
                      submittal mappings button.
                    </label>
                  </div>
                </div>
                <div className="l-table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          <span>
                            Employee Name <i className=""></i>
                          </span>
                        </th>
                        <th>
                          <span>
                            Contact Details<i className="sort-d"></i>
                          </span>
                        </th>
                        {/* <th>
                          <span>
                            Associated Projects<i className="sort-i"></i>
                          </span>
                        </th> */}
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((employee) => {
                        return (
                          <tr>
                            <td>{employee.name}</td>
                            <td>
                              {employee.emp_email}
                              <br />
                              {employee.contact_number}
                            </td>
                            {/* <td> */}
                            {/* 625 Adams
                              <br />
                              Gimmy’s hospital */}
                            {/* {projectData
                                .map((project) => project.project_name)
                                .join()}
                            </td> */}
                            <td>
                              <div className="action-wrapper">
                                {/* <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    handleViewEmployee(employee);
                                  }}
                                >
                                  View
                                </button> */}
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleEdit(employee)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  // onClick={() =>
                                  //   handleDeleteEmployee(employee.emp_id)
                                  // }
                                  onClick={() => {
                                    setEmpId(employee.emp_id);
                                    toggleConfirmModal();
                                  }}
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
              <PaginatedItems
                items={employeeData}
                setCurrentItems={setCurrentItems}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
              />
            </div>
          </div>
        </div>
      </div>
      <CreateEmployee
        modal={modal}
        toggleModal={toggleModal}
        pageRefresh={pageRefresh}
        setPageRefresh={setPageRefresh}
        customerID={customerID}
      />
      <EditEmployee
        modal={editModal}
        toggleModal={toggleEditModal}
        employee={employee}
        pageRefresh={pageRefresh}
        setPageRefresh={setPageRefresh}
        empData={employeeData}
        customerID={customerID}
      />
      <ConfirmationModal
        modal={confirmationModal}
        toggleModal={toggleConfirmModal}
        handleDeleteEmployee={handleDeleteEmployee}
        empId={empId}
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
      {isLoading && <Loader showComponentLoader={true} />}
      <Procore
        companyId={customerId}
        companyList={companyList}
        procoreModal={procoreModal}
        setLoading={setLoading}
        toggleProcoreModal={toggleProcoreModal}
        setProcoreModal={setProcoreModal}
        isFromCustomerScreen={true}
      />
    </div>
  );
};

export default CustomerProfile;
