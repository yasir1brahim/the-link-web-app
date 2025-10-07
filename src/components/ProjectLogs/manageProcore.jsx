import React, { useState } from 'react';
import { useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../../config/axios';
import handleError from '../../config/errorHandler';

const ManageProcore = ({
  procoreAuthUserInfo,
  companyId,
  procoreCompanyName,
  manageProcoreModal,
  projectId,
  procoreProjectId,
  procoreProjectName,
  procoreSubmittalManagerId,
  procoreSubmittalManagerName,
  toggleManageProcoreModal,
  setManageProcoreModal,
  toggleChangeProcoreAccountModal,
  setCompanyId,
  setProcoreCompanyName,
  setProcoreProjectId,
  setProcoreProjectName,
  setProcoreSubmittalManagerId,
  setProcoreSubmittalManagerName
}) => {
  const [partnerCompany, setPartnerCompany] = useState([]);
  const [projectName, setProjectName] = useState([]);
  const [submittalManager, setSubmittalManager] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [submittalManagerList, setSubmittalManagerList] = useState([]);
  const [loadingProjectDetails, setLoadingProjectDetails] = useState(false);

  const getCompanyList = async () => {
    const companyResp = await axiosInstance({
      method: "get",
      url: "/api/deliverables/procore/companies/",
    });
    console.log("procore company resp", companyResp)
    setCompanyList(companyResp?.data || []);
  }

  const getProjectList = async (companyId_) => {
    if (companyId_ !== undefined) {
      const fetchData = async () => {
        const projectListResp = await axiosInstance({
          method: 'get',
          url: `/api/deliverables/procore/projects/${companyId_}/`
        });
        console.log("projectListResp", projectListResp);
        console.log("projectListResp?.data", projectListResp?.data);
        setProjectList(projectListResp?.data?.data || []);
      };
      await fetchData().catch((error) => {
        handleError(error);
      });
    }
  }

  const getSubmittalManagerList = async (projectId_) => {
    if (projectId_ !== null) {
      const fetchData = async () => {
        const submittalManagerResp = await axiosInstance({
          method: 'get',
          url: `/api/deliverables/procore/managers/${projectId_}/`
        });
        console.log("submittalManagerResp", submittalManagerResp);
        console.log("submittalManagerResp?.data", submittalManagerResp?.data);
        setSubmittalManagerList(submittalManagerResp?.data?.data || []);
      };

      await fetchData().catch((error) => {
        handleError(error);
      });
    }
  }

  useEffect(() => {
    if (partnerCompany[0]?.value) {
      getProjectList(partnerCompany[0]?.value)
    }
  }, [partnerCompany]);

  useEffect(() => {
    if (projectName[0]?.label) {
      getSubmittalManagerList(projectName[0]?.value);
    }
  }, [projectName]);

  const loadProjectDetails = async () => {
    setLoadingProjectDetails(true);
    await getCompanyList();
    await getProjectList(companyId)
    await getSubmittalManagerList(procoreProjectId)
    setLoadingProjectDetails(false);
  }

  useEffect(() => {
    if (manageProcoreModal) {
      loadProjectDetails();
    }
  }, [manageProcoreModal])

  const handleProjectMapping = async () => {
    try {
      await axiosInstance({
        method: 'post',
        url: '/api/deliverables/procore/project_mapping/',
        data: {
          project_id: projectId,
          procore_company_id: partnerCompany[0]?.value,
          procore_project_id: projectName[0]?.value,
          procore_project_name: projectName[0]?.label,
          procore_submittal_manager_id: submittalManager[0]?.value,
          procore_company_name: partnerCompany[0]?.label,
          procore_submittal_manager_name: submittalManager[0]?.label
        }
      }).then(() => {
        setManageProcoreModal(false);
        setCompanyId(partnerCompany[0]?.value);
        setProcoreCompanyName(partnerCompany[0]?.label);
        setProcoreProjectId(projectName[0]?.value);
        setProcoreProjectName(projectName[0]?.label);
        setProcoreSubmittalManagerId(submittalManager[0]?.value);
        setProcoreSubmittalManagerName(submittalManager[0]?.label);
        toast.success('Updated project procore info!', {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
      });
    } catch (error) {
      setManageProcoreModal(false);
      handleError(error);
    }
  };

  const handleChangeProcoreAccountButtonClick = () => {
    toggleManageProcoreModal();
    toggleChangeProcoreAccountModal();
  }

  const handleCompanyMappings = async () => {
    try {
      await axiosInstance({
        method: 'post',
        url: '/api/deliverables/procore/company_mapping/',
        data: {
          link_company_id: companyId,
          procore_company_id: partnerCompany[0]?.value,
          procore_company_name: partnerCompany[0]?.label
        }
      }).then(() => {
        setManageProcoreModal(false);
        toast.success('Updated project procore info!', {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
      });
    } catch (error) {
      setManageProcoreModal(false);
      handleError(error);
    }
  };
  return (
    <>
      <Modal
        isOpen={manageProcoreModal}
        fade={false}
        toggle={toggleManageProcoreModal}
        className="new-user modal-md"
      >
        <ModalHeader toggle={toggleManageProcoreModal}>
          Manage Procore Integration
        </ModalHeader>
        <ModalBody>
          <div className='mb-3'>
            {procoreAuthUserInfo && (
              <div className='mb-2'>Procore Email: {procoreAuthUserInfo.login}</div>
            )}
            <Button
              color="primary"
              onClick={handleChangeProcoreAccountButtonClick}
            >
              Change Procore Account
            </Button>
          </div>
          <div className="create-user-content">
            <div className="row">
              <div className="col-12 mb-2">Procore Project Details</div>
              <div className="col-12">
                <div className="form-group">
                  <SelectDropdown
                    label={'Select Partner Company'}
                    setSelected={setPartnerCompany}
                    selected={partnerCompany?.label}
                    defaultInputValue={procoreCompanyName}
                    options={companyList?.map((company) => {
                      return {
                        label: company.name,
                        value: company.id
                      };
                    })}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <SelectDropdown
                    label={'Select Project Name'}
                    setSelected={setProjectName}
                    selected={projectName?.label}
                    defaultInputValue={procoreProjectName}
                    options={projectList?.map((project) => {
                      return {
                        value: project.key,
                        label: project.value
                      };
                    })}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group log-datepicker">
                  <SelectDropdown
                    label={'Select Submittal Manager'}
                    setSelected={setSubmittalManager}
                    selected={submittalManager?.label}
                    defaultInputValue={procoreSubmittalManagerName}
                    options={submittalManagerList?.map((manager) => {
                      return {
                        value: manager.key,
                        label: manager.value
                      };
                    })}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button color="secondary" onClick={toggleManageProcoreModal}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleProjectMapping}
            >
              Save
            </Button>
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

export default ManageProcore;