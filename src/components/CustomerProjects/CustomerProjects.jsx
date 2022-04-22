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

const CustomerProjects = (props) => {
  const [modal, setModal] = useState(false);
  const [employeeModal, setEmployeeModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  // const [isArchived, toggleArchive] = useState(false);
  const toggleModal = () => setModal(!modal);
  const toggleEditModal = () => setEditModal(!editModal);
  const toggleEmployeeModal = () => setEmployeeModal(!employeeModal);
  const [projectData, setProjectData] = useState([]);
  const [project, setProject] = useState({});
  const [pageRefresh, setPageRefresh] = useState(false);
  const [currentItems, setCurrentItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { state } = useLocation();
  // const customer = state;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/projects/${state.customer_id}`,
      });
      setProjectData(response.data.message);
      // setProjectData(
      //   isArchived ? response.data.archived_projects : response.data.message
      // );
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

  const handleLaunch = (project) => {
    navigate('/project-details', { state: project });
  };
  const handleEdit = (project) => {
    setProject(project);
    toggleEditModal();
  };

  return (
    <>
      <div className="page-wrap">
        <NavbarTop />
        <div className="page-wrap-content customer-projects-wrapper">
          <Header
            title={state?.customer_name}
            showBtn={'Create New Project'}
            toggleModal={toggleModal}
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
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={toggleEmployeeModal}
                  >
                    + Add Employee
                  </button>
                </div>
                {/* <div className="table-bulk-changes">
                  <button
                    onClick={() => toggleArchive(!isArchived)}
                    type="button"
                    className="btn btn-secondary btn-sm"
                  >
                    Archived
                  </button>
                </div> */}
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
                        <span className="has-sorting">
                          Existing Projects <i className=""></i>
                        </span>
                      </th>
                      <th>
                        <span className="has-sorting">
                          Status<i className="sort-d"></i>
                        </span>
                      </th>
                      <th>
                        <span className="has-sorting">
                          Lead Contact<i className="sort-i"></i>
                        </span>
                      </th>
                      <th>
                        <span className="has-sorting">
                          Users<i className="sort-i"></i>
                        </span>
                      </th>
                      <th>
                        <span className="has-sorting">
                          Start Date<i className="sort-d"></i>
                        </span>
                      </th>
                      <th>
                        <span className="has-sorting">
                          End Date<i className="sort-d"></i>
                        </span>
                      </th>
                      <th>Action</th>
                    </tr>
                  </thead>
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
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleEdit(project)}
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
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
                customer={state}
                pageRefresh={pageRefresh}
                setPageRefresh={setPageRefresh}
              />
              <CreateProject
                modal={modal}
                toggleModal={toggleModal}
                customer={state}
                pageRefresh={pageRefresh}
                setPageRefresh={setPageRefresh}
              />
              <EditProject
                modal={editModal}
                toggleModal={toggleEditModal}
                customer={state}
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
