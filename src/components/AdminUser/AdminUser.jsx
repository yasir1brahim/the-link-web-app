import React, { useState, useEffect } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import Loader from '../shared/Loader/Loader';
import PaginatedItems from '../shared/Pagination/Pagination';
import classnames from "classnames";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
import UpdateListing from './UpdateListing';
import DetailInfo from './DetailInfo';

const AdminUser = (props) => {
  const [modal, setModal] = useState(false);
  const toggleModal = () => setModal(!modal);

  const [updateListModal, setUpdateListModal] = useState(false);
  const toggleUpdateList = () => setUpdateListModal(!updateListModal);

  const [detailInfoModal, setDetailInfoModal] = useState(false);
  const toggleDetailInfo = () => setDetailInfoModal(!detailInfoModal);

  // tab functions
  const [activeTab, setActiveTab] = useState('employees');
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const [isLoading, setLoading] = useState(false);
  return (
    <div>
      <div className="page-wrap">
        <NavbarTop />
        <div className="page-wrap-content admin-user-wrapper">
          <Header
            title={'Admin Portal'}
            toggleModal={toggleModal}
          // showBtn={'Create New Customer'}
          />

          <div className='company-search-wrapper'>
            <form className='company-search-form'>
              <div className='row'>
                <div className='col-4'>
                  <div className='form-group'>
                    <SelectDropdown
                      label={'Select Company'}
                      options={[
                        { id: 1, label: 'Company One' },
                        { id: 2, label: 'Company Two' }
                      ]}
                    />
                  </div>
                </div>
                <div className='col-4'>
                  <button type="button" className='btn btn-primary'>Search</button>
                </div>
              </div>
            </form>
          </div>

          <div className="nav-tabs-wrapper">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === 'employees' })}
                  onClick={() => {
                    toggle('employees');
                  }}
                >
                  Employees(15)
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === 'projects' })}
                  onClick={() => {
                    toggle('projects');
                  }}
                >
                  Projects(30)
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId={'employees'}>
                <div className="admin-user-content">
                  <div className="table-top-content">
                    <label className="table-entries">
                      Showing entries
                      <span className="showing-strong"> 3 </span>
                      of{' '}
                      <span className="showing-strong"> 10</span>.
                    </label>
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
                              Status <i className="sort-d"></i>
                            </span>
                          </th>
                          <th>
                            <span>
                              Associated Projects <i className="sort-i"></i>
                            </span>
                          </th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <a href="javascript:void(0);" onClick={toggleDetailInfo}>
                              Stephen poppe
                            </a>
                          </td>
                          <td>
                            <span className='item-status item-status-active'>Active</span>
                          </td>
                          <td>
                            <div className='tags-wrapper'>
                              <span className='item-tag'>
                                625 Adams
                                <a className='icon-close'></a>
                              </span>,
                              <span className='item-tag'>
                                625 Adams
                                <a className='icon-close'></a>
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="action-wrapper">
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={toggleUpdateList}
                              >
                                Add Projects
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                              >
                                Reset Password
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                              >
                                Deactivate
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* <div className="table-footer-content">
                    <PaginatedItems
                      items='5'
                      itemsPerPage='10'
                    />
                  </div> */}
                </div>
              </TabPane>
              <TabPane tabId={'projects'}>
                Projects - please replicate from Employees Part
              </TabPane>
            </TabContent>
          </div>
        </div>
        <UpdateListing
          updateListModal={updateListModal}
          toggleUpdateList={toggleUpdateList}
        />
        <DetailInfo
          detailInfoModal={detailInfoModal}
          toggleDetailInfo={toggleDetailInfo}
        />
      </div>
      {/* <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}
      <Loader showComponentLoader={isLoading} />
    </div>
  );
};

export default AdminUser;
