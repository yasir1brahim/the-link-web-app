import React, { useState, useEffect } from 'react';
import Header from '../shared/Header/Header';
import Loader from '../shared/Loader/Loader';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import { ReactComponent as Upload } from '../../assets/images/upload.svg';
import { ReactComponent as FileDocument } from '../../assets/images/file-document.svg';
import { ReactComponent as Close } from '../../assets/images/close.svg';
import { ReactComponent as Error } from '../../assets/images/error.svg';
import { ReactComponent as Success } from '../../assets/images/circle-success.svg';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../config/axios';

const ProjectsDetails = () => {
  const [modal, setModal] = useState(false);
  const [errorModal, toggleErrorModal] = useState(false);
  const [successModal, toggleSuccessModal] = useState(false);
  const toggleModal = () => setModal(!modal);
  const { state } = useLocation();
  const [projectData, setProjectData] = useState([]);
  const [pdfFile, setPdfFile] = useState({});
  const [fileData, setFileData] = useState({});
  const navigate = useNavigate();
  const [pageRefresh, setPageRefresh] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isUploadLoading, setUploadLoading] = useState(false);
  const [docParsed, setDocParsed] = useState(0);

  useEffect(() => {
    if (!modal) {
      setPdfFile({});
    }
  }, [modal]);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await axiosInstance({
        method: 'get',
        url: `/project_data/${state.project?.project_id}`,
      });
      setProjectData(response.data.message);
      setDocParsed(response.data.doc_parsed);
      setLoading(false);
      console.log(response.data.message);
    };

    fetchData().catch((error) => {
      setLoading(false);
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
  }, [state.project, pageRefresh]);
  const backToUpload = () => {
    toggleErrorModal(false);
    setModal(true);
  };
  const handleSubmit = async () => {
    console.log(pdfFile);
    try {
      setUploadLoading(true);
      const data = new FormData();
      data.append('project_id', state.project?.project_id);
      Object.values(pdfFile)?.forEach((file) => data.append('files', file));
      const response = await axiosInstance({
        method: 'post',
        url: '/upload_file',
        data,
      });
      if (response.data) {
        console.log(response.data);
        setUploadLoading(false);
        setFileData(response.data.message);
        setModal(false);
        toggleSuccessModal(true);
        setPageRefresh(!pageRefresh);
      }
    } catch (error) {
      setUploadLoading(false);
      toggleErrorModal(true);
      setModal(false);
      toast.error('Something went wrong!', {
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

  const handleViewLog = (project, logType) => {
    navigate('/project-logs', {
      state: {
        project,
        projectName: state.project?.project_name,
        customerId: state.customerId,
        logType
      },
    });
  };

  return (
    <>
      <div className="page-wrap">
        <NavbarTop />
        <div className="page-wrap-content projects-details-wrapper">
          <Header
            title={`Project Details  ${
              state.project.project?.project_name || ''
            }`}
            showBtn={'Upload Document'}
            toggleModal={toggleModal}
            breadcrumb={'View Projects'}
          />

          <div className="projects-details-content">
            <div className="project-details">
              {projectData.length === 0 ? (
                /* when there are Zero Users */
                <div className="noprojects-wrapper d-flex align-items-center justify-content-center w-100">
                  <span className="d-flex align-items-center justify-content-center">
                    {/* <AddUser /> Create Users/Employees, then Add a Project */}
                    No Project Data Found.
                  </span>
                </div>
              ) : (
                <div className="l-table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          <span className="has-sorting">
                            Requirement Types <i className=""></i>
                          </span>
                        </th>
                        {/* <th>
                          <span>
                            Status<i className="sort-d"></i>
                          </span>
                        </th>
                        <th>
                          <span>
                            Logs Created<i className="sort-i"></i>
                          </span>
                        </th> */}
                        <th>
                          <span>
                            Total Items<i className="sort-i"></i>
                          </span>
                        </th>
                        {/* <th>Action</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {projectData.map((project) => {
                        return (
                          <tr>
                            <td>{project.type}</td>
                            {/* <td>{project.status}</td>
                            <td>{project.logs_created}</td> */}
                            <td>{project.total_logs}</td>
                            {/* <td>
                              <div className="action-wrapper">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleViewLog(project)}
                                  disabled={project.total_logs === '0'}
                                >
                                  View Logs
                                </button>
                              </div>
                            </td> */}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="table-footer-content">
                <div style={{textAlign: 'center'}}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{display: 'inline-block'}}
                    onClick={() => handleViewLog(state.project, 'Classified')}
                    disabled={
                      !projectData
                        .map((project) => (project.total_logs > 0 ? true : false))
                        .filter((value) => value === true).length
                    }
                  >
                    View Submittal Log
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{display: 'inline-block', marginLeft: '10px'}}
                    onClick={() => handleViewLog(state.project, 'Unclassified')}
                    disabled={
                      !projectData
                        .map((project) => (project.total_logs > 0 ? true : false))
                        .filter((value) => value === true).length
                    }
                  >
                    View Unclassified Log
                  </button>
                </div>
                <p>
                  Documents Uploaded: <span>{docParsed}</span>
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
                    multiple
                    // disabled={Object.keys(pdfFile).length !== 0}
                    onChange={(e) => setPdfFile(e.target.files)}
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
                {Object.values(pdfFile).length ? (
                  <div className="uploaded-file-list">
                    {Object.values(pdfFile).map((file) => {
                      return (
                        <div className="uploaded-file d-flex align-items-center justify-content-center">
                          <FileDocument />
                          <div className="file-name ml-3 d-flex align-items-start flex-column justify-content-center">
                            <span>{file.name}</span>
                            <small>{`${file.size * 0.001}KB `}</small>
                          </div>
                          <div className="ml-auto">
                            <Close
                              onClick={() =>
                                setPdfFile({
                                  ...Object.values(pdfFile).filter(
                                    (pdf) => pdf.name !== file.name
                                  ),
                                })
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {/* <button
                  type="button"
                  className="btn btn-secondary btn-sm mb-4 ml-auto"
                  onClick={handleSubmit}
                  //   disabled={Object.keys(pdfFile).length === 0}
                >
                  Upload
                </button> */}
              </div>
              <ModalFooter>
                <Button color="secondary" onClick={toggleModal}>
                  Cancel
                </Button>
                <Button color="primary" onClick={handleSubmit}>
                  Proceed
                </Button>{' '}
              </ModalFooter>
            </form>
            {/* Upload form code */}

            {/* Error Upload code */}
            <Loader showComponentLoader={isUploadLoading} />
          </ModalBody>
        </Modal>
        <Modal
          isOpen={errorModal}
          fade={false}
          toggle={toggleErrorModal}
          className="upload-doc-popup modal-lg"
        >
          <ModalHeader toggle={toggleErrorModal}>Upload Document</ModalHeader>
          <ModalBody>
            {/* Error Upload code */}
            <div className="error-upload text-center">
              <Error />
              <h5>Error</h5>
              <p>There was some error uploading this file.</p>
              <button
                type="button"
                className="d-inline-block btn btn-primary"
                onClick={backToUpload}
              >
                Go back to Upload
              </button>
            </div>
          </ModalBody>
        </Modal>
        <Modal
          isOpen={successModal}
          fade={false}
          toggle={() => toggleSuccessModal(!successModal)}
          className="upload-doc-popup modal-lg"
        >
          <ModalHeader toggle={() => toggleSuccessModal(!successModal)}>
            Upload Document
          </ModalHeader>
          <ModalBody>
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
                  <span>{fileData?.submittal}</span>
                </li>
                <li className="doc-content-list">
                  <span>Testings</span>
                  <span>{fileData?.testing}</span>
                </li>
                <li className="doc-content-list">
                  <span>Meetings</span>
                  <span>{fileData?.meeting}</span>
                </li>
                <li className="doc-content-list">
                  <span>Closeouts</span>
                  <span>{fileData?.closeout}</span>
                </li>
              </ul>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => toggleSuccessModal(false)}
                  className="d-inline-block btn btn-secondary mr-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => toggleSuccessModal(false)}
                  className="d-inline-block btn btn-primary"
                >
                  Save
                </button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
      <Loader showComponentLoader={isLoading} />
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
