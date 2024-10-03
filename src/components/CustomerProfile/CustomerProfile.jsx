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
import { getTeamDetails, getUserRoleInTeam } from '../../api/Authentication/api';


const CustomerProfile = (props) => {
  const [currentUserRole, setCurrentUserRole] = useState('member');
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
  const [companyName, setCompanyName] = useState({
    value: undefined,
    errors: ''
  });
  const [contactNumber, setContactNumber] = useState({ value: '', errors: '' });
  const [employee, setEmployee] = useState({});
  const [customerData, setCustomerData] = useState({});
  const [currentItems, setCurrentItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setLoading] = useState(false);
  const [procoreModal, setProcoreModal] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const toggleProcoreModal = () => setProcoreModal(!procoreModal);
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('id');
  const authCode = searchParams.get('code');

  const redirectUri = window.location.href.includes('https://app.thelink.ai')
    ? `https://app.thelink.ai/customer-profile?id=${customerId}`
    : window.location.href.includes('http://localhost:3000')
    ? `http://localhost:3000/customer-profile?id=${customerId}`
    : `https://app-sl.thelink.ai/customer-profile?id=${customerId}`;
  const clientId = window.location.href.includes('https://app.thelink.ai')
    ? '974cb8bfa7aaadc4759a6d60a2d8427387d32db0c4fa4dfbe1da15b5ce3abfc5'
    : 'ce62990f797459a3dd5005c1323a30beb75fafd0ac6304353101b44e809ddcc9';

  const navigate = useNavigate();


  const roleDisplayMap = {
    'member': 'Company Member',
    'admin': 'Company Admin',
  }


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
      const response = await getTeamDetails(customerId);

      setCustomerData(response.data);
      setEmployeeData(response.data.members);
      console.log('customerData', response.data);
      const userRole = await getUserRoleInTeam(localStorage.getItem('userId'), customerId);
      console.log('userRole', userRole);
      setCurrentUserRole(userRole);
    };

    fetchData().catch((error) => {
      handleError(error);
    });
  }, [pageRefresh, customerId]);


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
  
  const handleEdit = (employee) => {
    console.log('first', employee);
    setEmployee(employee);
    toggleEditModal();
  };

  
  return (
    <div className="page-wrap">
      <NavbarTop />
      <div className="page-wrap-content customer-profile-wrapper">
        <Header title={customerData.name} breadcrumb={'Customer Details'} />

        <div className="customer-profile-content">
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
                            Employee Name <i className="sort-d"></i>
                          </span>
                        </th>
                        <th>
                          <span>
                            Employee Email <i className="sort-d"></i>
                          </span>
                        </th>
                        <th>
                          <span>
                            Role<i className="sort-d"></i>
                          </span>
                        </th>
                        {currentUserRole === 'admin' && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((employee) => {
                        return (
                          <tr>
                            <td>{employee.display_name}</td>
                            <td>{employee.email}</td>
                            <td>
                              {roleDisplayMap[employee.role]}
                            </td>
                            {currentUserRole === 'admin' && <td>
                              <div className="action-wrapper">
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
                            </td>}
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
        customerID={customerId}
      />
      <EditEmployee
        modal={editModal}
        toggleModal={toggleEditModal}
        employee={employee}
        pageRefresh={pageRefresh}
        setPageRefresh={setPageRefresh}
        empData={employeeData}
        customerID={customerId}
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
        projectId={null}
        toggleProcoreModal={toggleProcoreModal}
        setProcoreModal={setProcoreModal}
        isFromCustomerScreen={true}
      />
    </div>
  );
};

export default CustomerProfile;
