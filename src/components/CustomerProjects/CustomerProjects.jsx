import React, { useEffect, useState } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
// import WhitingTurner from '../../assets/images/whiting-turner.svg';
// import { ReactComponent as AddUser } from '../../assets/images/circle-add.svg';
// import ProfilePhoto from '../../assets/images/dummy-profile.svg';
// import { ReactComponent as Camera } from '../../assets/images/camera.svg';
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
// import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
// import DateSelector from '../shared/DateSelector/DateSelector';
import PaginatedItems from '../shared/Pagination/Pagination';
import axiosInstance from '../../config/axios';
import { useLocation } from 'react-router-dom';
import CreateProject from './createProject';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import EditProject from './editProject';
import CreateEmployee from '../CustomerProfile/createEmployee';
import moment from 'moment';

const CustomerProjects = (props) => {
  const [modal, setModal] = useState(false);
  const [employeeModal, setEmployeeModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [isArchived, toggleArchive] = useState(false);
  const toggleModal = () => setModal(!modal);
  const toggleEditModal = () => setEditModal(!editModal);
  const toggleEmployeeModal = () => setEmployeeModal(!employeeModal);
  const [projectData, setProjectData] = useState([]);
  const [project, setProject] = useState({});
  const [pageRefresh, setPageRefresh] = useState(false);
  const [currentItems, setCurrentItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [customerData, setCustomerData] = useState({});
  const { state } = useLocation();
  // const customer = state;
  const navigate = useNavigate();
  const roleId = localStorage.getItem('roleId')

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: state?.customer_id
          ? `/customer/${state.customer_id}`
          : `/customer/${localStorage.getItem('userId')}`,
      });
      setCustomerData(response.data.message[0]);
      console.log(response.data.message);
    };

    fetchData().catch((error) => {
      toast.error('Something went wrong!', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });
  }, [state, pageRefresh]);

  useEffect(() => {
    const url = roleId === '6' || roleId === '7' ?
      `/emp/projects/${localStorage.getItem('userId')}` :
      state?.customer_id
        ? `/projects/${state.customer_id}`
        : `/projects/${localStorage.getItem('userId')}`
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url,
      });
      // setProjectData(response.data.message);
      setProjectData(
        isArchived ? response.data.archived_projects : response.data.message
      );
      console.log(response.data.message);
    };

    fetchData().catch((error) => {
      toast.error('Something went wrong!', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });
  }, [state, pageRefresh, isArchived, roleId]);

  const handleLaunch = (project) => {
    // project?.project_type === 'ufgs' ? navigate(`/project-logs?projectId=${project?.project_id}&customerId=${localStorage.getItem('roleId') === '0' ? state.customer_id : localStorage.getItem('userId')}&logType=Classified`, {
    project?.project_type === 'ufgs' ? navigate(`/project-logs?projectDetails=${project?.project_id},${localStorage.getItem('roleId') === '0' ? state.customer_id : localStorage.getItem('userId')},Classified`, {
      state: {
        project,
        projectId: project?.project_id,
        projectName: project?.project_name,
        customerId: localStorage.getItem('roleId') === '0' ? state.customer_id : localStorage.getItem('userId'),
        logType: 'Classified'
      },
    }) :
    navigate('/project-details', {
      state: { project, customerId: localStorage.getItem('roleId') === '0' ? state.customer_id : localStorage.getItem('userId') },
    });
  };
  const handleEdit = (project) => {
    setProject(project);
    toggleEditModal();
  };

  const handleArchiveProject = async (project) => {
    let errors = false;
    if (!errors) {
      try {
        const response = await axiosInstance({
          method: 'put',
          url: '/updateProject',
          data: {
            project_name: project.project_name,
            lead_contact: project.lead_contact,
            start_date: project?.start_date
              ? moment(
                new Date((project?.start_date).replaceAll('-', '/'))
              ).format('YYYY-MM-DD')
              : '',
            end_date: project?.end_date
              ? moment(
                new Date((project?.end_date).replaceAll('-', '/'))
              ).format('YYYY-MM-DD')
              : '',
            customer_id: localStorage.getItem('roleId') === '0' ? state.customer_id : localStorage.getItem('userId'),
            status: isArchived ? 'Active' : 'Archived',
            project_id: project.project_id,
          },
        });
        if (response.data) {
          console.log(response.data);
          setPageRefresh(!pageRefresh);
        }
      } catch (error) {
        console.log(error.message);
        toast.error('Something went wrong!', {
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
    <>
      <div className="page-wrap">
        <NavbarTop />
        <div className="page-wrap-content customer-projects-wrapper">
          <Header
            title={state?.customer_name || customerData?.customer_name}
            showBtn={roleId !== '6' && roleId !== '7' && 'Create New Project'}
            toggleModal={toggleModal}
            breadcrumb={'Project Details'}
          />

          <div className="customer-projects-content">
            <div className="customer-project-details">
              {/* when there are Zero Users */}
              {/* <a className='noprojects-wrapper d-flex align-items-center justify-content-center w-100' href='javascript:void(0);'>
                            <span className='d-flex align-items-center justify-content-center'><AddUser /> Create Users/Employees, then Add a Project</span>
                        </a> */}
              <div className="table-top-content">
                <div className="table-heading">
                  <h5 className="m-0">Projects List</h5>
                  <label className="table-entries">
                    Showing entries{' '}
                    <span className="showing-strong">
                      {currentItems.length}
                    </span>{' '}
                    of{' '}
                    <span className="showing-strong">{projectData.length}</span>
                    .
                  </label>
                </div>
                <div className="table-bulk-changes">
                  {roleId !== '6' && roleId !== '7' && <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={toggleEmployeeModal}
                  >
                    + Add Employee
                  </button>}
                </div>
                {roleId !== '6' && roleId !== '7' && <div style={{ marginLeft: '10px' }}>
                  <button
                    onClick={() => toggleArchive(!isArchived)}
                    type="button"
                    className="btn btn-secondary btn-sm"
                  >
                    {isArchived ? 'View Active' : 'View Archived'}
                  </button>
                </div>}
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
                  {project ?
                    <tbody>
                      {currentItems.map((project) => {
                        return (
                          <tr>
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
                            <td>{project.status}</td>
                            <td>{project.lead_contact}</td>
                            <td>{project.users}</td>
                            <td>{project.start_date}</td>
                            <td>{project.end_date}</td>
                            <td>
                              <div className="action-wrapper">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleLaunch(project)}
                                >
                                  Launch
                                </button>
                                {roleId !== '6' && roleId !== '7' && <><button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleEdit(project)}
                                >
                                  Edit
                                </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleArchiveProject(project)}
                                    disabled={isArchived && localStorage.getItem('roleId') !== '0'}
                                  >
                                    {!isArchived ? 'Archive' : 'Unarchive'}
                                  </button></>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    :
                    <tbody>
                      <tr>
                        <td className='text-center' colSpan={7}>No data</td>
                      </tr>
                    </tbody>
                  }
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
                pageRefresh={pageRefresh}
                setPageRefresh={setPageRefresh}
              />
              <CreateProject
                modal={modal}
                toggleModal={toggleModal}
                customer={state || customerData}
                pageRefresh={pageRefresh}
                setPageRefresh={setPageRefresh}
              />
              <EditProject
                modal={editModal}
                toggleModal={toggleEditModal}
                customer={state || customerData}
                project={project}
                pageRefresh={pageRefresh}
                setPageRefresh={setPageRefresh}
              />
            </div>
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

export default CustomerProjects;
