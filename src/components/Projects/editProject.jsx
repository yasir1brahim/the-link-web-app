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
import { PROJECT_TYPES } from "../../constants";
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
  const [projectName, setProjectName] = useState({ value: project?.name || "", errors: "" });
  const [projectNumber, setProjectNumber] = useState({ value: project?.project_number || "", errors: "" });
  const [projectType, setProjectType] = useState({ value: [{ value: project?.project_type || "", label: project?.project_type || "" }], errors: "" });
  const [projectTypeInputText, setProjectTypeInputText] = useState("");
  const [startDate, setStartDate] = useState(project?.start_date ? new Date(project?.start_date + "T00:00:00") : new Date());
  const [endDate, setEndDate] = useState(project?.end_date ? new Date(project?.end_date + "T00:00:00") : new Date());

  const [fullEmployeeList, setFullEmployeeList] = useState([]);
  const [selectedStandardMembersList, setSelectedStandardMembersList] = useState([]);
  const [selectedAdminMembersList, setSelectedAdminMembersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!modal) {
      setProjectName({ value: "", errors: "" });
      setProjectNumber({ value: "", errors: "" });
      setProjectType({ value: [{ value: "", label: "" }], errors: "" });
      setProjectTypeInputText("");
      typeaheadRef?.current?.clear();
      setStartDate(new Date());
      setEndDate(new Date());
      setFullEmployeeList([]);
      setSelectedStandardMembersList([]);
      setSelectedAdminMembersList([]);
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

    // Validate project type - check if the entered value matches a valid option
    const selectedProjectType = projectType.value[0]?.value || projectType.value[0]?.label || projectType.value[0] || "";
    const validProjectTypes = PROJECT_TYPES.map(pt => pt.name);

    // Check both the selected value and the typed input text
    const valueToValidate = selectedProjectType || projectTypeInputText;

    if (valueToValidate) {
      if (!validProjectTypes.includes(valueToValidate)) {
        setProjectType({
          ...projectType,
          errors: "Please select a valid project type from the list.",
        });
        error = true;
      }
    }

    return error;
  };

  const handleSubmit = async () => {
    let errors = validate();
    if (!errors) {
      try {
        const response = await updateProject(
          project?.id,
          projectName.value || project?.name,
          projectNumber.value || project?.project_number,
          projectType.value[0].value || project?.project_type,
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
      setProjectTypeInputText={setProjectTypeInputText}
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
