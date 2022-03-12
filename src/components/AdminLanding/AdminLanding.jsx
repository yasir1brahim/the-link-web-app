import React, { useState } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import PaginatedItems from '../shared/Pagination/Pagination';

import CreateCustomer from './createCustomer';

const Adminlanding = () => {
  const [modal, setModal] = useState(false);
  const toggleModal = () => setModal(!modal);

  return (
    <div className="page-wrap">
      <NavbarTop />
      <div className="page-wrap-content admin-landing-wrapper">
        <Header title={'Customers'} toggleModal={toggleModal} />

        <div className="admin-landing-content">
          <div className="table-top-content">
            <label className="table-entries">
              Showing entries<span className="showing-strong">6 </span>
              of <span className="showing-strong">90</span>.
            </label>
            <div className="table-bulk-changes">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={toggleModal}
              >
                Archieve
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
                  <td>Whiting Turner</td>
                  <td>Active</td>
                  <td>3</td>
                  <td>10</td>
                  <td>01/20/2022</td>
                  <td>--</td>
                  <td>
                    <div className="action-wrapper">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                      >
                        View Customer
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="ticket-checkbox">
                    <div className="form-group">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          checked
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
                  <td>Whiting Turner</td>
                  <td>Active</td>
                  <td>3</td>
                  <td>10</td>
                  <td>01/20/2022</td>
                  <td>--</td>
                  <td>
                    <div className="action-wrapper">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                      >
                        View Customer
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="ticket-checkbox">
                    <div className="form-group">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          checked
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
                  <td>Whiting Turner</td>
                  <td>Active</td>
                  <td>3</td>
                  <td>10</td>
                  <td>01/20/2022</td>
                  <td>--</td>
                  <td>
                    <div className="action-wrapper">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                      >
                        View Customer
                      </button>
                    </div>
                  </td>
                </tr>
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
                  <td>Whiting Turner</td>
                  <td>Active</td>
                  <td>3</td>
                  <td>10</td>
                  <td>01/20/2022</td>
                  <td>--</td>
                  <td>
                    <div className="action-wrapper">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                      >
                        View Customer
                      </button>
                    </div>
                  </td>
                </tr>
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
                  <td>Whiting Turner</td>
                  <td>Active</td>
                  <td>3</td>
                  <td>10</td>
                  <td>01/20/2022</td>
                  <td>--</td>
                  <td>
                    <div className="action-wrapper">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                      >
                        View Customer
                      </button>
                    </div>
                  </td>
                </tr>
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
                  <td>Whiting Turner</td>
                  <td>Active</td>
                  <td>3</td>
                  <td>10</td>
                  <td>01/20/2022</td>
                  <td>--</td>
                  <td>
                    <div className="action-wrapper">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                      >
                        View Customer
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="table-footer-content">
            <PaginatedItems itemsPerPage={4} />
          </div>
        </div>
      </div>
      <CreateCustomer modal={modal} toggleModal={toggleModal} />
    </div>
  );
};

export default Adminlanding;
