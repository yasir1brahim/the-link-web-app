import React, { useState, useEffect, useRef } from "react";
import { AddEmployee } from "./AddEmployee";
import BaseProjectForm from "./BaseProjectForm";
import { createProject } from "../../api/Projects/api";
import { getTeamDetails } from "../../api/Authentication/api";
import handleError from "../../config/errorHandler";
const CreateProject = ({ modal, toggleModal, customer, pageRefresh, setPageRefresh, projects, isPersonalProject = false, customerID, isAdminUser }) => {
  const typeaheadRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState({ value: "", errors: "" });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [fullEmployeeList, setFullEmployeeList] = useState([]);
  const [selectedStandardMembersList, setSelectedStandardMembersList] = useState([]);
  const [selectedAdminMembersList, setSelectedAdminMembersList] = useState([]);

  useEffect(() => {
    if (!modal) {
      setProjectName({ value: "", errors: "" });
      typeaheadRef?.current?.clear();
      setStartDate("");
      setEndDate("");
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
    if (projects?.find((item) => item?.project_name === projectName?.value)) {
      setProjectName({
        ...projectName,
        errors: "Project Name already exists.",
      });
      error = true;
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
        const response = await createProject(
          projectName.value,
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
      project={null}
      setProjectName={setProjectName}
      projectName={projectName}
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
