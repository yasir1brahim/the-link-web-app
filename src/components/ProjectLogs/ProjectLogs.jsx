import React, { useState, useEffect, useCallback } from "react";
import Header from "../shared/Header/Header";
import NavbarTop from "../shared/NavbarTop/NavbarTop";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";
// import PaginatedItems from '../shared/Pagination/Pagination';
import { ReactComponent as Trash } from "../../assets/images/trash.svg";
import { useLocation } from "react-router-dom";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../config/axios";
// import SubmittalTable from './submittalTable';
// import TestingTable from './testingTable';
// import CloseOutTable from './closeOutTable';
// import MeetingTable from './meetingTable';
// import { CSVLink } from 'react-csv';
import CombinedLogs from "./combinedLogs";
import { debounce, get } from "lodash";
import Loader from "../shared/Loader/Loader";
// import * as XLSX from 'xlsx';
import PdfWrapper from "../../pdfWrapper";
import FileDownload from "js-file-download";
import { UploadDocuments } from "../ProjectDetails/UploadDocuments";
import { useSearchParams } from "react-router-dom";
import Procore from "./procore";
import { useNavigate } from "react-router-dom";
import { ReactComponent as Logo } from "../../assets/images/procore-vector-logo.svg";

const ProjectLogs = () => {
  const navigate = useNavigate();
  const [navigateToSubmittal, setNavigateToSubmittal] = useState(false);
  const [modal, setModal] = useState(false);
  const [errorModal, toggleErrorModal] = useState(false);
  const [successModal, toggleSuccessModal] = useState(false);
  const toggleModal = () => setModal(!modal);
  const [pdfFile, setPdfFile] = useState({});
  const [fileData, setFileData] = useState({});
  const [isUploadLoading, setUploadLoading] = useState(false);

  const [saveListName, setToggleSaveListNameModal] = useState(false);
  const toggleSaveListName = () => setToggleSaveListNameModal(!saveListName);
  const [listName, setListName] = useState({ value: "", errors: "" });
  const [viewList, setList] = useState([]);
  const [viewSavedList, setToggleViewSavedList] = useState(false);
  const toggleViewSavedList = () => setToggleViewSavedList(!viewSavedList);
  const { state } = useLocation();
  const [logData, setLogData] = useState([]);
  const [filteredLogData, setFilteredLogData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [pageRefresh, setPageRefresh] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  // const [currentItems, setCurrentItems] = useState([]);
  // const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setLoading] = useState(false);
  const [groupingData, setGroupingData] = useState([]);
  const [selectedLogData, setSelectedLogData] = useState([]);
  const [listId, setListId] = useState(null);
  const [pdfData, setPdfData] = useState({
    url: "",
    textLoc: {},
    index: "",
    docId: null,
  });
  const [newRowIndex, setNewRowIndex] = useState(null);
  const projectType = state?.project.project_type;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [procoreProjectId, setProcoreProjectId] = useState(null);

  //Procore states
  const [procoreModal, setProcoreModal] = useState(false);
  const toggleProcoreModal = () => setProcoreModal(!procoreModal);
  const [companyList, setCompanyList] = useState([]);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const [searchParams] = useSearchParams();
  const projectDetails = searchParams.get("projectDetails")?.split(",");
  const projectId = JSON.parse(projectDetails[0]);
  const customerId = JSON.parse(projectDetails[1]);
  const projectName = searchParams.get("projectName");
  const logType = projectDetails[2];
  const authCode = searchParams.get("code");

  useEffect(() => {
    if (!modal) {
      setPdfFile({});
    }
  }, [modal]);

  const backToUpload = () => {
    toggleErrorModal(false);
    setModal(true);
  };

  const handleSubmit = async () => {
    // console.log(pdfFile);
    try {
      setUploadLoading(true);
      const data = new FormData();
      data.append("project_id", state.project?.project_id);
      projectType === "ufgs" && data.append("project_type", projectType);
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
        setModal(false);
        toggleSuccessModal(true);
        setPageRefresh(!pageRefresh);
      }
    } catch (error) {
      setUploadLoading(false);
      toggleErrorModal(true);
      setModal(false);
      toast.error("Something went wrong!", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleSearchChange = useCallback(
    (value) =>
      debounce(
        setSearchValue(value),
        newRowIndex &&
          setLogData([
            ...logData.slice(0, newRowIndex),
            ...logData.slice(newRowIndex + 1),
          ]),
        setNewRowIndex(null),
        200
      ),
    [setSearchValue, logData, newRowIndex]
  );

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      let selectedLogs = selected.filter((logId) => logId !== id);
      setSelected(selectedLogs);
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleGetProjectMappings = async() =>{
    await axiosInstance({
      method: "get",
      url: `/procore/project_mapping/${projectId}`,
    }).then((res) => {
      if (get(res, "data.data")) {
        localStorage.setItem(
          "companyId",
          get(res, "data.data.procore_company_id")
        );
        localStorage.setItem("projectId", projectId);
        localStorage.setItem("logType", logType);
        localStorage.setItem("customerId", customerId);
        setProcoreProjectId(get(res, "data.data.procore_project_id"));
      }
    });
  }

  useEffect(() => {
    if (authCode) {
      const fetchData = async () => {
        const accessTokenData = await axiosInstance({
          method: "post",
          url: "/procore/access_token",
          data: {
            code: authCode,
            redirect_uri: `http://d3fy104eoanlsd.cloudfront.net/project-logs?projectDetails=${projectId},${customerId},${logType}`,
          },
        });
        localStorage.setItem(
          "procore_access_token",
          accessTokenData?.data.data.access_token
        );
        handleGetProjectMappings();
      };

      fetchData().catch((error) => {
        toast.error("Something went wrong!", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
    }
  }, [authCode, customerId, logType, projectId, handleGetProjectMappings]);

  useEffect(() => {
   
    if(authCode) {
      handleGetProjectMappings();
      if (!procoreProjectId) {
        const fetchData = async () => {
          setProcoreModal(true);
          const companyResp = await axiosInstance({
            method: "get",
            url: "/procore/companies",
          });
          setCompanyList(companyResp?.data.data);
        };
        fetchData().catch((error) => {
          toast.error("Something went wrong!", {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        });
      } else {
        searchParams.set("code", "");
        setNavigateToSubmittal(!navigateToSubmittal);
      }
    }
  }, [procoreProjectId, navigateToSubmittal, searchParams, authCode]);

  useEffect(() => {
    if (navigateToSubmittal) {
      navigate(`/submital-mappings?customerId=${customerId}`);
    }
  }, [navigateToSubmittal, navigate, customerId]);

  // const headers = [
  //   { label: 'Spec Sec', key: 'spec_section' },
  //   { label: 'Paragraph', key: 'para_no' },
  //   { label: 'Requirement Type', key: 'type' },
  //   { label: 'Item', key: 'item_desc' },
  //   { label: 'Grouping', key: 'Grouping' },
  //   { label: 'Paragraph Context', key: 'para_context' },
  //   { label: 'Status', key: 'status' },
  //   { label: 'Date Issued', key: 'date_issued' },
  //   { label: 'Date Approved', key: 'date_approved' },
  //   { label: 'Comments', key: 'comments' },
  // ];
  const handleDeleteLogs = async () => {
    if (selected.length !== 0) {
      try {
        await axiosInstance({
          method: "delete",
          url: "/delete_logs",
          data: {
            project_id: state?.projectId || projectId,
            records: selected,
            type: "Submittal",
          },
        });
        setPageRefresh(!pageRefresh);
        setSelected([]);
        toast.success("Successfully Deleted Logs!", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } catch (error) {
        // console.log(error.message);
        setSelected([]);
        toast.error(error.response.data.message, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await axiosInstance({
        method: "post",
        url: "/filter_logs",
        data: {
          project_id: state?.projectId || projectId,
          search: "",
          filters: {},
          order_col: "",
          order: "",
        },
      });

      setLogData(response.data.message);

      setLoading(false);
    };

    fetchData().catch((error) => {
      setLoading(false);
      toast.error("Something went wrong!", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });
  }, [state, pageRefresh, projectId]);

  // useEffect(()=>{
  //   Afer edit of a column in the selected view below code updates the value of the field
  //   if(selectedLogData.length) {
  //     let logIds = selectedLogData.map((log)=> log.id)
  //     let newSelectedData = logData.filter((log) => { return logIds?.includes(log.id) ? log : null })
  //     setSelectedLogData(newSelectedData);
  //   }
  // },[logData, selectedLogData])
  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: "get",
        url: `/getPackages/${state?.customerId || customerId}`,
      });
      setGroupingData(
        response.data.message.map((packageData) => {
          return {
            value: packageData.id,
            label: packageData.name,
          };
        })
      );

      // console.log(response.data.message);
    };

    fetchData().catch((error) => {
      toast.error("Something went wrong!", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });
  }, [state, pageRefresh, customerId]);

  useEffect(() => {
    let filterData = selectedLogData.length ? selectedLogData : logData;
    let filteredLog = filterData
      .map((log) => {
        return Object.values(log)
          .filter((value) => value)
          .filter((value) => value.toString().includes(searchValue)).length
          ? log
          : null;
      })
      .filter((value) => value);
    setFilteredLogData(filteredLog);
  }, [selectedLogData, logData, searchValue, setFilteredLogData]);
  // let filteredLogData = selectedLogData.length ? selectedLogData : logData

  const handleSelectAll = () => {
    if (selected?.length === filteredLogData?.length) {
      setSelected([]);
    } else {
      let selectedLogs = filteredLogData?.map((log) => {
        return log.id;
      });
      setSelected(selectedLogs);
    }
  };

  // useEffect(() => {
  //   const retriveSelected = localStorage.getItem('selectedRows')?.split(',')?.map( row => JSON.parse(row));
  //   if (retriveSelected) setSelected(retriveSelected);
  // }, []);

  // add the selected rows in session storage to be used by export procore
  useEffect(() => {
    // do not update the values if navigated from procore page
    if (document.referrer && selected?.length) {
      const rowsSelected = selected.toString()
      sessionStorage.setItem("selectedRows", `${rowsSelected}`);

    }
  }, [selected]);

  // const downloadExcel = (logs, fileName) => {
  //   //Boilerplate format of making an xlsx file from xlsx library
  //   //Below header array is specified to maintain the column order in xlsx file same as our table
  //   const worksheet = XLSX.utils.json_to_sheet(logs, { header: ['spec_section', 'para_no', 'type', 'item_desc', 'package', 'para_context', 'status', 'date_issued', 'date_approved', 'comments'] });
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  //   XLSX.writeFile(workbook, logs.length === logData.length ? `${state.projectName || "All-Logs"}.xlsx` : `${fileName}.xlsx`);
  // }
  const handleExportExcel = async (recordData, fileName) => {
    try {
      const response = await axiosInstance({
        method: "post",
        url: "/exportLogs",
        responseType: "arraybuffer",
        data: {
          project_id: state?.projectId || projectId,
          records: recordData,
        },
      });
      let blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      FileDownload(
        blob,
        `${
          state?.project.project_name
        }_logs_${new Date().getHours()}${new Date().getMinutes()}.xlsx`
      );
    } catch (e) {
      toast.error("Something went wrong!", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  const validate = () => {
    let error = false;
    if (listName.value === "") {
      setListName({ ...listName, errors: "List Name is required." });
      error = true;
    }
    return error;
  };
  const handleListSubmit = async (e) => {
    e.preventDefault();
    let errors = validate();
    if (!errors) {
      try {
        await axiosInstance({
          method: "post",
          url: "/save_list",
          data: {
            project_id: state?.projectId || projectId,
            records: selected,
            view_name: listName.value,
          },
        });
        setToggleSaveListNameModal(false);
      } catch (error) {
        toast.error("Something went wrong!", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };
  const getList = async () => {
    try {
      const response = await axiosInstance({
        method: "get",
        url: `/get_list/${state?.projectId || projectId}`,
      });
      setList(response.data.message);
      setToggleViewSavedList(true);
    } catch (error) {
      toast.error("Something went wrong!", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  // const handleProcoreExport = async () => {
  //   try {
  //     await axios({
  //       method: 'get',
  //       url: `https://login-sandbox.procore.com/oauth/authorize`,
  //       params: {
  //         response_type: 'code',
  //         client_id: 'ce62990f797459a3dd5005c1323a30beb75fafd0ac6304353101b44e809ddcc9',
  //         redirect_uri: `http://localhost:3000/project-logs?projectId=${projectId}&customerId=${customerId}&logType=${logType}`
  //       }
  //     }).then(res => {window.open(res.request?.responseURL,"_self")});
  //   } catch(e) {
  //     toast.error('Something went wrong!', {
  //       position: 'bottom-center',
  //       autoClose: 5000,
  //       hideProgressBar: true,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //     });
  //   }
  // }
  return (
    <div className="page-wrap">
      <NavbarTop />
      <div className="project-logs-wrapper log-table-width">
        <Header
          // title={`${state.project?.type} Logs  - ${state.projectName || ''}`}
          title={`All ${
            projectType === "ufgs" ? "UFGS" : "Commercial"
          } Logs  - ${state?.projectName || projectName || ""}`}
          breadcrumb={"Project Details"}
          breadcrumb2={"View Projects"}
          breadcrumb3={"Requrement Logs"}
          showBtn={"Upload Document"}
          toggleModal={toggleModal}
          btnSize={"small"}
        />

        <div className="project-logs-content">
          <div className="project-logs">
            {logData.length === 0 ? (
              <div className="nologs-wrapper d-flex align-items-center justify-content-center w-100">
                <span className="d-flex align-items-center justify-content-center">
                  Please upload documents, before seeing the logs
                </span>
              </div>
            ) : (
              <>
                <div className="table-top-content">
                  <div className="table-heading">
                    {/* <h5 className="m-0">{`${state.project?.type} List`} </h5> */}
                    {/* <label className="table-entries">
                      Showing entries <span className="showing-strong"> 6 </span>
                      of <span className="showing-strong"> 90 </span>.
                    </label> */}
                  </div>
                  {selectedLogData.length ? (
                    <button
                      type="button"
                      className="btn btn-primary mr-3 btn-small"
                      onClick={() => setSelectedLogData([])}
                    >
                      Clear Selection
                    </button>
                  ) : null}
                  {!selectedLogData.length ? (
                    <button
                      type="button"
                      className="btn btn-primary mr-3 btn-small"
                      onClick={toggleSaveListName}
                    >
                      Save Selection
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={getList}
                  >
                    {" "}
                    View Saved Lists{" "}
                  </button>
                  <div className="table-bulk-changes">
                    {/* {pdfData.url && <button type="button" className='btn btn-secondary' onClick={()=>setPdfData({url: '', textLoc: {}})}> Close Pdf </button>} */}
                    <div className="log-search">
                      <input
                        type="text"
                        placeholder="Find In Log"
                        className="search-icon log-search-input"
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                    </div>
                    {localStorage.getItem("roleId") !== "7" && (
                      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                        <DropdownToggle caret>Export</DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem
                            onClick={() => handleExportExcel("All")}
                          >
                            Excel
                          </DropdownItem>
                          <DropdownItem>
                            <a
                              href={`https://login-sandbox.procore.com/oauth/authorize?response_type=code&client_id=ce62990f797459a3dd5005c1323a30beb75fafd0ac6304353101b44e809ddcc9&redirect_uri=http://d3fy104eoanlsd.cloudfront.net/project-logs?projectDetails=${projectId},${customerId},${logType}`}
                              className="breadcrumb-text"
                            >
                              <Logo style={{ height: "90px" }} />
                            </a>
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    )}
                    <button
                      type="button"
                      className="d-flex btn btn-secondary btn-sm"
                      onClick={handleDeleteLogs}
                    >
                      {" "}
                      <Trash />{" "}
                    </button>
                  </div>
                </div>
                <div className={pdfData.url && "side-by-side"}>
                  <CombinedLogs
                    logData={filteredLogData}
                    setFilteredLogData={setFilteredLogData}
                    selected={selected}
                    handleSelect={handleSelect}
                    handleSelectAll={handleSelectAll}
                    pageRefresh={pageRefresh}
                    setPageRefresh={setPageRefresh}
                    customerId={state?.customerId || customerId}
                    groupingData={groupingData}
                    setLogData={setLogData}
                    projectId={state?.projectId || projectId}
                    listId={listId}
                    selectedLogData={selectedLogData}
                    setSelectedLogData={setSelectedLogData}
                    setPdfData={setPdfData}
                    pdfData={pdfData}
                    completeLogData={logData}
                    newRowIndex={newRowIndex}
                    setNewRowIndex={setNewRowIndex}
                    searchValue={searchValue}
                    projectType={projectType}
                  />
                  {pdfData.url && <PdfWrapper pdfData={pdfData} />}
                  {/* <Tester/> */}
                </div>
                {/* {state.project?.type === 'Submittal' && (
                 
                  <SubmittalTable
                    logData={logData}
                    selected={selected}
                    handleSelect={handleSelect}
                    handleSelectAll={handleSelectAll}
                  />
                )}
                {state.project?.type === 'Testing' && (
                  <TestingTable
                    logData={logData}
                    selected={selected}
                    handleSelect={handleSelect}
                    handleSelectAll={handleSelectAll}
                  />
                )}
                {state.project?.type === 'Meeting' && (
                  <MeetingTable
                    logData={logData}
                    selected={selected}
                    handleSelect={handleSelect}
                    handleSelectAll={handleSelectAll}
                  />
                )}
                {state.project?.type === 'Closeout' && (
                  <CloseOutTable
                    logData={logData}
                    selected={selected}
                    handleSelect={handleSelect}
                    handleSelectAll={handleSelectAll}
                  />
                )}{' '} */}
              </>
            )}

            {/* <div className="table-footer-content">
              <button type="button" className="btn btn-secondary btn-sm">
                Back
              </button>
              <PaginatedItems
                items={logData}
                setCurrentItems={setCurrentItems}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
              />
            </div> */}
          </div>
        </div>
      </div>
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
      {isLoading && <Loader showComponentLoader={true} />}
      <UploadDocuments
        modal={modal}
        toggleModal={toggleModal}
        setPdfFile={setPdfFile}
        pdfFile={pdfFile}
        handleSubmit={handleSubmit}
        isUploadLoading={isUploadLoading}
        errorModal={errorModal}
        toggleErrorModal={toggleErrorModal}
        backToUpload={backToUpload}
        successModal={successModal}
        toggleSuccessModal={toggleSuccessModal}
        fileData={fileData}
      />
      <Procore
        customerId={customerId}
        procoreModal={procoreModal}
        toggleProcoreModal={toggleProcoreModal}
        companyList={companyList}
        projectId={projectId}
      />
      <Modal
        isOpen={saveListName}
        fade={false}
        toggle={toggleSaveListName}
        className="new-customer modal-md"
      >
        <ModalHeader toggle={toggleSaveListName}>Save Selection</ModalHeader>
        <ModalBody>
          <form className="create-customer-form">
            <div className="save-list-name">
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="saveSelectionName"
                      aria-describedby="saveSelectionName"
                      placeholder="Enter"
                      required
                      value={listName.value}
                      onChange={(e) => {
                        setListName({ ...listName, value: e.target.value });
                      }}
                    />
                    <label className="text-label" htmlFor="saveSelectionName">
                      List Name
                    </label>
                    {listName.errors && (
                      <small className="form-error error-red">
                        {listName.errors}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <ModalFooter>
              <Button color="secondary" onClick={toggleSaveListName}>
                Cancel
              </Button>
              <Button color="primary" onClick={handleListSubmit}>
                Save
              </Button>{" "}
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      <Modal
        isOpen={viewSavedList}
        fade={false}
        toggle={toggleViewSavedList}
        className="new-customer modal-md"
      >
        <ModalHeader toggle={toggleViewSavedList}>Saved List</ModalHeader>
        <ModalBody>
          <div className="save-list-name">
            {viewList.length
              ? viewList.map((list) => {
                  return (
                    <div className="row mb-3">
                      <div className="col-6">
                        <h5 className="my-2">{list.view_name}</h5>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-item-center justify-content-flex-end">
                          <button
                            type="button"
                            className="btn btn-primary mr-3"
                            onClick={() => {
                              setSelectedLogData(
                                logData.filter((log) => {
                                  return list.records.includes(log.id)
                                    ? log
                                    : null;
                                })
                              );
                              setToggleViewSavedList(false);
                              setListId(list.id);
                            }}
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ textTransform: "none" }}
                            onClick={() =>
                              handleExportExcel(
                                logData
                                  .map((log) => {
                                    return list.records.includes(log.id)
                                      ? log.id
                                      : null;
                                  })
                                  .filter((id) => id),
                                list.view_name
                              )
                            }
                          >
                            Export .xls
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
          <ModalFooter>
            <Button color="secondary" onClick={toggleViewSavedList}>
              Close
            </Button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ProjectLogs;
