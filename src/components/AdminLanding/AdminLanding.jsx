import React, { useState } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import PaginatedItems from '../shared/Pagination/Pagination';
import ProfilePhoto from "../../assets/images/dummy-profile.svg";
import {ReactComponent as Camera} from "../../assets/images/camera.svg";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const Adminlanding = () => {
    const [modal, setModal] = useState(false);
    const toggleModal = () => setModal(!modal);

    return (
        <div className='page-wrap'>
            <NavbarTop/>
            <div className='page-wrap-content admin-landing-wrapper'>
                <Header title={"Customers"} showBtn={true}/>
                
                <div className='admin-landing-content'>
                    <div className='table-top-content'>
                        <label className='table-entries'>
                            Showing entries<span className='showing-strong'>6 </span>
                            of <span className='showing-strong'>90</span>.
                        </label>
                        <div className='table-bulk-changes'>
                            <button type='button' className='btn btn-secondary btn-sm' onClick={toggleModal}>Archieve</button>
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
                                    <th><span className='has-sorting'>Customers <i className=''></i></span></th>
                                    <th><span className='has-sorting'>Status<i className='sort-d'></i></span></th>
                                    <th><span className='has-sorting'>Projects<i className='sort-i'></i></span></th>
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
                                                {/* @ts-ignore */}
                                                <label className="custom-control-label" for="ticketRow1"></label>
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
                                            <button type="button" className="btn btn-secondary btn-sm">View Customer</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ticket-checkbox">
                                        <div className="form-group">
                                            <div className="custom-control custom-checkbox">
                                                <input type="checkbox" checked className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                                                {/* @ts-ignore */}
                                                <label className="custom-control-label" for="ticketRow1"></label>
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
                                            <button type="button" className="btn btn-secondary btn-sm">View Customer</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ticket-checkbox">
                                        <div className="form-group">
                                            <div className="custom-control custom-checkbox">
                                                <input type="checkbox" checked className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                                                {/* @ts-ignore */}
                                                <label className="custom-control-label" for="ticketRow1"></label>
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
                                            <button type="button" className="btn btn-secondary btn-sm">View Customer</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ticket-checkbox">
                                        <div className="form-group">
                                            <div className="custom-control custom-checkbox">
                                                <input type="checkbox" className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                                                {/* @ts-ignore */}
                                                <label className="custom-control-label" for="ticketRow1"></label>
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
                                            <button type="button" className="btn btn-secondary btn-sm">View Customer</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ticket-checkbox">
                                        <div className="form-group">
                                            <div className="custom-control custom-checkbox">
                                                <input type="checkbox" className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                                                {/* @ts-ignore */}
                                                <label className="custom-control-label" for="ticketRow1"></label>
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
                                            <button type="button" className="btn btn-secondary btn-sm">View Customer</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="ticket-checkbox">
                                        <div className="form-group">
                                            <div className="custom-control custom-checkbox">
                                                <input type="checkbox" className="custom-control-input" name="ticketRow1" id="ticketRow1" />
                                                {/* @ts-ignore */}
                                                <label className="custom-control-label" for="ticketRow1"></label>
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
                                            <button type="button" className="btn btn-secondary btn-sm">View Customer</button>
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
            <Modal isOpen={modal} fade={false} toggle={toggleModal} className="new-customer modal-xl">
                <ModalHeader toggle={toggleModal}>Create New Customer</ModalHeader>
                <ModalBody>
                    <form className="create-customer-form">
                        <div className='create-customer-content'>
                            <div className='cc-left'>
                                <div className="upload-documents">
                                    <div className='image-holder'>
                                        <img src={ProfilePhoto} alt="Profile Photo" className='dummy-image'/>
                                        {/* <img src={ProfilePhoto} alt="Profile Photo" className='uploaded-image'/> */}
                                    </div>
                                    <div className="select-File">
                                        <input className="d-none" type="file" name="files[]" id="uploadDocs" />
                                        <label htmlFor="uploadDocs">
                                            <div className='upload-text d-flex align-items-center justify-content-center'>
                                                <Camera />
                                                <span>Upload Logo</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className='cc-right'>
                                <div className="row">
                                    <div className="col-4">
                                        <div className="form-group">
                                            <input
                                                type="text" className="form-control" id="companyName"
                                                aria-describedby="companyName" placeholder="Enter" required
                                            />
                                            <label className="text-label" htmlFor="companyName">Company Name</label>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-group">
                                            <input
                                                type="text" className="form-control" id="accountId"
                                                aria-describedby="accountId" placeholder="Enter" required
                                            />
                                            <label className="text-label" htmlFor="accountId">Account Id</label>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-group">
                                            <input
                                                type="text" className="form-control" id="accountOwner"
                                                aria-describedby="accountOwner" placeholder="Enter" required
                                            />
                                            <label className="text-label" htmlFor="accountOwner">Account Owner</label>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-group">
                                            <input
                                                type="email" className="form-control" id="accountEmail"
                                                aria-describedby="accountEmail" placeholder="Enter" required
                                            />
                                            <label className="text-label" htmlFor="accountEmail">Email Address</label>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-group">
                                            <input
                                                type="text" className="form-control" id="accountContact"
                                                aria-describedby="accountContact" placeholder="Enter" required
                                            />
                                            <label className="text-label" htmlFor="accountContact">Contact Number</label>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-group">
                                            <input
                                                type="text" className="form-control" id="accountPassword"
                                                aria-describedby="accountPassword" placeholder="Enter" required
                                            />
                                            <label className="text-label" htmlFor="accountPassword">Set Password</label>
                                        </div>
                                    </div>
                                    <div className="col-8">
                                        <div className="form-group">
                                            <input
                                                type="text" className="form-control" id="accountAddress"
                                                aria-describedby="accountAddress" placeholder="Enter" required
                                            />
                                            <label className="text-label" htmlFor="accountAddress">Address</label>
                                        </div>
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

export default Adminlanding;
