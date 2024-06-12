import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import CustomerProjects from "../CustomerProjects/CustomerProjects";
import Header from "../shared/Header/Header";
import NavbarTop from "../shared/NavbarTop/NavbarTop";
import PersonalProject from "./PersonalProject";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UploadDocuments } from "../ProjectDetails/UploadDocuments";
import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";
import HeaderTabs from "../shared/HeaderTabs/HeaderTabs";

const Projects = () => {
  const navigate = useNavigate();
  const [uploadSpecsModal, setUploadSpecsModal] = useState(false);
  const [archiveProjectModal, setArchiveProjectModal] = useState(false);
  const [restoreProjectModal, setRestoreProjectModal] = useState(false);
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
  const [isArchived, toggleArchive] = useState(false);
  const toggleCreateProjectModal = () =>
    setCreateProjectModal(!createProjectModal);
  const toggleUploadSpecsModal = () => setUploadSpecsModal(!uploadSpecsModal);
  const toggleArchiveProjectModal = () => setArchiveProjectModal(!archiveProjectModal);
  const toggleRestoreProjectModal = () => setRestoreProjectModal(!restoreProjectModal);
  const [toggleUploadSpecsButton, setToggleUploadSpecsButton] = useState(true);
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("id");

  useEffect(() => {
    if (!uploadSpecsModal) {
      setPdfFile({});
    }
    if (roleId === "7") {
      setToggleUploadSpecsButton(false);
    }
  }, [uploadSpecsModal, toggleUploadSpecsButton, roleId]);

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
      data.append("project_id", specUploadProject?.project_id);
      specUploadProject?.project_type === "ufgs" &&
        data.append("project_type", specUploadProject?.project_type);
      Object.values(pdfFile)?.forEach((file) => data.append("files", file));
      const response = await axiosInstance({
        method: "post",
        url: "/upload_file",
        data,
      });
      if (response.data) {
        // console.log(response.data);
        setUploadLoading(false);
        setFileData(response.data.message);
        setUploadSpecsModal(false);
        toggleSuccessModal(true);
        setPageRefresh(!pageRefresh);
      }
      axiosInstance({
        method: "get",
        url: "/collab/create_spec_index",
        params: {
          project_id: specUploadProject?.project_id,
        },
      });
      axiosInstance({
        method: "post",
        url: `/spec-gpt/load_doc`,
        data: {
          project_id: specUploadProject?.project_id,
        },
      });
    } catch (error) {
      setUploadLoading(false);
      toggleErrorModal(true);
      setUploadSpecsModal(false);
      handleError(error);
    }
  };

  // function used in the project tiles to navigate to project details
  const custId =
    localStorage.getItem("roleId") === "0"
      ? customerId
      : localStorage.getItem("userId");

  const handleLaunch = (project, qaDashboard) => {
    localStorage.getItem("isSpecGptUser") === "true"
      ? navigate(
          `/spec-gpt?projectDetails=${project?.project_id},${custId},Classified,${project?.project_name}`,
        )
      : navigate(
          `/project-logs?projectDetails=${project?.project_id},${custId},Classified,${project?.project_name}`,
          {
            state: {
              project,
              projectName: project?.project_name,
              customerId:
                localStorage.getItem("roleId") === "0"
                  ? customerId
                  : localStorage.getItem("userId"),
              logType: "Classified",
              qaDashboard,
            },
          },
        );
  };

  const handleCollaborationLaunch = (project) => {
    navigate(
      `/collaboration-hub?projectDetails=${project?.project_id},${custId},Classified,${project?.project_name}`,
      {
        state: {
          project,
          projectName: project?.project_name,
          customerId:
            localStorage.getItem("roleId") === "0"
              ? customerId
              : localStorage.getItem("userId"),
          logType: "Classified",
        },
      },
    );
  };

  useEffect(() => {
    const url =
      roleId === "6" || roleId === "7"
        ? `/projects/${localStorage.getItem("userId")}`
        : customerId
        ? `/projects/${customerId}`
        : `/projects/${localStorage.getItem("userId")}`;
    const fetchData = async () => {
      const response = await axiosInstance({
        method: "get",
        url,
      });
      // setProjectData(response.data.message);
      setProjectData(
        isArchived ? response.data.archived_projects : response.data.message,
      );
      console.log(response.data.message);
    };

    fetchData().catch((error) => {
      handleError(error);
    });
  }, [state, pageRefresh, isArchived, roleId, setProjectData, customerId]);

  return (
    <>
      <div className="page-wrap">
        <NavbarTop />
        <div className="page-wrap-content personal-projects-wrapper">
          <Header
            toggleModal={toggleCreateProjectModal}
            title={state?.customer_name || customerData?.customer_name}
            // showBtn={
            //   slider
            //     ? "Add Personal Project"
            //     : roleId !== "6" && roleId !== "7" && "Create New Project"
            // }
            showBtn={"Create New Project"}
            breadcrumb={"View Projects"}
          />
          <div style={{ marginTop: "32px" }} className="">
            <HeaderTabs isArchived={isArchived}
              toggleArchive={toggleArchive} />
          </div>
          {slider ? (
            <PersonalProject
              handleLaunch={handleLaunch}
              handleCollaborationLaunch={handleCollaborationLaunch}
              toggleSlider={toggleSlider}
              slider={slider}
              projectData={projectData}
              toggleUploadSpecsModal={toggleUploadSpecsModal}
              toggleUploadSpecsButton={toggleUploadSpecsButton}
              createProjectModal={createProjectModal}
              toggleCreateProjectModal={toggleCreateProjectModal}
              archiveProjectModal={archiveProjectModal}
              toggleArchiveProjectModal={toggleArchiveProjectModal}
              restoreProjectModal={restoreProjectModal}
              toggleRestoreProjectModal={toggleRestoreProjectModal}
              state={state}
              customerData={customerData}
              pageRefresh={pageRefresh}
              setPageRefresh={setPageRefresh}
              setSpecUploadProject={setSpecUploadProject}
              isArchived={isArchived}
              toggleArchive={toggleArchive}
              customerId={customerId}
            />
          ) : (
            <CustomerProjects
              toggleSlider={toggleSlider}
              handleCollaborationLaunch={handleCollaborationLaunch}
              slider={slider}
              customerData={customerData}
              setCustomerData={setCustomerData}
              pageRefresh={pageRefresh}
              setPageRefresh={setPageRefresh}
              toggleCreateProjectModal={toggleCreateProjectModal}
              createProjectModal={createProjectModal}
              archiveProjectModal={archiveProjectModal}
              toggleArchiveProjectModal={toggleArchiveProjectModal}
              restoreProjectModal={restoreProjectModal}
              toggleRestoreProjectModal={toggleRestoreProjectModal}
              projectData={projectData}
              setProjectData={setProjectData}
              handleLaunch={handleLaunch}
              toggleUploadSpecsModal={toggleUploadSpecsModal}
              toggleUploadSpecsButton={toggleUploadSpecsButton}
              setSpecUploadProject={setSpecUploadProject}
              isArchived={isArchived}
              toggleArchive={toggleArchive}
              customerId={customerId}
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
          project={specUploadProject}
          logScreenUrl={
            localStorage.getItem("isSpecGptUser") === "true"
              ? `/spec-gpt?projectDetails=${specUploadProject?.project_id},${custId},Classified,${specUploadProject?.project_name}`
              : `/project-logs?projectDetails=${specUploadProject?.project_id},${custId},Classified,${specUploadProject?.project_name}`
          }
        />
      </div>
    </>
  );
};

export default Projects;
