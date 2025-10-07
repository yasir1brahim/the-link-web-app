import React, { useState } from 'react';
import { useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../../config/axios';
import handleError from '../../config/errorHandler';

const Procore = ({
  companyId,
  procoreModal,
  projectId,
  toggleProcoreModal,
  setProcoreModal,
  setExportToProcoreModal,
  isFromCustomerScreen = false,
  existingCompanyName = null,
  existingProjectName = null,
  existingSubmittalManagerName = null,
  existingCompanyId = null,
  existingProjectId = null,
  existingSubmittalManagerId = null,
}) => {
  const [partnerCompany, setPartnerCompany] = useState([]);
  const [projectName, setProjectName] = useState([]);
  const [submittalManager, setSubmittalManager] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [submittalList, setSubmittalList] = useState([]);
  const [fetchedCompanyList, setFetchedCompanyList] = useState([]);

  // Initialize modal with proper data fetching sequence
  useEffect(() => {
    console.log("useEffect triggered - procoreModal:", procoreModal);
    if (procoreModal) {
      console.log("Modal is open, starting initialization...");
      const initializeModal = async () => {
        try {
          console.log("Step 1: Fetching companies list...");
          // Step 1: Fetch companies list
          const companyResp = await axiosInstance({
            method: "get",
            url: "/api/deliverables/procore/companies/",
          });
          console.log("Fetched companies:", companyResp?.data);
          setFetchedCompanyList(companyResp?.data || []);
          
          // Step 2: Set existing company if available
          console.log("Checking existing values:", {
            existingCompanyName,
            existingCompanyId,
            existingProjectName,
            existingProjectId,
            existingSubmittalManagerName,
            existingSubmittalManagerId
          });
          
          if (existingCompanyName && existingCompanyId) {
            console.log("Setting existing company:", existingCompanyName);
            setPartnerCompany([{
              label: existingCompanyName,
              value: existingCompanyId
            }]);
            
            // Step 3: Fetch projects for the existing company
            console.log("Step 3: Fetching projects for company:", existingCompanyId);
            const projectListResp = await axiosInstance({
              method: 'get',
              url: `/api/deliverables/procore/projects/${existingCompanyId}/`
            });
            console.log("Fetched projects:", projectListResp?.data);
            setProjectList(projectListResp?.data?.data || []);
            
            // Step 4: Set existing project if available
            if (existingProjectName && existingProjectId) {
              console.log("Setting existing project:", existingProjectName);
              setProjectName([{
                label: existingProjectName,
                value: existingProjectId
              }]);
              
              // Step 5: Fetch managers for the existing project
              console.log("Step 5: Fetching managers for project:", existingProjectId);
              const submittalManagerResp = await axiosInstance({
                method: 'get',
                url: `/api/deliverables/procore/managers/${existingProjectId}/`
              });
              console.log("Fetched managers:", submittalManagerResp?.data);
              setSubmittalList(submittalManagerResp?.data?.data || []);
              
              // Step 6: Set existing manager if available
              if (existingSubmittalManagerName && existingSubmittalManagerId) {
                console.log("Setting existing manager:", existingSubmittalManagerName);
                setSubmittalManager([{
                  label: existingSubmittalManagerName,
                  value: existingSubmittalManagerId
                }]);
              }
            }
          }
        } catch (error) {
          console.error("Error initializing modal:", error);
          handleError(error);
        }
      };
      
      console.log("Calling initializeModal...");
      initializeModal();
    } else {
      console.log("Modal is not open, skipping initialization");
    }
  }, [procoreModal]);

  // Once a user selects a partner company, it's respective project fetching API is called
  useEffect(() => {
    if (partnerCompany[0]?.value && procoreModal) {
      // Only fetch if this is a user-initiated change (not during initialization)
      const isInitialization = existingCompanyId && partnerCompany[0]?.value === existingCompanyId;
      if (!isInitialization) {
        const fetchData = async () => {
          const projectListResp = await axiosInstance({
            method: 'get',
            url: `/api/deliverables/procore/projects/${partnerCompany[0]?.value}/`
          });
          console.log("projectListResp", projectListResp);
          console.log("projectListResp?.data", projectListResp?.data);
          setProjectList(projectListResp?.data?.data || []);
        };
        fetchData().catch((error) => {
          handleError(error);
        });
      }
    }
  }, [partnerCompany, procoreModal, existingCompanyId]);

  // Further after selecting a project it's respective submittall manager API is called
  useEffect(() => {
    if (projectName[0]?.label && procoreModal) {
      // Only fetch if this is a user-initiated change (not during initialization)
      const isInitialization = existingProjectId && projectName[0]?.value === existingProjectId;
      if (!isInitialization) {
        const fetchData = async () => {
          const submittalManagerResp = await axiosInstance({
            method: 'get',
            url: `/api/deliverables/procore/managers/${projectName[0]?.value}/`
          });
          setSubmittalList(submittalManagerResp?.data?.data || []);
        };

        fetchData().catch((error) => {
          handleError(error);
        });
      }
    }
  }, [projectName, procoreModal, existingProjectId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!procoreModal) {
      setPartnerCompany([]);
      setProjectName([]);
      setSubmittalManager([]);
      setProjectList([]);
      setSubmittalList([]);
      setFetchedCompanyList([]);
    }
  }, [procoreModal]);

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
        setProcoreModal(false);
        toast.success('Updated project procore info!', {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
        setExportToProcoreModal(true);
      });
    } catch (error) {
      setProcoreModal(false);
      handleError(error);
    }
  };

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
        setProcoreModal(false);
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
      setProcoreModal(false);
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
                    label={'Select Partner Company'}
                    setSelected={setPartnerCompany}
                    selected={partnerCompany}
                    options={fetchedCompanyList?.map((company) => {
                      return {
                        label: company.name,
                        value: company.id
                      };
                    })}
                    className="form-control"
                  />
                </div>
              </div>
              {isFromCustomerScreen ? (
                <></>
              ) : (
                <div className="col-12">
                  <div className="form-group">
                    <SelectDropdown
                      label={'Select Project Name'}
                      setSelected={setProjectName}
                      selected={projectName}
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
              )}
              {isFromCustomerScreen ? (
                <></>
              ) : (
                <div className="col-12">
                  <div className="form-group log-datepicker">
                    <SelectDropdown
                      label={'Select  Submittal Manager'}
                      setSelected={setSubmittalManager}
                      selected={submittalManager}
                      options={submittalList?.map((manager) => {
                        return {
                          value: manager.key,
                          label: manager.value
                        };
                      })}
                      className="form-control"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <ModalFooter>
            <Button color="secondary" onClick={toggleProcoreModal}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={
                isFromCustomerScreen
                  ? handleCompanyMappings
                  : handleProjectMapping
              }
            >
              Save
            </Button>{' '}
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