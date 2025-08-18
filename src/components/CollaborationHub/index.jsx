import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import { useSearchParams } from 'react-router-dom';
import { UploadDocuments } from '../ProjectDetails/UploadDocuments';
import axiosInstance from '../../config/axios';
import handleError from '../../config/errorHandler';
import CollaborationPdfReader from '../PdfReader/collaborationPdfReader';
// import Switch from 'react-switch';
import CollaborationPdfVersionControl from '../PdfReader/collaborationPdfVersionControl';
import DocumentListModal from "../ProjectLogs/DocumentListModal";
import useDocumentRefresh from "../../hooks/useDocumentRefresh";
import { getProjectDetails } from "../../api/Projects/api";

const CollaborationHub = () => {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  // const [toggleState, setToggleState] = useState(false);
  const toggleState = false;
  const projectDetails = searchParams.get('projectDetails')?.split(',');
  const projectId = projectDetails?.length
    ? JSON.parse(projectDetails[0])
    : null;
  // const projectType = state?.project.project_type;
  // const projectName = searchParams.get('projectName');
  const customerId =
    projectDetails?.length >= 2 ? JSON.parse(projectDetails[1]) : null;
  const projectName = projectDetails?.length >= 4 ? projectDetails[3] : null;
  const [modal, setModal] = useState(false);
  const [showDocumentListModal, setShowDocumentListModal] = useState(false);
  const toggleModal = () => setModal(!modal);
  const [pdfFile, setPdfFile] = useState({});
  const [fileData, setFileData] = useState({});
  const [docParsed, setDocParsed] = useState(0);
  const [documentData, setDocumentData] = useState([]);
  const refreshDocuments = useDocumentRefresh(state?.project?.project_id || projectId, setDocumentData, setDocParsed);
  const [collabDocs, setCollabDocs] = useState([]);
  const [isUploadLoading, setUploadLoading] = useState(false);
  const [pageRefresh, setPageRefresh] = useState(false);
  const [errorModal, toggleErrorModal] = useState(false);
  const [successModal, toggleSuccessModal] = useState(false);

  // useEffect(() => {
  //   if (!modal) {
  //     setPdfFile({});
  //   }
  // }, [modal]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/collab/get_spec_index`,
        params: {
          project_id: state?.project?.project_id || projectId
        }
      });
      setCollabDocs(response.data?.indexes);
    };

    fetchData().catch((error) => {
      handleError(error);
    });
  }, [state?.project?.project_id, projectId]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/project_data/${state.project?.project_id || projectId}`
      });
      setDocParsed(response.data.doc_parsed);
      
      // Also fetch document details for the modal
      try {
        const projectDetailsResponse = await getProjectDetails(state.project?.project_id || projectId);
        setDocumentData(projectDetailsResponse.data.document_details || []);
      } catch (error) {
        console.error('Error fetching document details:', error);
      }
    };

    fetchData().catch((error) => {
      handleError(error);
    });
  }, [state?.project, projectId]);

  // useEffect(() => {
  //   if (toggleState) {
  //     const div = document.getElementById('chub-item-container');
  //     div.innerHTML = '';
  //   }
  // }, [toggleState]);

  const handleSubmit = async () => {
    // console.log(pdfFile);
    try {
      setUploadLoading(true);
      const data = new FormData();
      data.append('project_id', projectId || state.project?.project_id);
      // projectType === 'ufgs' && data.append('project_type', projectType);
      Object.values(pdfFile)?.forEach((file) => data.append('files', file));
      const response = await axiosInstance({
        method: 'post',
        url: '/upload_file',
        data
      });
      if (response.data) {
        // console.log(response.data);
        setUploadLoading(false);
        setFileData(response.data.message);
        setModal(false);
        toggleSuccessModal(true);
      }
      axiosInstance({
        method: 'get',
        url: '/collab/create_spec_index',
        params: {
          project_id: projectId || state.project?.project_id
        }
      });
      const specIndexResponse = await axiosInstance({
        method: 'get',
        url: `/collab/get_spec_index`,
        params: {
          project_id: state?.project?.project_id || projectId
        }
      });
      axiosInstance({
        method: 'post',
        url: `/spec-gpt/load_doc`,
        data: {
          project_id: projectId || state.project?.project_id
        }
      });
      setCollabDocs(specIndexResponse.data?.indexes);
      setPageRefresh(!pageRefresh);
    } catch (error) {
      setUploadLoading(false);
      toggleErrorModal(true);
      setModal(false);
      handleError(error);
    }
  };
  const backToUpload = () => {
    toggleErrorModal(false);
    setModal(true);
  };

  return (
    <>
      <div className="page-wrap">
        <NavbarTop />
        <div className="page-wrap-content personal-projects-wrapper">
          <Header
            // title={`${state.project?.type} Logs  - ${state.projectName || ''}`}
            // centerText={`${projectType === "ufgs" ? "UFGS" : "Commercial"}`}
            breadcrumb={'View Projects'}
            breadcrumbUrl={`/project-list?id=${customerId}`}
            breadcrumb2={'Collab Hub'}
            btnSize={'small'}
            title={state?.projectName || projectName || ''}
            // docParsed={docParsed}
            showBtn={'Upload Documents'}
            navBtn={'collab'}
            toggleModal={toggleModal}
          />
          {/* // Removed due to client request on : 13 Sep 2023
          <div class="version-control-toggle">
            Compare Versions &nbsp;
            <Switch
              height={15}
              onColor={'#d5e83e'}
              onChange={() => setToggleState(!toggleState)}
              checked={toggleState}
            />
          </div> */}
        </div>
        <div className="collaboration-wrapper-sidenav">
          <div className="collabHub-sideNav-contents">
            <div className="side-nav-collab-hub-heading">Spec Sections</div>
            {docParsed ? (
              <div 
                className="side-nav-collab-hub-heading collab-hub-sub-heading"
                style={{ cursor: "pointer" }}
                onClick={() => setShowDocumentListModal(true)}
              >
                {`Uploaded: ${docParsed} document${docParsed > 1 ? 's' : ''}`}
              </div>
            ) : null}
            <div className="side-nav-collab-hub" id="chub-item-container" />
          </div>
          <div className="ss-pdf-wrraper collaboration-wrapper">
            {toggleState ? (
              <CollaborationPdfVersionControl
                projectName={state?.projectName || projectName || ''}
              />
            ) : (
              collabDocs &&
              collabDocs.length > 0 && (
                <CollaborationPdfReader
                  collabDocs={collabDocs}
                  projectName={state?.projectName || projectName || ''}
                />
              )
            )}
          </div>
        </div>
      </div>
      <UploadDocuments
        modal={modal}
        toggleModal={toggleModal}
        setPdfFile={setPdfFile}
        pdfFile={pdfFile}
        handleSubmit={handleSubmit}
        isUploadLoading={isUploadLoading}
        errorModal={errorModal}
        toggleErrorModal={toggleErrorModal}
        backToUpload={backToUpload}
        successModal={successModal}
        toggleSuccessModal={toggleSuccessModal}
        fileData={fileData}
      />
      <DocumentListModal
        isOpen={showDocumentListModal}
        toggle={() => setShowDocumentListModal(false)}
        documents={documentData}
        onAfterReprocess={refreshDocuments}
      />
    </>
  );
};

export default CollaborationHub;
