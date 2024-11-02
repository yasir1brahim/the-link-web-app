import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../config/axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DateSelector from "../shared/DateSelector/DateSelector";
import "react-bootstrap-typeahead/css/Typeahead.css";
import moment from "moment";
import handleError from "../../config/errorHandler";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { CircularProgress } from "@mui/material";
import { getTeamDetails } from "../../api/Authentication/api";
import { updateProject } from "../../api/Projects/api";
import UserSelector from "./UserSelector";
import BaseProjectForm from "./BaseProjectForm";
const EditProject = ({
  modal,
  toggleModal,
  customer,
  project,
  pageRefresh,
  setPageRefresh,
  isAdminUser,
  customerID,
}) => {
  console.log("project", project)

  const typeaheadRef = useRef(null);
  const [projectName, setProjectName] = useState({ value: "", errors: "" });
  const [projectNumber, setProjectNumber] = useState({ value: "", errors: "" });
  const [projectType, setProjectType] = useState({ value: "", label: "" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [fullEmployeeList, setFullEmployeeList] = useState([]);
  const [selectedStandardMembersList, setSelectedStandardMembersList] = useState([]);
  const [selectedAdminMembersList, setSelectedAdminMembersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!modal) {
      setProjectName({ value: "", errors: "" });
      setProjectNumber({ value: "", errors: "" });
      setProjectType({ value: "", label: "" });
      typeaheadRef?.current?.clear();
      setStartDate("");
      setEndDate("");
      setFullEmployeeList([]);
      setSelectedStandardMembersList([]);
      setSelectedAdminMembersList([]);
    } else if (project) {
      setProjectName({ value: project?.name || "", errors: "" });
      setProjectNumber({ value: project?.project_number || "", errors: "" });
      setProjectType({ value: project?.project_type || "", label: project?.project_type || "" });
      setStartDate(project?.start_date || "");
      setEndDate(project?.end_date || "");
    }
  }, [modal, project, typeaheadRef]);


  useEffect(() => {
    if (modal) {
      const preSelectEmployeesForProject = async () => {
        setIsLoading(true);
        // fetch employees for customer
        const resp_employees_by_customer = await getTeamDetails(project?.team)
        const emps_by_c = resp_employees_by_customer.data.members
        if (emps_by_c) {
          setFullEmployeeList(emps_by_c.map((emp) => ({
            value: emp.user_id ?? "",
            label: emp.display_name ?? "",
          })));
        }
        const project_members = project?.members ? project.members : []

        setSelectedStandardMembersList(project_members.filter((member) => member.role === "project_member").map((member) => {
          return {
            value: member.user_id,
            label: member.display_name,
          }
        }))
        setSelectedAdminMembersList(project_members.filter((member) => member.role === "project_admin").map((member) => {
          return {
            value: member.user_id,
            label: member.display_name,
          }
        }))
        setIsLoading(false);
      };
      console.log("fullEmployeeList", fullEmployeeList)
      preSelectEmployeesForProject().catch(console.error);
    }
  }, [customer, modal, project]);

  const validate = () => {
    let error = false;
    if (projectName.value === "") {
      setProjectName({ ...projectName, errors: "Project Name is required." });
      error = true;
    }
    if (projectNumber.value === "") {
      setProjectNumber({ ...projectNumber, errors: "Project Number is required." });
      error = true;
    }

    return error;
  };

  const handleSubmit = async () => {
    let errors = validate();
    console.log("projectType.label", projectType.label)
    console.log("projectType", projectType)
    if (!errors) {
      try {
        const response = await updateProject(
          project?.id,
          projectName.value || project?.name, 
          projectNumber.value || project?.project_number,
          projectType[0].label || project?.project_type,
          selectedStandardMembersList.map((emp) => emp.value), 
          selectedAdminMembersList.map((emp) => emp.value), 
          startDate, 
          endDate
        )
        
        if (response.data) {
          console.log(response.data);
          setPageRefresh(!pageRefresh);
          toggleModal();
        }
      } catch (error) {
        handleError(error);
        toggleModal();
      }
    }
  };

  return (
    <BaseProjectForm
      setProjectName={setProjectName}
      projectName={projectName}
      setProjectNumber={setProjectNumber}
      projectNumber={projectNumber}
      projectType={projectType}
      setProjectType={setProjectType}
      fullEmployeeList={fullEmployeeList}
      selectedAdminMembersList={selectedAdminMembersList}
      setSelectedAdminMembersList={setSelectedAdminMembersList}
      selectedStandardMembersList={selectedStandardMembersList}
      setSelectedStandardMembersList={setSelectedStandardMembersList}
      startDate={startDate}
      setStartDate={setStartDate}
      endDate={endDate}
      setEndDate={setEndDate}
      handleSubmit={handleSubmit}
      formTitle="Edit Project"
      toggleModal={toggleModal}
      modal={modal}
      isAdminUser={isAdminUser}
      typeaheadRef={typeaheadRef}
      isLoading={isLoading}
    />
  );
};

export default EditProject;
