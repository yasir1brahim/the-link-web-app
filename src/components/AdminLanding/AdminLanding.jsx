import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axios';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import PaginatedItems from '../shared/Pagination/Pagination';
import CreateCustomer from './createCustomer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Adminlanding = (props) => {
  const [modal, setModal] = useState(false);
  const [isArchived, toggleArchive] = useState(false);
  const [customerData, setCustomerData] = useState([]);
  const toggleModal = () => setModal(!modal);
  const [pageRefresh, setPageRefresh] = useState(false);
  const [currentItems, setCurrentItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/customers/${localStorage.getItem('userId')}`,
      });
      setCustomerData(
        isArchived ? response.data.archived_customers : response.data.message
      );
      localStorage.setItem('account_id', response.data.account_id);
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
  }, [isArchived, pageRefresh]);

  const handleViewCustomer = (customer) => {
    navigate('/customer-profile', { state: customer });
  };

  const handleViewProjects = (customer) => {
    navigate('/project-list', { state: customer });
  };

  return (
    <>
      <div className="page-wrap">
        <NavbarTop />
        <div className="page-wrap-content admin-landing-wrapper">
          <Header
            title={'Customers'}
            toggleModal={toggleModal}
            showBtn={'Create New Customer'}
          />

          <div className="admin-landing-content">
            <div className="table-top-content">
              <label className="table-entries">
                Showing entries
                <span className="showing-strong">{currentItems.length}</span>
                of <span className="showing-strong">{customerData.length}</span>
                .
              </label>
              <div className="table-bulk-changes">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => toggleArchive(!isArchived)}
                >
                  Archived
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
                        Customers <i className=""></i>
                      </span>
                    </th>
                    <th>
                      <span className="has-sorting">
                        Status<i className="sort-d"></i>
                      </span>
                    </th>
                    <th>
                      <span className="has-sorting">
                        Projects<i className="sort-i"></i>
                      </span>
                    </th>
                    <th>
                      <span className="has-sorting">
                        Users<i className="sort-i"></i>
                      </span>
                    </th>
                    {/* <th>
                      <span className="has-sorting">
                        Start Date<i className="sort-d"></i>
                      </span>
                    </th>
                    <th>
                      <span className="has-sorting">
                        End Date<i className="sort-d"></i>
                      </span>
                    </th> */}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((customer) => {
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
                              {/* @ts-ignore */}
                              <label
                                className="custom-control-label"
                                for="ticketRow1"
                              ></label>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                            onClick={() => handleViewCustomer(customer)}
                          >
                            {customer.customer_name}
                          </span>
                        </td>
                        <td>{customer.status}</td>
                        <td>{customer.projects}</td>
                        <td>{customer.users}</td>
                        {/* <td>
                          {customer.start_date ? customer.start_date : '--'}
                        </td>
                        <td>--</td> */}
                        <td>
                          <div className="action-wrapper">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleViewProjects(customer)}
                            >
                              View Projects
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
                items={customerData}
                setCurrentItems={setCurrentItems}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
              />
            </div>
          </div>
        </div>
        <CreateCustomer
          modal={modal}
          toggleModal={toggleModal}
          setPageRefresh={setPageRefresh}
          pageRefresh={pageRefresh}
        />
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

export default Adminlanding;
