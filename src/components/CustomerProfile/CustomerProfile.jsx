import React, { useState }  from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import WhitingTurner from '../../assets/images/whiting-turner.svg';
import { ReactComponent as AddUser } from '../../assets/images/circle-add.svg';
import ProfilePhoto from "../../assets/images/dummy-profile.svg";
import { ReactComponent as Camera } from "../../assets/images/camera.svg";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";
import PaginatedItems from '../shared/Pagination/Pagination';


const CustomerProfile = () => {

    const [editProfile, setEditProfile] = useState(false);
    const toggleEditProfile = () => setEditProfile(!editProfile);

    const [modal, setModal] = useState(false);
    const toggleModal = () => setModal(!modal);

    const [resetPwd, setResetPwd] = useState(false);
    const toggleResetPwd = () => setResetPwd(!resetPwd);
    return (
        <div className='page-wrap'>
            <NavbarTop/>
            <div className='page-wrap-content customer-profile-wrapper'>
                <Header title={"Customer Profile"} />

                <div className='customer-profile-content'>
                    <div className='customer-profile-details d-flex align-items-start justify-content-start flex-wrap'>
                        {
                            !editProfile ?
                            <>
                                <div className='customer-dp-container'>
                                    <img src={WhitingTurner} alt="Company Logo" />
                                </div>
                                <div className='customer-profile'>
                                    <div className='row'>
                                        <div className='col-6'>
                                            <div className="text-label-value">
                                                <div className="text-label">Company Name: </div>
                                                <div className="text-value">Whiting Turner</div>
                                            </div>
                                        </div>
                                        <div className='col-6'>
                                            <div className="text-label-value">
                                                <div className="text-label">Account ID: </div>
                                                <div className="text-value">#3134443</div>
                                            </div>
                                        </div>
                                        <div className='col-6'>
                                            <div className="text-label-value">
                                                <div className="text-label">Account Owner: </div>
                                                <div className="text-value">John Doe</div>
                                            </div>
                                        </div>
                                        <div className='col-6'>
                                            <div className="text-label-value">
                                                <div className="text-label">Password: </div>
                                                <div className="text-value">**********</div>
                                            </div>
                                        </div>
                                        <div className='col-6'>
                                            <div className="text-label-value">
                                                <div className="text-label">Email ID: </div>
                                                <div className="text-value">johndoe@gmail.com</div>
                                            </div>
                                        </div>
                                        <div className='col-6'>
                                            <div className="text-label-value">
                                                <div className="text-label">Phone: </div>
                                                <div className="text-value">+(425) 555 0100, +(732) 622 4888</div>
                                            </div>
                                        </div>
                                        <div className='col-6'>
                                            <div className="text-label-value">
                                                <div className="text-label">Address: </div>
                                                <div className="text-value">Ms Alice Smith Apartment 1c 213, 
                                                        Derrick Street, Boston, MA 02130 USA. </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='customer-edit-container'>
                                    <button type="button" onClick={toggleEditProfile} className='btn btn-secondary btn-sm'>
                                        Edit
                                    </button>
                                </div>
                            </>
                            :
                            <form className="edit-customer-form w-100">
                                <div className='edit-customer-content'>
                                    <div className='ec-left'>
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
                                    <div className='ec-right'>
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
                                                    <label className="text-label" htmlFor="accountContact">Phone</label>
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
                                            <div className="col-12">
                                                <a onClick={toggleResetPwd} href='javascript:void(0);' className='pwd-link'>Reset Password?</a>
                                                {
                                                    resetPwd ? 
                                                    <div className='row'>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <input
                                                                    type="password" className="form-control" id="oldPassword"
                                                                    aria-describedby="oldPassword" placeholder="Enter" required
                                                                />
                                                                <label className="text-label" htmlFor="oldPassword">Old Password</label>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <input
                                                                    type="password" className="form-control" id="newPassword"
                                                                    aria-describedby="newPassword" placeholder="Enter" required
                                                                />
                                                                <label className="text-label" htmlFor="newPassword">New Password</label>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <input
                                                                    type="password" className="form-control" id="confirmNewPassword"
                                                                    aria-describedby="confirmNewPassword" placeholder="Enter" required
                                                                />
                                                                <label className="text-label" htmlFor="confirmNewPassword">Confirm New Password</label>
                                                            </div>
                                                        </div>
                                                    </div> : ''
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='ec-footerbtns d-flex align-items-center justify-content-end'>
                                    <button type="button" className='btn btn-secondary mr-3' onClick={toggleEditProfile}>Reset</button>
                                    <button type="button" className='btn btn-primary' onClick={toggleEditProfile}>Save</button>
                                </div>
                            </form>
                        }
                    </div>
                    <div className='customer-users-details'>
                        {/* when there are Zero Users */}
                        {/* <a onClick={toggleModal} className='nouser-wrapper d-flex align-items-center justify-content-center w-100' href='javascript:void(0);'>
                            <span className='d-flex align-items-center justify-content-center'><AddUser /> Add User/Employee</span>
                        </a> */}
                        <div className='table-top-content'>
                            <div className='table-heading'>
                                <h5 className='m-0'>Employee/User List</h5>
                                <label className='table-entries'>
                                    Showing entries <span className='showing-strong'>6 </span>
                                    of <span className='showing-strong'>90</span>.
                                </label>
                            </div>
                            <div className='table-bulk-changes'>
                                <button type='button' className='btn btn-secondary btn-sm' onClick={toggleModal}>+ Add User/Employee</button>
                            </div>
                        </div>
                        <div className="l-table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th><span className='has-sorting'>Employee Name <i className=''></i></span></th>
                                        <th><span className='has-sorting'>Contact Details<i className='sort-d'></i></span></th>
                                        <th><span className='has-sorting'>Associated Projects<i className='sort-i'></i></span></th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Stephen poppe</td>
                                        <td>
                                            Stephen.P@wt.com
                                                <br/>
                                            +(425) 555 0100
                                        </td>
                                        <td>
                                            625 Adams 
                                            <br/>
                                            Gimmy’s hospital
                                        </td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">View</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Edit</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Stephen poppe</td>
                                        <td>
                                            Stephen.P@wt.com
                                                <br/>
                                            +(425) 555 0100
                                        </td>
                                        <td>
                                            625 Adams 
                                            <br/>
                                            Gimmy’s hospital
                                        </td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">View</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Edit</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Stephen poppe</td>
                                        <td>
                                            Stephen.P@wt.com
                                                <br/>
                                            +(425) 555 0100
                                        </td>
                                        <td>
                                            625 Adams 
                                            <br/>
                                            Gimmy’s hospital
                                        </td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">View</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Edit</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Stephen poppe</td>
                                        <td>
                                            Stephen.P@wt.com
                                                <br/>
                                            +(425) 555 0100
                                        </td>
                                        <td>
                                            625 Adams 
                                            <br/>
                                            Gimmy’s hospital
                                        </td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">View</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Edit</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Stephen poppe</td>
                                        <td>
                                            Stephen.P@wt.com
                                                <br/>
                                            +(425) 555 0100
                                        </td>
                                        <td>
                                            625 Adams 
                                            <br/>
                                            Gimmy’s hospital
                                        </td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">View</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Edit</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Stephen poppe</td>
                                        <td>
                                        Stephen.P@wt.com
                                            <br/>
                                        +(425) 555 0100
                                        </td>
                                        <td>
                                            625 Adams 
                                            <br/>
                                            Gimmy’s hospital
                                        </td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">View</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Edit</button>
                                                <button type="button" className="btn btn-secondary btn-sm">Delete</button>
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
            <Modal isOpen={modal} fade={false} toggle={toggleModal} className="new-user modal-lg">
                <ModalHeader toggle={toggleModal}>Add User/Employee</ModalHeader>
                <ModalBody>
                    <form className="create-user-form">
                        <div className='create-user-content'>
                            <div className="row">
                                <div className="col-4">
                                    <div className="form-group">
                                        <input
                                            type="text" className="form-control" id="userFirstName"
                                            aria-describedby="userFirstName" placeholder="Enter" required
                                        />
                                        <label className="text-label" htmlFor="userFirstName">First Name</label>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <input
                                            type="text" className="form-control" id="userLastName"
                                            aria-describedby="userLastName" placeholder="Enter" required
                                        />
                                        <label className="text-label" htmlFor="userLastName">Last Name</label>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <input
                                            type="email" className="form-control" id="userEmailAddress"
                                            aria-describedby="userEmailAddress" placeholder="Enter" required
                                        />
                                        <label className="text-label" htmlFor="userEmailAddress">Email Address</label>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <input
                                            type="text" className="form-control" id="userPhone"
                                            aria-describedby="userPhone" placeholder="Enter" required
                                        />
                                        <label className="text-label" htmlFor="userPhone">Phone</label>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <SelectDropdown
                                            label={"Projects Associated"}
                                            labelKey="name"
                                        />
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

export default CustomerProfile;
