import React, { useState, useEffect } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import { ReactComponent as Upload } from '../../assets/images/upload.svg';
import { ReactComponent as FileDocument } from '../../assets/images/file-document.svg';
import { ReactComponent as Close } from '../../assets/images/close.svg';
import { ReactComponent as Error } from '../../assets/images/error.svg';
import { ReactComponent as Success } from '../../assets/images/circle-success.svg';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../config/axios';

const ProjectsDetails = () => {
  const [modal, setModal] = useState(false);
  const toggleModal = () => setModal(!modal);
  const { state } = useLocation();
  const [projectData, setProjectData] = useState([]);
  const [pdfFile, setPdfFile] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/project_data/${state?.project_id}`,
      });
      setProjectData(response.data.message);
      console.log(response.data.message);
    };

    fetchData().catch((error) => {
      toast.error(error.message, {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });
  }, [state]);

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append('project_id', state?.project_id);
      data.append('files', pdfFile);
      const response = await axiosInstance({
        method: 'post',
        url: '/upload_file',
        data,
      });
      if (response.data) {
        console.log(response.data);
      }
    } catch (error) {
      toast.error(error.message, {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <>
      <div className="page-wrap">
        <NavbarTop />
        <div className="page-wrap-content projects-details-wrapper">
          <Header
            title={`Project Details - ${state?.project_name || ''}`}
            showBtn={'Upload Document'}
            toggleModal={toggleModal}
          />

          <div className="projects-details-content">
            <div className="project-details">
              {projectData.length === 0 ? (
                /* when there are Zero Users */
                <a
                  className="noprojects-wrapper d-flex align-items-center justify-content-center w-100"
                  href="/"
                >
                  <span className="d-flex align-items-center justify-content-center">
                    {/* <AddUser /> Create Users/Employees, then Add a Project */}
                    No Project Data Found.
                  </span>
                </a>
              ) : (
                <div className="l-table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          <span className="has-sorting">
                            Types <i className=""></i>
                          </span>
                        </th>
                        <th>
                          <span className="has-sorting">
                            Status<i className="sort-d"></i>
                          </span>
                        </th>
                        <th>
                          <span className="has-sorting">
                            Logs Created<i className="sort-i"></i>
                          </span>
                        </th>
                        <th>
                          <span className="has-sorting">
                            Total Logs<i className="sort-i"></i>
                          </span>
                        </th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectData.map((project) => {
                        <tr>
                          <td>{project.type}</td>
                          <td>{project.status}</td>
                          <td>{project.logs_created}</td>
                          <td>{project.total_logs}</td>
                          <td>
                            <div className="action-wrapper">
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                              >
                                View Logs
                              </button>
                            </div>
                          </td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="table-footer-content">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="btn btn-secondary btn-sm"
                >
                  View Logs
                </button>
                <p>
                  Documents Uploaded: <span>05</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <Modal
          isOpen={modal}
          fade={false}
          toggle={toggleModal}
          className="upload-doc-popup modal-lg"
        >
          <ModalHeader toggle={toggleModal}>Upload Document</ModalHeader>
          <ModalBody>
            {/* Upload form code */}
            <form className="upload-document-form">
              <div className="upload-document-content">
                <div className="select-File">
                  <input
                    className="d-none"
                    type="file"
                    // name="files[]"
                    id="uploadDocs"
                    accept="application/pdf"
                    // disabled={Object.keys(pdfFile).length !== 0}
                    onChange={(e) => setPdfFile(e.target.files[0])}
                  />
                  <label htmlFor="uploadDocs">
                    <div className="upload-text d-flex align-items-center justify-content-center">
                      <Upload />
                      <small>Select a File</small>
                      <span className="text-center">
                        Click to browse or drop here to upload. Supported
                        {/* Formats: Excel, csv, xml. */}
                        Formats: PDF.
                        <br />
                        Maximum Individual File size: 100 MB
                      </span>
                    </div>
                  </label>
                </div>
                {pdfFile.size && (
                  <div className="uploaded-file-list">
                    <div className="uploaded-file d-flex align-items-center justify-content-center">
                      <FileDocument />
                      <div className="file-name ml-3 d-flex align-items-start flex-column justify-content-center">
                        <span>{pdfFile.name}</span>
                        <small>{`${pdfFile.size * 0.001}KB `}</small>
                      </div>
                      <div className="ml-auto">
                        <Close onClick={() => setPdfFile({})} />
                      </div>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm mb-4 ml-auto"
                  onClick={handleSubmit}
                  //   disabled={Object.keys(pdfFile).length === 0}
                >
                  Upload
                </button>
              </div>
              <ModalFooter>
                <Button color="secondary" onClick={toggleModal}>
                  Cancel
                </Button>
                <Button color="primary" onClick={toggleModal}>
                  Proceed
                </Button>{' '}
              </ModalFooter>
            </form>
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
            <div className="success-upload text-center">
              <Success />
              <h5>Success</h5>
              <p>Your file has been succesfully parsed.</p>
              <ul class="doc-content-table">
                <li className="doc-content-heading">
                  <span>Type</span>
                  <span>Total Logs</span>
                </li>
                <li className="doc-content-list">
                  <span>Submittals</span>
                  <span>700</span>
                </li>
                <li className="doc-content-list">
                  <span>Testings</span>
                  <span>20</span>
                </li>
                <li className="doc-content-list">
                  <span>Meetings</span>
                  <span>36</span>
                </li>
                <li className="doc-content-list">
                  <span>Closeouts</span>
                  <span>121</span>
                </li>
              </ul>
              <div className="text-right">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="d-inline-block btn btn-secondary mr-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={toggleModal}
                  className="d-inline-block btn btn-primary"
                >
                  Save
                </button>
              </div>
            </div>
            {/* Success Upload code */}
          </ModalBody>
        </Modal>
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

export default ProjectsDetails;
