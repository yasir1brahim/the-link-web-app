import React, { useState } from "react";
import { useLocation } from "react-router";
import CustomerProjects from "../CustomerProjects/CustomerProjects";
import Header from "../shared/Header/Header";
import NavbarTop from "../shared/NavbarTop/NavbarTop";
import PersonalProject from "./PersonalProject";
import { useNavigate } from "react-router-dom";
import { UploadDocuments } from "../ProjectDetails/UploadDocuments";
import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";

const Projects = () => {
  const navigate = useNavigate();
  const [uploadSpecsModal, setUploadSpecsModal] = useState(false);
  const [slider, setSlider] = useState(false);
  const [customerData, setCustomerData] = useState({});
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [pageRefresh, setPageRefresh] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [pdfFile, setPdfFile] = useState({});
  const [isUploadLoading, setUploadLoading] = useState(false);
  const [errorModal, toggleErrorModal] = useState(false);
  const [successModal, toggleSuccessModal] = useState(false);
  const [fileData, setFileData] = useState({});
  const [specUploadProject, setSpecUploadProject] = useState({});
  const roleId = localStorage.getItem("roleId");
  const { state } = useLocation();
  const toggleSlider = () => setSlider(!slider);
  const toggleCreateProjectModal = () =>
    setCreateProjectModal(!createProjectModal);
  const toggleUploadSpecsModal = () => setUploadSpecsModal(!uploadSpecsModal);

  // function related to upload specs
  const backToUpload = () => {
    toggleErrorModal(false);
    setUploadSpecsModal(true);
  };

  // handle to upload specs, submit 
  const handleUploadSubmit = async () => {
    try {
      setUploadLoading(true);
      const data = new FormData();
      data.append('project_id', specUploadProject?.project_id);
      specUploadProject?.project_type === 'ufgs' && data.append('project_type', specUploadProject?.project_type);
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
        setUploadSpecsModal(false);
        toggleSuccessModal(true);
        setPageRefresh(!pageRefresh);
      }
    } catch (error) {
      setUploadLoading(false);
      toggleErrorModal(true);
      setUploadSpecsModal(false);
      handleError(error)
    }
  };

  // function used in the project tiles to navigate to project details
  const handleLaunch = (project) => {
    const custId = localStorage.getItem("roleId") === "0"
    ? state.customer_id
    : localStorage.getItem("userId")
    // project?.project_type === "ufgs"
      // ?
       navigate(`/project-logs?projectDetails=${project?.project_id},${custId},Classified`, {
          state: {
            project,
            projectName: project?.project_name,
            customerId:
              localStorage.getItem("roleId") === "0"
                ? state.customer_id
                : localStorage.getItem("userId"),
            logType: "Classified",
          },
        })
      // : navigate("/project-details", {
      //     state: {
      //       project,
      //       customerId:
      //         localStorage.getItem("roleId") === "0"
      //           ? state.customer_id
      //           : localStorage.getItem("userId"),
      //     },
      //   });
  };

  return (
    <>
      <div className="page-wrap">
        <NavbarTop />
        <div className="page-wrap-content personal-projects-wrapper">
          <Header
            toggleModal={toggleCreateProjectModal}
            title={state?.customer_name || customerData?.customer_name}
            showBtn={
              slider
                ? "Add Personal Project"
                : roleId !== "6" && roleId !== "7" && "Create New Project"
            }
            breadcrumb={"View Projects"}
          />
          {slider ? (
            <PersonalProject
              handleLaunch={handleLaunch}
              toggleSlider={toggleSlider}
              slider={slider}
              projectData={projectData}
              toggleUploadSpecsModal={toggleUploadSpecsModal}
              createProjectModal={createProjectModal}
              toggleCreateProjectModal={toggleCreateProjectModal}
              state={state}
              customerData={customerData}
              pageRefresh={pageRefresh}
              setPageRefresh={setPageRefresh}
              setSpecUploadProject={setSpecUploadProject}
            />
          ) : (
            <CustomerProjects
              toggleSlider={toggleSlider}
              slider={slider}
              customerData={customerData}
              setCustomerData={setCustomerData}
              pageRefresh={pageRefresh}
              setPageRefresh={setPageRefresh}
              toggleCreateProjectModal={toggleCreateProjectModal}
              createProjectModal={createProjectModal}
              projectData={projectData}
              setProjectData={setProjectData}
              handleLaunch={handleLaunch}
            />
          )}
        </div>
        <UploadDocuments
          modal={uploadSpecsModal}
          toggleModal={toggleUploadSpecsModal}
          setPdfFile={setPdfFile}
          pdfFile={pdfFile}
          handleSubmit={handleUploadSubmit}
          isUploadLoading={isUploadLoading}
          errorModal={errorModal}
          toggleErrorModal={toggleErrorModal}
          backToUpload={backToUpload}
          successModal={successModal}
          toggleSuccessModal={toggleSuccessModal}
          fileData={fileData}
        />
      </div>
    </>
  );
};

export default Projects;
