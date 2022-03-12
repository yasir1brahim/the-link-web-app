import React, { useState }  from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import WhitingTurner from '../../assets/images/whiting-turner.svg';
import { ReactComponent as AddUser } from '../../assets/images/circle-add.svg';
import ProfilePhoto from "../../assets/images/dummy-profile.svg";
import { ReactComponent as Camera } from "../../assets/images/camera.svg";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";
import DateSelector from "../shared/DateSelector/DateSelector";
import PaginatedItems from '../shared/Pagination/Pagination';


const CustomerProjects = () => {

    const [modal, setModal] = useState(false);
    const toggleModal = () => setModal(!modal);

    return (
        <div className='page-wrap'>
            <NavbarTop/>
            <div className='page-wrap-content customer-projects-wrapper'>
                <Header title={"Whiting Turner"} showBtn={'Create New Project'} />

                <div className='customer-projects-content'>
                    <div className='customer-project-details'>
                        {/* when there are Zero Users */}
                        {/* <a className='noprojects-wrapper d-flex align-items-center justify-content-center w-100' href='javascript:void(0);'>
                            <span className='d-flex align-items-center justify-content-center'><AddUser /> Create Users/Employees, then Add a Project</span>
                        </a> */}
                        <div className='table-top-content'>
                            <div className='table-heading'>
                                <h5 className='m-0'>Projects List</h5>
                                <label className='table-entries'>
                                    Showing entries <span className='showing-strong'>6 </span>
                                    of <span className='showing-strong'>90</span>.
                                </label>
                            </div>
                            <div className='table-bulk-changes'>
                                <button onClick={toggleModal} type='button' className='btn btn-secondary btn-sm'>Archive</button>
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
                                        <th><span className='has-sorting'>Existing Projects <i className=''></i></span></th>
                                        <th><span className='has-sorting'>Status<i className='sort-d'></i></span></th>
                                        <th><span className='has-sorting'>Lead Contact<i className='sort-i'></i></span></th>
                                        <th><span className='has-sorting'>Users<i className='sort-i'></i></span></th>
                                        <th><span className='has-sorting'>Start Date<i className='sort-d'></i></span></th>
                                        <th><span className='has-sorting'>End Date<i className='sort-d'></i></span></th>
                                        <th>Action</th>
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
                                        <td>625 Adams</td>
                                        <td>In Progress</td>
                                        <td>Frankie Johnny</td>
                                        <td>10</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">Launch</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Edit</button>
                                            </div>
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
                                        <td>625 Adams</td>
                                        <td>In Progress</td>
                                        <td>Frankie Johnny</td>
                                        <td>10</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">Launch</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Edit</button>
                                            </div>
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
                                        <td>625 Adams</td>
                                        <td>In Progress</td>
                                        <td>Frankie Johnny</td>
                                        <td>10</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">Launch</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Edit</button>
                                            </div>
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
                                        <td>625 Adams</td>
                                        <td>In Progress</td>
                                        <td>Frankie Johnny</td>
                                        <td>10</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">Launch</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Edit</button>
                                            </div>
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
                                        <td>625 Adams</td>
                                        <td>In Progress</td>
                                        <td>Frankie Johnny</td>
                                        <td>10</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">Launch</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Edit</button>
                                            </div>
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
                                        <td>625 Adams</td>
                                        <td>In Progress</td>
                                        <td>Frankie Johnny</td>
                                        <td>10</td>
                                        <td>01/20/2022</td>
                                        <td>02/20/2022</td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">Launch</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Edit</button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className='table-footer-content'>
                            <PaginatedItems itemsPerPage={4} />
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={modal} fade={false} toggle={toggleModal} className="new-project modal-lg">
                <ModalHeader toggle={toggleModal}>Create New Project</ModalHeader>
                <ModalBody>
                    <form className="create-project-form">
                        <div className='customer-profile-details d-flex align-items-start justify-content-start flex-wrap'>
                            <div className='customer-dp-container'>
                                <img src={WhitingTurner} alt="Company Logo" />
                            </div>
                            <div className='customer-profile'>
                                <div className='row'>
                                    <div className='col-12'>
                                        <div className="text-label-value">
                                            <div className="text-value">Whiting Turner</div>
                                        </div>
                                    </div>
                                    <div className='col-12'>
                                        <div className="text-label-value">
                                            <div className="text-label">Ms Alice Smith Apartment 1c 213,<br/> 
                                                    Derrick Street, Boston, MA 02130 USA. </div>
                                        </div>
                                    </div>
                                    <div className='col-12'>
                                        <div className="text-label-value">
                                            <div className="text-label">+(425) 555 0100, +(732) 622 4888</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='create-project-content'>
                            <div className="row">
                                <div className="col-4">
                                    <div className="form-group">
                                        <input
                                            type="text" className="form-control" id="customerProjectName"
                                            aria-describedby="customerProjectName" placeholder="Enter" required
                                        />
                                        <label className="text-label" htmlFor="customerProjectName">Project Name</label>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <SelectDropdown
                                            label={"Lead Contact"}
                                            labelKey="name"
                                        />
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <input
                                            type="email" className="form-control" id="projectLeadEmail"
                                            aria-describedby="projectLeadEmail" placeholder="Enter" required
                                        />
                                        <label className="text-label" htmlFor="projectLeadEmail">Email Address(Lead Contact)</label>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <DateSelector
                                            isClearable={false}
                                            placeholderText="Start Date"
                                            labelText="Start Date"
                                        />
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <DateSelector
                                            isClearable={false}
                                            placeholderText="End Date"
                                            labelText="End Date"
                                        />
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <SelectDropdown
                                            label={"Project Type"}
                                            labelKey="name"
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className='users-section'>
                                        <ul>
                                            <li>
                                                <div className='row'>
                                                    <div className='col-4'>
                                                        <div className="form-group">
                                                            <SelectDropdown
                                                                label={"User Name"}
                                                                labelKey="name"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className='col-4'>
                                                        <div className="form-group">
                                                            <input
                                                                type="text" className="form-control" id="userEmailAddress"
                                                                aria-describedby="userEmailAddress" placeholder="Enter" required
                                                            />
                                                            <label className="text-label" htmlFor="userEmailAddress">Email Address(user)</label>
                                                        </div>
                                                    </div>
                                                    <div className='col-4'>
                                                        <div className='d-flex align-itms-center justify-content-start mt-3'>
                                                            <button type='button' className='btn btn-secondary btn-sm mr-2'>Delete</button>
                                                            <button type='button' className='btn btn-primary btn-sm'>Add User</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                            <li>
                                                <div className='row'>
                                                    <div className='col-4'>
                                                        <div className="form-group">
                                                            <SelectDropdown
                                                                label={"User Name"}
                                                                labelKey="name"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className='col-4'>
                                                        <div className="form-group">
                                                            <input
                                                                type="text" className="form-control" id="userEmailAddress"
                                                                aria-describedby="userEmailAddress" placeholder="Enter" required
                                                            />
                                                            <label className="text-label" htmlFor="userEmailAddress">Email Address(user)</label>
                                                        </div>
                                                    </div>
                                                    <div className='col-4'>
                                                        <div className='d-flex align-itms-center justify-content-start mt-3'>
                                                            <button type='button' className='btn btn-secondary btn-sm mr-2'>Delete</button>
                                                            <button type='button' className='btn btn-primary btn-sm'>Add User</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ModalFooter>
                            <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                            <Button color="primary" onClick={toggleModal}>Create</Button>{' '}
                        </ModalFooter>
                    </form>
                </ModalBody>
            </Modal>
        </div>
    );
}

export default CustomerProjects;
