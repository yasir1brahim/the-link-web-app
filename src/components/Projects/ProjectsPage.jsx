import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import ProjectsTable from "./ProjectsTable";
import Header from "../shared/Header/Header";
import NavbarTop from "../shared/NavbarTop/NavbarTop";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "../shared/Loader/Loader";
import handleError from "../../config/errorHandler";
import HeaderTabs from "../shared/HeaderTabs/HeaderTabs";
import { listProjects, getUserRoleInProject } from "../../api/Projects/api";
import { isFeatureFlagActive } from "../../utils/featureFlags";
import { useParams } from 'react-router-dom';
import { getUserRoleInTeam } from "../../api/Authentication/api";
import { isNoticesFlagActive } from "../../api/FeatureFlags/api";

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [uploadSpecsModal, setUploadSpecsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [archiveProjectModal, setArchiveProjectModal] = useState(false);
  const [restoreProjectModal, setRestoreProjectModal] = useState(false);
  const [customerData, setCustomerData] = useState({});
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [pageRefresh, setPageRefresh] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const roleId = localStorage.getItem("roleId");
  const { state } = useLocation();
  const [isArchived, toggleArchive] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('member');
  const toggleCreateProjectModal = () =>
    setCreateProjectModal(!createProjectModal);
  const toggleArchiveProjectModal = () => setArchiveProjectModal(!archiveProjectModal);
  const toggleRestoreProjectModal = () => setRestoreProjectModal(!restoreProjectModal);
  const [noticesFeatureFlagActive, setNoticesFeatureFlagActive] = useState(false);
  const { teamId } = useParams();

  const customerId = teamId;


  const handleLaunch = (project) => {
    navigate(
      `/project-logs?projectDetails=${project?.id}`,
      {
        state: {
          project,
          projectName: project?.name,
          userId: localStorage.getItem("userId"),
          customerData,
        },
      },
    );
  };

  const onClickNotices = (project) => {
    navigate(`/notices?projectDetails=${project?.id}`, {
      state: {
        project,
        projectName: project?.name,
        userId: localStorage.getItem("userId"),
        customerData,
      },
    })
  }

  const fetchData = async () => {
    try {
        setIsLoading(true);
        const userRole = await getUserRoleInTeam(
          localStorage.getItem("userId"),
          customerId
        );
        setCurrentUserRole(userRole);
        const response = await listProjects(teamId);
        
        const dataToSet = isArchived 
            ? response.data.results.filter(project => project.is_archived === true) 
            : response.data.results.filter(project => project.is_archived === false) || [];
            
        setProjectData(dataToSet);
    } catch (error) {
        handleError(error);
    } finally {
        setIsLoading(false);
    }
};


useEffect(() => {
  let isMounted = true;

  fetchData(); 
  isNoticesFlagActive(teamId).then(isActive => {
    setNoticesFeatureFlagActive(isActive)
  });


  return () => {
      isMounted = false;
  };
}, [state, pageRefresh, isArchived, customerId]);

  return (
    <>
      <div className="page-wrap">
        <NavbarTop
          userRole={currentUserRole}
          teamId={teamId}
         />
        <div className="page-wrap-content personal-projects-wrapper">
          {currentUserRole === 'admin' && <Header
            toggleModal={toggleCreateProjectModal}
            title={state?.customer_name || customerData?.customer_name}
            showBtn={"Create New Project"}
            breadcrumb={"View Projects"}
          />}
          <div style={{ marginTop: "32px" }} className="">
            <HeaderTabs isArchived={isArchived}
              toggleArchive={toggleArchive} />
          </div>
          <ProjectsTable
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
            isArchived={isArchived}
            toggleArchive={toggleArchive}
            customerId={customerId}
            noticesFeatureFlagActive={noticesFeatureFlagActive}
            onClickNotices={onClickNotices}
          />
        </div>
      </div>
      <Loader showComponentLoader={isLoading} />
    </>
  );
};

export default ProjectsPage;
