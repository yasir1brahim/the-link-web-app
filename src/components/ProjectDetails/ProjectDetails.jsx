import React, { useState }  from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import { ReactComponent as Upload } from "../../assets/images/upload.svg";
import { ReactComponent as FileDocument } from "../../assets/images/file-document.svg";
import { ReactComponent as Close } from "../../assets/images/close.svg";
import { ReactComponent as Error } from "../../assets/images/error.svg";
import { ReactComponent as Success } from "../../assets/images/circle-success.svg";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


const ProjectsDetails = () => {

    const [modal, setModal] = useState(false);
    const toggleModal = () => setModal(!modal);

    return (
        <div className='page-wrap'>
            <NavbarTop/>
            <div className='page-wrap-content projects-details-wrapper'>
                <Header title={"Project Details - 625 Adams St."} showBtn={'Upload Document'} />

                <div className='projects-details-content'>
                    <div className='project-details'>
                        {/* when there are Zero Users */}
                        {/* <a className='noprojects-wrapper d-flex align-items-center justify-content-center w-100' href='javascript:void(0);'>
                            <span className='d-flex align-items-center justify-content-center'><AddUser /> Create Users/Employees, then Add a Project</span>
                        </a> */}
                        <div className="l-table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th><span className='has-sorting'>Types <i className=''></i></span></th>
                                        <th><span className='has-sorting'>Status<i className='sort-d'></i></span></th>
                                        <th><span className='has-sorting'>Logs Created<i className='sort-i'></i></span></th>
                                        <th><span className='has-sorting'>Total Logs<i className='sort-i'></i></span></th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Submittals</td>
                                        <td>Open</td>
                                        <td>Yes</td>
                                        <td>700</td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">View Logs</button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Close Out</td>
                                        <td>In Progress</td>
                                        <td>Yes</td>
                                        <td>1</td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">View Logs</button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className='row-no-logs'>
                                        <td>Testings</td>
                                        <td>--</td>
                                        <td>No</td>
                                        <td>0</td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">View Logs</button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Meetings</td>
                                        <td>Rejected</td>
                                        <td>Yes</td>
                                        <td>236</td>
                                        <td>
                                            <div className="action-wrapper">
                                                <button type="button" className="btn btn-secondary btn-sm">View Logs</button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className='table-footer-content'>
                            <button type="button" onClick={toggleModal} className="btn btn-secondary btn-sm">View Logs</button>
                            <p>Documents Uploaded: <span>05</span></p>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={modal} fade={false} toggle={toggleModal} className="upload-doc-popup modal-lg">
                <ModalHeader toggle={toggleModal}>Upload Document</ModalHeader>
                <ModalBody>
                    {/* Upload form code */}
                    {/* <form className="upload-document-form">
                        <div className='upload-document-content'>
                            <div className="select-File">
                                <input className="d-none" type="file" name="files[]" id="uploadDocs" />
                                <label htmlFor="uploadDocs">
                                    <div className='upload-text d-flex align-items-center justify-content-center'>
                                        <Upload />
                                        <small>Select a File</small>
                                        <span className='text-center'>
                                            Click to browse or drop here to upload. Supported Formats: Excel, csv, xml. 
                                            <br/>
                                            Maximum Individual File size: 100 MB
                                        </span>
                                    </div>
                                </label>
                            </div>

                            <div className='uploaded-file-list'>
                                <div className='uploaded-file d-flex align-items-center justify-content-center'>
                                    <FileDocument />
                                    <div className='file-name ml-3 d-flex align-items-start flex-column justify-content-center'>
                                        <span>Template01.xls</span>
                                        <small>399KB</small>
                                    </div>
                                    <a href="javascript:void(0);" className='ml-auto'><Close /></a>
                                </div>
                                <div className='uploaded-file d-flex align-items-center justify-content-center'>
                                    <FileDocument />
                                    <div className='file-name ml-3 d-flex align-items-start flex-column justify-content-center'>
                                        <span>Template01.xls</span>
                                        <small>399KB</small>
                                    </div>
                                    <a href="javascript:void(0);" className='ml-auto'><Close /></a>
                                </div>
                            </div>
                            <button type='button' className='btn btn-secondary btn-sm mb-4 ml-auto'>Upload</button>
                        </div>
                        <ModalFooter>
                            <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                            <Button color="primary" onClick={toggleModal}>Proceed</Button>{' '}
                        </ModalFooter>
                    </form> */}
                    {/* Upload form code */}

                    {/* Error Upload code */}
                    {/* <div className='error-upload text-center'>
                        <Error />
                        <h5>Error</h5>
                        <p>This file is already there in our data base, try uploading new file.</p>
                        <button type='button' className='d-inline-block btn btn-primary'>Go back to Upload</button>
                    </div> */}
                    {/* Error Upload code */}

                    {/* Success Upload code */}
                    <div className='success-upload text-center'>
                        <Success />
                        <h5>Success</h5>
                        <p>Your file has been succesfully parsed.</p>
                        <ul class="doc-content-table">
                            <li className='doc-content-heading'>
                                <span>Type</span>
                                <span>Total Logs</span>
                            </li>
                            <li className='doc-content-list'>
                                <span>Submittals</span>
                                <span>700</span>
                            </li>
                            <li className='doc-content-list'>
                                <span>Testings</span>
                                <span>20</span>
                            </li>
                            <li className='doc-content-list'>
                                <span>Meetings</span>
                                <span>36</span>
                            </li>
                            <li className='doc-content-list'>
                                <span>Closeouts</span>
                                <span>121</span>
                            </li>
                        </ul>
                        <div className='text-right'>
                            <button type='button' onClick={toggleModal} className='d-inline-block btn btn-secondary mr-3'>Cancel</button>
                            <button type='button' onClick={toggleModal} className='d-inline-block btn btn-primary'>Save</button>
                        </div>
                    </div>
                    {/* Success Upload code */}

                </ModalBody>
            </Modal>
        </div>
    );
}

export default ProjectsDetails;
