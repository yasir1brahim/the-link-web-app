import React, { useEffect, useState } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import WhitingTurner from '../../assets/images/whiting-turner.svg';
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

const CustomerProjects = (props) => {
  const [modal, setModal] = useState(false);
  const toggleModal = () => setModal(!modal);
  const [projectData, setProjectData] = useState([]);
  const { state } = useLocation();
  // const customer = state;

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/projects/${state.customer_id}`,
      });
      setProjectData(response.data.message);
      console.log(response.data.message);
    };

    fetchData().catch(console.error);
  }, [state]);

  const handleArchive = () => {};

  return (
    <div className="page-wrap">
      <NavbarTop />
      <div className="page-wrap-content customer-projects-wrapper">
        <Header
          title={'Whiting Turner'}
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
                  Showing entries <span className="showing-strong">6 </span>
                  of <span className="showing-strong">90</span>.
                </label>
              </div>
              <div className="table-bulk-changes">
                <button
                  onClick={handleArchive}
                  type="button"
                  className="btn btn-secondary btn-sm"
                >
                  Archive
                </button>
              </div>
            </div>
            <div className="l-table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th className="ticket-checkbox">
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
                    </th>
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
                  {projectData.map((project) => {
                    return (
                      <tr>
                        <td className="ticket-checkbox">
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
                        </td>
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
                            >
                              Launch
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={toggleModal}
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
              <PaginatedItems itemsPerPage={4} />
            </div>
            <CreateProject
              modal={modal}
              toggleModal={toggleModal}
              customer={state}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProjects;
