import React, { useState, useEffect, useRef } from "react";
import BaseProjectForm from "./BaseProjectForm";
import { createProject } from "../../api/Projects/api";
import { getTeamDetails } from "../../api/Authentication/api";
import handleError from "../../config/errorHandler";
import { PROJECT_TYPES } from "../../constants";
const CreateProject = ({ modal, toggleModal, customer, pageRefresh, setPageRefresh, projects, isPersonalProject = false, customerID, isAdminUser }) => {
  const typeaheadRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState({ value: "", errors: "" });
  const [projectNumber, setProjectNumber] = useState({ value: "", errors: "" });
  const [projectType, setProjectType] = useState({ value: [{ value: "", label: "" }], errors: "" });
  const [projectTypeInputText, setProjectTypeInputText] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [fullEmployeeList, setFullEmployeeList] = useState([]);
  const [selectedStandardMembersList, setSelectedStandardMembersList] = useState([]);
  const [selectedAdminMembersList, setSelectedAdminMembersList] = useState([]);

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
  }, [modal]);

  useEffect(() => {
    if (modal) {
      const preSelectEmployeesForProject = async () => {
        setIsLoading(true);
        // fetch employees for customer
        const resp_employees_by_customer = await getTeamDetails(customer?.customer_id || customerID)
        const emps_by_c = resp_employees_by_customer.data.members
        if (emps_by_c) {
          setFullEmployeeList(emps_by_c.map((emp) => ({
            value: emp.user_id ?? "",
            label: emp.display_name ?? "",
          })));
        }
        const project_members = []

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
      preSelectEmployeesForProject().catch(console.error);
    }
  }, [customer, modal, customerID]);

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
    if (projects?.find((item) => item?.project_name === projectName?.value)) {
      setProjectName({
        ...projectName,
        errors: "Project Name already exists.",
      });
      error = true;
    }


    // Validate project type - optional field, but if provided must match a valid option
    const selectedProjectType = projectType.value[0]?.value || projectType.value[0]?.label || "";
    const validProjectTypes = PROJECT_TYPES.map(pt => pt.name);

    // Check both the selected value and the typed input text
    const valueToValidate = selectedProjectType || projectTypeInputText || "";

    if (valueToValidate && valueToValidate.trim() !== "") {
      if (!validProjectTypes.includes(valueToValidate)) {
        setProjectType({
          ...projectType,
          errors: "Please select a valid project type from the list.",
        });
        error = true;
      }
    }

    // setDateError({ startError: "", endError: "" });
    // if (startDate === '') {
    //   setDateError({ ...dateError, startError: 'Start Date is required.' });
    //   error = true;
    // }
    // if (endDate === '') {
    //   setDateError({ ...dateError, endError: 'End Date is required.' });
    //   error = true;
    // }

    return error;
  };

  const handleSubmit = async () => {
    let errors = validate();
    if (!errors) {
      try {
        // Extract project type value, use null if empty
        const projectTypeValue = projectType.value[0]?.value || projectType.value[0]?.label || null;
        const finalProjectType = projectTypeValue && projectTypeValue.trim() !== "" ? projectTypeValue : null;

        const response = await createProject(
          projectName.value,
          projectNumber.value,
          finalProjectType,
          customer?.customer_id || customerID,
          selectedStandardMembersList.map((emp) => emp.value),
          selectedAdminMembersList.map((emp) => emp.value),
          startDate,
          endDate
        );
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
      setProjectType={setProjectType}
      projectType={projectType}
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
      formTitle="Create New Project"
      toggleModal={toggleModal}
      modal={modal}
      typeaheadRef={typeaheadRef}
      isLoading={isLoading}
    />
  );
};

export default CreateProject;
