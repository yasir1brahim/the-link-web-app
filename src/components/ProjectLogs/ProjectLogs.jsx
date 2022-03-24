import React from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import PaginatedItems from '../shared/Pagination/Pagination';
import { ReactComponent as Trash } from '../../assets/images/trash.svg';

const ProjectLogs = () => {

    return (
        <div className='page-wrap'>
            <NavbarTop/>
            <div className='page-wrap-content project-logs-wrapper'>
                <Header title={"Submittal Logs - 625 Adams St."} />

                <div className='project-logs-content'>
                    <div className='project-logs'>
                        {/* when there are Zero Users */}
                        {/* <a className='nologs-wrapper d-flex align-items-center justify-content-center w-100' href='javascript:void(0);'>
                            <span className='d-flex align-items-center justify-content-center'><AddUser /> Please upload documents, before seeing the logs</span>
                        </a> */}
                        <div className='table-top-content'>
                            <div className='table-heading'>
                                <h5 className='m-0'>Logs List</h5>
                                <label className='table-entries'>
                                    Showing entries <span className='showing-strong'>6 </span>
                                    of <span className='showing-strong'>90</span>.
                                </label>
                            </div>
                            <div className='table-bulk-changes'>
                                <div className='log-search'>
                                    <input type="text" placeholder='Find In Log' className='search-icon log-search-input' />
                                </div>
                                <button type='button' className='btn btn-secondary btn-sm'>Export CSV</button>
                                <button type='button' className='d-flex btn btn-secondary btn-sm'> <Trash/> </button>
                            </div>
                        </div>
                        <div className="l-table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="ticket-checkbox">
                                            <div className="form-group">
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" name="ticketHeading" id="ticketHeading" />
                                                    <label className="custom-control-label" for="ticketHeading"></label>
                                                </div>
                                            </div>
                                        </th>
                                        <th><span className='has-sorting'>Spec Section <i className=''></i></span></th>
                                        <th><span className='has-sorting'>Sub Section <i className='sort-d'></i></span></th>
                                        <th><span className='has-sorting'>Type <i className='sort-i'></i></span></th>
                                        <th><span>Description </span></th>
                                        <th><span className='has-sorting'>Status <i className='sort-d'></i></span></th>
                                        <th><span className='has-sorting'>Date Issued <i className='sort-d'></i></span></th>
                                        <th><span className='has-sorting'>Date Approved <i className='sort-d'></i></span></th>
                                        <th><span>Comments</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="ticket-checkbox">
                                            <div className="form-group">
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                                                    <label className="custom-control-label" for="ticketRow1"></label>
                                                </div>
                                            </div>
                                        </td>
                                        <td>08 9000</td>
                                        <td>1.04</td>
                                        <td>Shop Drawings</td>
                                        <td>Show fabrication anad Lorel Ipsum Dorel Lorel Ipsum.</td>
                                        <td>Open</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            Completed the welding and left with Buffing.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="ticket-checkbox">
                                            <div className="form-group">
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                                                    <label className="custom-control-label" for="ticketRow1"></label>
                                                </div>
                                            </div>
                                        </td>
                                        <td>08 9000</td>
                                        <td>1.04</td>
                                        <td>Shop Drawings</td>
                                        <td>Show fabrication anad Lorel Ipsum Dorel Lorel Ipsum.</td>
                                        <td>Open</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            Completed the welding and left with Buffing.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="ticket-checkbox">
                                            <div className="form-group">
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                                                    <label className="custom-control-label" for="ticketRow1"></label>
                                                </div>
                                            </div>
                                        </td>
                                        <td>08 9000</td>
                                        <td>1.04</td>
                                        <td>Shop Drawings</td>
                                        <td>Show fabrication anad Lorel Ipsum Dorel Lorel Ipsum.</td>
                                        <td>Open</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            Completed the welding and left with Buffing.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="ticket-checkbox">
                                            <div className="form-group">
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                                                    <label className="custom-control-label" for="ticketRow1"></label>
                                                </div>
                                            </div>
                                        </td>
                                        <td>08 9000</td>
                                        <td>1.04</td>
                                        <td>Shop Drawings</td>
                                        <td>Show fabrication anad Lorel Ipsum Dorel Lorel Ipsum.</td>
                                        <td>Open</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            Completed the welding and left with Buffing.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="ticket-checkbox">
                                            <div className="form-group">
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                                                    <label className="custom-control-label" for="ticketRow1"></label>
                                                </div>
                                            </div>
                                        </td>
                                        <td>08 9000</td>
                                        <td>1.04</td>
                                        <td>Shop Drawings</td>
                                        <td>Show fabrication anad Lorel Ipsum Dorel Lorel Ipsum.</td>
                                        <td>Open</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            Completed the welding and left with Buffing.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="ticket-checkbox">
                                            <div className="form-group">
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                                                    <label className="custom-control-label" for="ticketRow1"></label>
                                                </div>
                                            </div>
                                        </td>
                                        <td>08 9000</td>
                                        <td>1.04</td>
                                        <td>Shop Drawings</td>
                                        <td>Show fabrication anad Lorel Ipsum Dorel Lorel Ipsum.</td>
                                        <td>Open</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            Completed the welding and left with Buffing.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="ticket-checkbox">
                                            <div className="form-group">
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                                                    <label className="custom-control-label" for="ticketRow1"></label>
                                                </div>
                                            </div>
                                        </td>
                                        <td>08 9000</td>
                                        <td>1.04</td>
                                        <td>Shop Drawings</td>
                                        <td>Show fabrication anad Lorel Ipsum Dorel Lorel Ipsum.</td>
                                        <td>Open</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            Completed the welding and left with Buffing.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className='table-footer-content'>
                            <button type='button' className='btn btn-secondary btn-sm'>Back</button>
                            <PaginatedItems itemsPerPage={4} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectLogs;
