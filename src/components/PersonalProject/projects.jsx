import React, { useState } from "react";
import { useLocation } from "react-router";
import CustomerProjects from "../CustomerProjects/CustomerProjects";
import Header from "../shared/Header/Header";
import NavbarTop from "../shared/NavbarTop/NavbarTop";
import PersonalProject from "./PersonalProject";
import { useNavigate } from 'react-router-dom';

const Projects = () => {
    const navigate = useNavigate();
  const [slider, setSlider] = useState(false);
  const [customerData, setCustomerData] = useState({});
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [pageRefresh, setPageRefresh] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const roleId = localStorage.getItem("roleId");
  const { state } = useLocation();
  const toggleSlider = () => setSlider(!slider);
  const toggleCreateProjectModal = () => setCreateProjectModal(!createProjectModal);

  const handleLaunch = (project) => {
    project?.project_type === 'ufgs' ? navigate('/project-logs', {
      state: {
        project,
        projectName: project?.project_name,
        customerId: localStorage.getItem('roleId') === '0' ? state.customer_id : localStorage.getItem('userId'),
        logType: 'Classified'
      },
    }) :
    navigate('/project-details', {
      state: { project, customerId: localStorage.getItem('roleId') === '0' ? state.customer_id : localStorage.getItem('userId') },
    });
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
            breadcrumb={"Project Details"}
          />
          {slider ? (
            <PersonalProject handleLaunch={handleLaunch} toggleSlider={toggleSlider} slider={slider} projectData={projectData} />
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
      </div>
    </>
  );
};

export default Projects;
