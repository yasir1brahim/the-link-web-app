import React, { useState } from "react";
import { useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import SelectDropdown from "../shared/SelectDropdown/SelectDropdown";
import { toast, ToastContainer } from "react-toastify";
import axiosInstance from "../../config/axios";
// import { useNavigate } from 'react-router-dom';
import handleError from "../../config/errorHandler";

const Procore = ({
  companyId,
  companyList,
  procoreModal,
  setLoading,
  projectId,
  selectedRows,
  toggleProcoreModal,
}) => {
  // const navigate = useNavigate();
  const [partnerCompany, setPartnerCompany] = useState([]);
  const [projectName, setProjectName] = useState([]);
  const [submittalManager, setSubmittalManager] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [submittalList, setSubmittalList] = useState([]);

  const handleExportToProcore = async () => {
    try {
      setLoading(true);
      // const statusResp = await axiosInstance({
      //   method: "get",
      //   url: `/procore/status/${companyId}`,
      // });
      // console.log(statusResp, "statusREsponse");
      // setStatus(get(statusResp, 'data.data'));
      const resp = await axiosInstance({
        method: "post",
        url: "/procore/create_submittals",
        data: {
          project_id: Number(projectId),
          records: selectedRows, // array of ids
          // status_id:
          //   statusResp?.data?.data?.find((sts) => sts.name === "Open").id || 1,
        },
      });
      if (resp.status === 200) {
        setLoading(false);
        toast.success("Successfully exported to Procore!", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        localStorage.setItem("selectedRows", "");
      }
      // setLoading(false);
    } catch (error) {
      setLoading(false)
      console.log("error", error);
      localStorage.setItem("selectedRows", "");
      handleError(error);
    }
  };

  // Once a user selects a partner company, it's respective project fetching API is called
  useEffect(() => {
    if (partnerCompany[0]?.value) {
      const fetchData = async () => {
        const projectListResp = await axiosInstance({
          method: "get",
          url: `/procore/projects/${partnerCompany[0]?.value}`,
        });
        setProjectList(projectListResp.data.data);
      };
      fetchData().catch((error) => {
        handleError(error);
      });
    }
  }, [partnerCompany]);

  // Further after selecting a project it's respective submittall manager API is called
  useEffect(() => {
    if (projectName[0]?.label) {
      const fetchData = async () => {
        const submittalManagerResp = await axiosInstance({
          method: "get",
          url: `/procore/managers/${projectName[0]?.value}`,
        });
        setSubmittalList(submittalManagerResp.data.data);
      };

      fetchData().catch((error) => {
        handleError(error);
      });
    }
  }, [projectName]);

  const handleProjectMapping = async () => {
    try {
      await axiosInstance({
        method: "post",
        url: "/procore/project_mapping",
        data: {
          project_id: projectId,
          procore_company_id: partnerCompany[0]?.value,
          procore_project_id: projectName[0]?.value,
          procore_project_name: projectName[0]?.label,
          procore_submittal_manager_id: submittalManager[0]?.value,
          procore_company_name: partnerCompany[0]?.label,
          procore_submittal_manager_name: submittalManager[0]?.label,
        },
      }).then(() => {
        toggleProcoreModal();
        toast.success("Updated project procore info!", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        handleExportToProcore();
        // navigate(`/submital-mappings?customerId=${customerId}&companyId=${partnerCompany[0]?.value}`);
        // toggleProcoreModal();
      });
    } catch (error) {
      toggleProcoreModal();
      handleError(error);
    }
  };

  return (
    <>
      <Modal
        isOpen={procoreModal}
        fade={false}
        toggle={toggleProcoreModal}
        className="new-user modal-md"
      >
        <ModalHeader toggle={toggleProcoreModal}>
          Procore Project Details
        </ModalHeader>
        <ModalBody>
          <div className="create-user-content">
            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <SelectDropdown
                    label={"Select Partner Company"}
                    setSelected={setPartnerCompany}
                    // value={partnerCompany.label}
                    selected={partnerCompany?.label}
                    options={companyList?.map((company) => {
                      return {
                        label: company.name,
                        value: company.id,
                      };
                    })}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <SelectDropdown
                    label={"Select Project Name"}
                    setSelected={setProjectName}
                    // value={leadContact.label}
                    selected={projectName?.label}
                    options={projectList?.map((project) => {
                      return {
                        value: project.key,
                        label: project.value,
                      };
                    })}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group log-datepicker">
                  <SelectDropdown
                    label={"Select  Submittal Manager"}
                    setSelected={setSubmittalManager}
                    // value={leadContact.label}
                    selected={submittalManager?.label}
                    options={submittalList?.map((manager) => {
                      return {
                        value: manager.key,
                        label: manager.value,
                      };
                    })}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button color="secondary" onClick={toggleProcoreModal}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleProjectMapping}>
              Save
            </Button>{" "}
          </ModalFooter>
        </ModalBody>
      </Modal>
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

export default Procore;
