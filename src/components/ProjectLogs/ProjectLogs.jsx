/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import Header from "../shared/Header/Header";
import NavbarTop from "../shared/NavbarTop/NavbarTop";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";
import { ReactComponent as Trash } from "../../assets/images/trash.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../config/axios";
import CombinedLogs from "./combinedLogs";
import { debounce, get } from "lodash";
import Loader from "../shared/Loader/Loader";
import PdfWrapper from "../../pdfWrapper";
import FileDownload from "js-file-download";
import { UploadDocuments } from "../ProjectDetails/UploadDocuments";
import { useSearchParams } from "react-router-dom";
import Procore from "./procore";
import { ReactComponent as Logo } from "../../assets/images/procore-vector-logo.svg";
import { ReactComponent as ExcelLogo } from "../../assets/images/excel.svg";
import { ReactComponent as SearchIcon } from "../../assets/images/search.svg";
import handleError from "../../config/errorHandler";
import Pagination from "../shared/Pagination/LogsPagination";
import { getSavedLogs } from "../../api/ProjectLogs/api";
import DocumentStatus from './documentStatus';

const ProjectLogs = () => {
  const [modal, setModal] = useState(false);
  const [errorModal, toggleErrorModal] = useState(false);
  const [successModal, toggleSuccessModal] = useState(false);
  const [showDocumentStatusModal, setShowDocumentStatusModal] = useState(false);
  const toggleDocumentStatusModal = () => setShowDocumentStatusModal(!showDocumentStatusModal);
  const toggleModal = () => setModal(!modal);
  const [pdfFile, setPdfFile] = useState({});
  const [logInViewer, setLogInViewer] = useState(null);
  const [fileData, setFileData] = useState({});
  const [alreadyExistingFiles, setAlreadyExistingFiles] = useState([]);
  const [isUploadLoading, setUploadLoading] = useState(false);

  const [saveListName, setToggleSaveListNameModal] = useState(false);
  const [exportToProcoreModal, setExportToProcoreModal] = useState(false);
  const toggleSaveListName = () => setToggleSaveListNameModal(!saveListName);
  const [listName, setListName] = useState({ value: "", errors: "" });
  const [viewList, setList] = useState([]);
  const [viewSavedList, setToggleViewSavedList] = useState(false);
  const toggleViewSavedList = () => setToggleViewSavedList(!viewSavedList);
  const { state } = useLocation();
  const [logData, setLogData] = useState([]);
  const [filteredLogData, setFilteredLogData] = useState([]);
  const [selected, setSelected] = useState(localStorage?.getItem("selectedRows") === "" ? [] : JSON.parse(localStorage?.getItem("selectedRows")));
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
  const [editRow, setEditRow] = useState(1);
  const [rowData, setRowData] = useState({
    comments: "",
    item_desc: "",
    package: "",
    para_context: "",
    para_no: "",
    project_id: "",
    spec_section: "",
    status: "",
    type: "",
    classification: "",
  });
  const projectType = state?.project.project_type;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const baseUrl = window.location.href.includes("https://app.thelink.ai")
    ? `https://app.thelink.ai/`
    : window.location.href.includes("http://localhost:3000")
    ? `http://localhost:3000/`
    : `https://app-sl.thelink.ai/`;
  //Procore states
  const [procoreModal, setProcoreModal] = useState(false);
  const toggleProcoreModal = () => setProcoreModal(!procoreModal);
  const [companyList, setCompanyList] = useState([]);
  const [companyId, setCompanyId] = useState();
  const [docParsed, setDocParsed] = useState(0);
  const [documentData, setDocumentData] = useState([]);
  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const [searchParams] = useSearchParams();
  const projectDetails = searchParams.get("projectDetails")?.split(",");
  const projectId = projectDetails?.length
    ? JSON.parse(projectDetails[0])
    : null;
  const customerId =
    projectDetails?.length >= 2 ? JSON.parse(projectDetails[1]) : null;
  // const projectName = searchParams.get('projectName');
  const logType = projectDetails?.length >= 3 ? projectDetails[2] : null;
  const projectName = projectDetails?.length >= 4 ? projectDetails[3].replace(/_space/g, ' ') : null;
  const authCode = searchParams.get("code");
  const procoreClientId = window.location.href.includes("https://app.thelink.ai")
    ? "974cb8bfa7aaadc4759a6d60a2d8427387d32db0c4fa4dfbe1da15b5ce3abfc5"
    : "ce62990f797459a3dd5005c1323a30beb75fafd0ac6304353101b44e809ddcc9";
  const procoreAuthBaseUrl = window.location.href.includes("https://app.thelink.ai")
  ? "https://login.procore.com"
  : "https://login-sandbox.procore.com";
  const [procoreProjectName, setProcoreProjectName] = useState('')
  const [selectedFilterValue, setSelectedFilterValue] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const initFilter = {
    spec_section: [],
    item_desc: [],
    classification: [],
    sd_title: [],
    type: []
  }
  const [filterValues, setFilterValues] = useState(initFilter);
  const [showClearFilters, setShowClearFilters] = useState(false)
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [page, setPage] = React.useState(1);

  const [logIdList, setLogIdList] = React.useState([]);
  const [isSelectAll, setIsSelectAll] = React.useState(false);
  const history = useNavigate();
  const [isAssociatedUser, setIsAssociatedUser] = useState(true);

  useEffect(() => {
    if (!modal) {
      setPdfFile({});
    }
  }, [modal]);

  useEffect(() => {
    if (customerId.toString() !== localStorage.getItem("userId")) {
      if (localStorage.getItem("roleId") > 1) {
        setIsAssociatedUser(false);
        history({ pathname: localStorage.getItem('roleId') === '0'
        ? '/admin-landing'
        : '/project-list' })
        toast.warn("You are not authorized to view this project.", {
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
  }, [])

  // get the number of documents uploaded
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await axiosInstance({
        method: "get",
        url: `/project_data/${projectId || state.project?.project_id}`,
      });
      setDocParsed(response.data.doc_parsed);
      setDocumentData(response.data.document_details);
      setLoading(false);
    };

    fetchData().catch((error) => {
      setLoading(false);
      handleError(error);
    });
  }, [state, pageRefresh, projectId]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if(documentIsProcessing(documentData)){
        axiosInstance({
          method: "get",
          url: `/project_data/${projectId || state.project?.project_id}`,
        }).then(response => {
          setDocumentData(response.data.document_details)
          if (!documentIsProcessing(response.data.document_details)){
            fetchLogData(0, rowsPerPage);
          }
        }).catch(error => {
          handleError(error);
        });
      }
    }, 10000); // 10000 milliseconds = 10 seconds
  
    return () => clearInterval(intervalId); // This will clear the interval when the component unmounts
  }, [projectId, state, documentData]); // Dependencies array, re-run the effect if these values change

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
      data.append("project_id", projectId || state.project?.project_id);
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
        setAlreadyExistingFiles(response.data.already_exist);
        setModal(false);
        toggleSuccessModal(true);
        setPageRefresh(!pageRefresh);
      }
    } catch (error) {
      setUploadLoading(false);
      toggleErrorModal(true);
      setModal(false);
      handleError(error);
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
        200,
      ),
    [setSearchValue, logData, newRowIndex],
  );

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      let selectedLogs = selected.filter((logId) => logId !== id);
      setSelected(selectedLogs);
    } else {
      setSelected([...selected, id]);
    }
  };

  const selectedRows =
    localStorage?.getItem("selectedRows") === ""
      ? "All"
      : localStorage?.getItem("selectedRows");
  // ?.split(',')
  // ?.map((row) => JSON.parse(row));

  // onClick export Procore, we redirect to the same page and POST access token // gets called first
  useEffect(() => {
    if (authCode) {
      const fetchData = async () => {
        const accessTokenData = await axiosInstance({
          method: "post",
          url: "/procore/access_token",
          data: {
            code: authCode,
            redirect_uri: `${baseUrl}project-logs?projectDetails=${projectId},${customerId},${logType},${projectName.replace(/ /g, '_space')}`,
          },
        });
        localStorage.setItem(
          "procore_access_token",
          accessTokenData?.data.data.access_token,
        );

        const res = await axiosInstance({
          method: "get",
          url: `/procore/project_mapping/${projectId}`,
        });
        if (get(res, "status") === 200) {
          setCompanyId(get(res, "data.data.procore_company_id"));
          localStorage.setItem(
            "companyId",
            get(res, "data.data.procore_company_id"),
          );
          localStorage.setItem("projectId", projectId);
          localStorage.setItem("logType", logType);
          localStorage.setItem("customerId", customerId);
          localStorage.setItem("projectName", projectName);
          searchParams.set("code", "");
          setProcoreProjectName(get(res, "data.data.procore_project_name"));
          setExportToProcoreModal(true);
        }
        if (get(res, "status") === 204) {
          setProcoreModal(true);
          const companyResp = await axiosInstance({
            method: "get",
            url: "/procore/companies",
          });
          setCompanyList(companyResp?.data.data);
        }
      };

      fetchData().catch((error) => {
        handleError(error);
      });
    }
  }, [
    authCode,
    customerId,
    logType,
    projectId,
    selectedRows,
    searchParams,
    baseUrl,
  ]);

  const handleExportToProcore = async () => {
    try {
      // setStatus(get(statusResp, 'data.data'));
      setLoading(true);
      const resp = await axiosInstance({
        method: "post",
        url: "/procore/create_submittals",
        data: {
          project_id: Number(projectId),
          records: selectedRows, // array of ids
          // status_id: statusResp?.data?.data?.find((sts) => sts.name === 'Open').id || 1
        },
      });
      if (resp.status === 200) {
        // setProjectMappingsNoContent(false)
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
        setSelected([]);
      }
      // setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error", error);
      localStorage.setItem("selectedRows", "");
      setSelected([]);
      handleError(error);
    }
  };

  const handleDeleteLogs = async () => {
    if (selected?.length !== 0) {
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
  const fetchLogData = async (page, itemsPerPage, search, listId=null, _filters=null) => {
    setLoading(true);
    let filters = {};
    if (_filters === null) {
      if (
        Object.values(filterValues)
          .map((value) => (value?.length ? true : false))
          .includes(true)
      ) {
        Object.keys(filterValues).forEach((key) =>
          filterValues[key]?.length
            ? (filters = { ...filters, [key]: filterValues[key] })
            : null,
        );
      }
    }

    const response = await axiosInstance({
      method: "post",
      url: "/filter_logs",
      data: {
        project_id: state?.projectId || projectId,
        search: search || "",
        filters: { ...filters },
        order_col: "",
        order: "",
        page_number: page || 0,
        limit: itemsPerPage,
        list_id: listId
      },
    });
    // setLogData(response.data.message);
    setSelectedFilterValue(response.data.all_filter_vals);

    const submittalLogs = response.data.message;
    setLogData(submittalLogs);
    localStorage.setItem(
      "filteredIds",
      submittalLogs?.map((item) => item?.id),
    );
    setLogIdList(response.data.log_id_list);
    setLoading(false);
    setErrorMessage("");
    if (response.data.message?.length === 0) {
      if (search) {
        setErrorMessage("Sorry, no results found for your search query.");
      } else {
        if (documentData?.length === 0) {
          setErrorMessage("Upload spec documents to generate submittal log");
        } else if (documentIsProcessing(documentData)) {
          setErrorMessage("Documents are being processed...");
        } else {
          setErrorMessage("No submittals were detected in the uploaded document(s)");
        }
      }
    }
    setTotalCount(response?.data?.total_count);
  };
  useEffect(() => {
    fetchLogData(0, rowsPerPage).catch((error) => {
      setLoading(false);
      handleError(error);
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
        }),
      );

      // console.log(response.data.message);
    };

    fetchData().catch((error) => {
      handleError(error);
    });
  }, [state, pageRefresh, customerId]);

  useEffect(() => {
    setFilteredLogData(logData);
  }, [logData, searchValue, setFilteredLogData]);

  const handleSelectAll = () => {
    setIsSelectAll(!isSelectAll);
    setSelected(isSelectAll ? [] : logIdList);
  };

  const documentIsProcessing = (documents) => documents.some(doc => ['PENDING_PROCESSING', 'PROCESSING', 'SUBSECTIONS_EXTRACTED'].includes(doc.document_status));

  // useEffect(() => {
  //   const retriveSelected = localStorage.getItem('selectedRows')?.split(',')?.map( row => JSON.parse(row));
  //   if (retriveSelected) setSelected(retriveSelected);
  // }, []);

  // add the selected rows in session storage to be used by export procore
  useEffect(() => {
    // do not update the values if navigated from procore page
    if (document.referrer && selected?.length) {
      const rowsSelected = JSON.stringify(selected);
      localStorage.setItem("selectedRows", `${rowsSelected}`);
    }
    if (selected?.length === 0) {
      localStorage.setItem("selectedRows", "");
    }
    setIsSelectAll(((selected?.length === logIdList?.length) && (selected?.length > 0)) ? true : false);
  }, [selected]);

  const handleExportExcel = async (recordData, fileName) => {
    try {
      const response = await axiosInstance({
        method: "post",
        url: "/exportLogs",
        responseType: "arraybuffer",
        data: {
          project_id: state?.projectId || projectId,
          records:
            recordData ||
            localStorage
              .getItem("filteredIds")
              ?.split(",")
              ?.map((item) => Number(item)),
        },
      });
      let blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      FileDownload(
        blob,
        `${
          state?.project.project_name || `Project`
        }_logs_${new Date().getHours()}${new Date().getMinutes()}.xlsx`,
      );
    } catch (error) {
      handleError(error);
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
        toast.success("List created successfully", {
          position: "bottom-center",
        });
        setSelected([]);
      } catch (error) {
        handleError(error);
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
      handleError(error);
    }
  };

  const heandleSearchClick = () => {
    fetchLogData(0, rowsPerPage, searchValue, listId);
  };

  const handleOpenSaveList = async (listId) => {
    // const savedLogs = await getSavedLogs(listId);
    setFilterValues(initFilter);

    await fetchLogData(0, rowsPerPage, "", listId, {});

    setListId(listId);
    setSearchValue("");
    
    setToggleViewSavedList(false);
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === 'Enter') {
      heandleSearchClick();
    }
  }

  const handleClearSearch = () => {
    setSearchValue("");

    fetchLogData(0, rowsPerPage, "", listId);
  }

  const handleClearSelection = async() => {
    await fetchLogData(0, rowsPerPage, searchValue, null);
    setListId(null);
    setSelected([]);
  }

  const insertElement = (arr, index, newItem) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted item
    newItem,
    // part of the array after the specified index
    ...arr.slice(index),
  ];

  const handleEditToggle = (log, index) => {
    setRowData(log);
    setEditRow(index);
  };

  const handleAddNewRow = async (content) => {
    try {
      let index = logData?.findIndex((item) => item === logInViewer);
      const dashIndex = logInViewer.para_no.search("-");
      // Below we are making an array of para_nos then filtering them like if log.para_no = 1.04, paraNos will have all entries of 1.04 i.e. 1.04-a, 1.04-b etc.
      const paraNos = logData
        ?.map((log) => log.para_no)
        .filter((paraNo) =>
          paraNo.includes(
            dashIndex !== -1 ? logInViewer.para_no.slice(0, dashIndex) : logInViewer.para_no,
          ),
        );
      //Now we are making an array containing the ascii character values of elements after '-' in paraNos
      const charArray = paraNos.map((paraNo) =>
        paraNo.search("-") !== -1
          ? paraNo.codePointAt(paraNo.search("-") + 1)
          : 96,
      );
      const logObj = {
        ...logInViewer,
        para_no:
          dashIndex !== -1
            ? logInViewer.para_no.slice(0, dashIndex + 1) +
              String.fromCharCode(Math.max(...charArray) + 1)
            : `${logInViewer.para_no}-${String.fromCharCode(
                Math.max(...charArray) + 1,
              )}`,
        para_context: content
      };
      const result = insertElement(logData, index + 1, logObj);
      // setLogData(result)
      setFilteredLogData(result);

      setNewRowIndex(index + 1);
      handleEditToggle(logObj, index + 1);
      if (pdfData.url) {
        let docElement = document.getElementsByClassName("l-table-wrapper");
        docElement[0].scrollTo(890, 0);
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleAppendToSelectedRow = async (content) => {
    try {
      let index = logData?.findIndex((item) => item === logInViewer);
      const logObj = {
        ...logInViewer,
        para_context: `${logInViewer.para_context} \n\n${content}`
      };
      handleEditToggle(logObj, index);
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    Object.keys(filterValues).forEach((key) =>
      filterValues[key]?.length
        ? setShowClearFilters(true)
        : null
    );
  }, [filterValues])

  const clearFilters = async () => {
    setFilterValues(initFilter);
    await fetchLogData(0, rowsPerPage, "", listId, {});
    setShowClearFilters(false);
  }

  const handleProceedWithExport = () => {
    handleExportToProcore()
    setExportToProcoreModal(false);
    toast.info(`Exporting ${selectedRows === 'All' ? logIdList.length : JSON.parse(selectedRows).length} submittals to ${procoreProjectName} project in Procore...`, {
      position: 'bottom-center',
      autoClose: 10000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined
    });
  }

  return (
    <div className="page-wrap">
      <NavbarTop qaDashboard={state?.qaDashboard} />
      {isAssociatedUser === true && <div className="project-logs-wrapper log-table-width">
        <Header
          // title={`${state.project?.type} Logs  - ${state.projectName || ''}`}
          centerText={`${projectType === "ufgs" ? "UFGS" : "Commercial"}`}
          // breadcrumb={'Project Details'}
          breadcrumb={"View Projects"}
          breadcrumbUrl={`/project-list?id=${customerId}`}
          breadcrumb2={"Submittal Log"}
          showBtn={"Upload Documents"}
          toggleModal={toggleModal}
          btnSize={"small"}
          title={state?.projectName || projectName || ""}
          docParsed={docParsed}
          qaDashboard={state?.qaDashboard}
          navBtn={"logs"}
        />
        {documentIsProcessing(documentData) && (
          <div className="alert" style={{ backgroundColor: "#D5E73E" }} role="alert">
            Documents are being processed...
          </div>
        )}

        <div className="project-logs-content">
          <div className="project-logs">
            {/* {logData.length === 0 ? (
              <div className="nologs-wrapper d-flex align-items-center justify-content-center w-100">
                <span className="d-flex align-items-center justify-content-center">
                  {errorMessage
                    ? `Please upload documents, before seeing the logs`
                    : `Refreshing data...`}
                </span>
              </div>
            ) : ( */}
            <>
              {!state?.qaDashboard && (
                <div className="table-top-content">
                  {(listId !== null) ? (
                    <button
                      type="button"
                      className="btn btn-primary mr-3 btn-small"
                      onClick={() => {
                        handleClearSelection();
                      }}
                    >
                      Clear Selection
                    </button>
                  ) : null}
                  {(listId === null) ? (
                    <button
                      type="button"
                      className=" mr-3 table-top-btn btn-disabled"
                      onClick={toggleSaveListName}
                      disabled={selected?.length === 0}
                    >
                      <svg
                        width="14"
                        height="18"
                        viewBox="0 0 14 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.16683 0.666748H12.8335C13.0545 0.666748 13.2665 0.754545 13.4228 0.910826C13.579 1.06711 13.6668 1.27907 13.6668 1.50008V17.4526C13.6669 17.5271 13.647 17.6003 13.6092 17.6645C13.5715 17.7287 13.5171 17.7816 13.4519 17.8176C13.3868 17.8537 13.3131 17.8717 13.2386 17.8696C13.1641 17.8675 13.0916 17.8456 13.0285 17.8059L7.00016 14.0251L0.971829 17.8051C0.908803 17.8447 0.836319 17.8667 0.761914 17.8688C0.68751 17.8709 0.613901 17.853 0.548742 17.817C0.483583 17.781 0.429252 17.7283 0.391398 17.6642C0.353545 17.6001 0.333551 17.527 0.333496 17.4526V1.50008C0.333496 1.27907 0.421294 1.06711 0.577574 0.910826C0.733854 0.754545 0.945816 0.666748 1.16683 0.666748ZM12.0002 2.33341H2.00016V15.1934L7.00016 12.0592L12.0002 15.1934V2.33341Z"
                          fill={selected?.length === 0 ? "#374151" : "#0E2332"}
                        />
                      </svg>
                      <span>Save Selection</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="table-top-btn"
                    onClick={getList}
                  >
                    <svg
                      width="18"
                      height="14"
                      viewBox="0 0 18 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16.7058 6.22443C16.9872 6.70814 16.9872 7.2942 16.7058 7.7779C15.7367 9.44405 13.0929 13.2113 9.00016 13.2113C4.90743 13.2113 2.26364 9.44405 1.29451 7.7779C1.01316 7.2942 1.01316 6.70814 1.29451 6.22443C2.26364 4.55828 4.90743 0.791016 9.00016 0.791016C13.0929 0.791016 15.7367 4.55828 16.7058 6.22443Z"
                        stroke="#0E2332"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M11.3887 7.00117C11.3887 8.32031 10.3193 9.38969 9.00016 9.38969C7.68102 9.38969 6.61164 8.32031 6.61164 7.00117C6.61164 5.68202 7.68102 4.61265 9.00016 4.61265C10.3193 4.61265 11.3887 5.68202 11.3887 7.00117Z"
                        stroke="#0E2332"
                        strokeWidth="1.5"
                      />
                    </svg>

                    <span>View Saved Lists</span>
                  </button>
                  <button
                    type="button"
                    className="table-top-btn ml-3"
                    onClick={toggleDocumentStatusModal}
                  >
                    <span>Check Document Status</span>
                  </button>
                  <div className="table-bulk-changes">
                    {showClearFilters && <div className="clear-filters">
                      <button
                        type="button"
                        className="table-top-btn ml-3"
                        onClick={clearFilters}
                      >
                        <span>Clear Filters</span>
                      </button>
                    </div>}
                    <div className="log-search">
                      <input
                        type="text"
                        placeholder="Find In Log"
                        className="log-search-input"
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyPress={handleEnterKeyPress}
                      />
                      <span
                        className="search-icon"
                        onClick={heandleSearchClick}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17.5001 17.4998L12.9165 12.9167"
                            stroke="#CBCBCB"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="8.75"
                            cy="8.75"
                            r="5.5"
                            stroke="#CBCBCB"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </span>
                      <span
                        className="clear-icon"
                        onClick={handleClearSearch}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 5L15 15" stroke="#cbcbcb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 5L5 15" stroke="#cbcbcb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                    {localStorage.getItem("roleId") !== "7" && (
                      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                        <DropdownToggle caret>Export</DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem
                            onClick={() => handleExportExcel("All")}
                          >
                            <ExcelLogo style={{ height: "90px" }} />
                          </DropdownItem>
                          <DropdownItem>
                            <a
                              href={`${procoreAuthBaseUrl}/oauth/authorize?response_type=code&client_id=${procoreClientId}&redirect_uri=${baseUrl}project-logs?projectDetails=${projectId},${customerId},${logType},${projectName.replace(/ /g, '_space')}`}
                              className="breadcrumb-text"
                            >
                              <Logo style={{ height: "90px" }} />
                            </a>
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    )}
                    {localStorage.getItem("roleId") !== "7" && (
                      <button
                        type="button"
                        className="trash-icon"
                        onClick={handleDeleteLogs}
                      >
                        <svg
                          width="16"
                          height="18"
                          viewBox="0 0 16 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14.125 4.55556L13.3661 15.3489C13.3007 16.2792 12.5387 17 11.6205 17H4.37946C3.46134 17 2.69932 16.2792 2.63391 15.3489L1.875 4.55556M6.25 8.11111V13.4444M9.75 8.11111V13.4444M10.625 4.55556V1.88889C10.625 1.39797 10.2332 1 9.75 1H6.25C5.76675 1 5.375 1.39797 5.375 1.88889V4.55556M1 4.55556H15"
                            stroke="#0E2332"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
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
                  setPdfData={setPdfData}
                  pdfData={pdfData}
                  completeLogData={logData}
                  newRowIndex={newRowIndex}
                  setNewRowIndex={setNewRowIndex}
                  searchValue={searchValue}
                  projectType={projectType}
                  qaDashboard={state?.qaDashboard}
                  selectedFilterValue={selectedFilterValue}
                  filterValues={filterValues}
                  setFilterValues={setFilterValues}
                  setTotalCount={setTotalCount}
                  errorMessage={errorMessage}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  setLogInViewer={setLogInViewer}
                  editRow={editRow}
                  setEditRow={setEditRow}
                  rowData={rowData}
                  setRowData={setRowData}
                  setLogIdList={setLogIdList}
                  isSelectAll={isSelectAll}
                  setSelected={setSelected}
                />
                {pdfData.url && (
                  <PdfWrapper
                    pdfData={pdfData}
                    setPdfData={setPdfData}
                    handleAddNewRow={handleAddNewRow}
                    handleAppendToSelectedRow={handleAppendToSelectedRow}
                    setLogInViewer={setLogInViewer}
                  />
                )}
              </div>
              <div className="table-footer-content logs-pagination">
                <Pagination
                  totalItems={totalCount}
                  fetchData={fetchLogData}
                  rowsPerPage={rowsPerPage}
                  setRowsPerPage={setRowsPerPage}
                  page={page}
                  setPage={setPage}
                  listId={listId}
                  searchValue={searchValue}
                />
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
            {/* )} */}
          </div>
        </div>
      </div>}
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
        alreadyExistingFiles={alreadyExistingFiles}
      />
      <Procore
        companyId={companyId}
        companyList={companyList}
        procoreModal={procoreModal}
        projectId={projectId}
        toggleProcoreModal={toggleProcoreModal}
        setProcoreModal={setProcoreModal}
        setExportToProcoreModal={setExportToProcoreModal}
      />
      <Modal
        isOpen={saveListName}
        fade={false}
        toggle={toggleSaveListName}
        className="new-customer modal-md"
      >
        <ModalHeader>Save Selection</ModalHeader>
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
              <Button className="save-btn" onClick={handleListSubmit}>
                Save
              </Button>
              <Button
                className="cancel-btn"
                color="secondary"
                onClick={toggleSaveListName}
              >
                Cancel
              </Button>
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
        <ModalHeader>Saved List</ModalHeader>
        <ModalBody>
          <div className="save-list-name save-list">
            {viewList?.length
              ? viewList?.map((list) => {
                  return (
                    JSON.parse(list.records)?.length !== 0 && (
                      <div className="row">
                        <div className="col-6">
                          <h5 className="">{list.view_name}</h5>
                        </div>
                        <div className="col-6">
                          <div className="d-flex align-item-center justify-content-flex-end">
                            <button
                              type="button"
                              className="btn open-btn mr-2"
                              onClick={() => {
                                handleOpenSaveList(list.id);
                              }}
                            >
                              Open
                            </button>
                            {localStorage.getItem("roleId") !== "7" && (
                              <button
                                type="button"
                                className="btn open-btn"
                                style={{ textTransform: "none" }}
                                onClick={() =>
                                  handleExportExcel(
                                    list.records,
                                    list.view_name,
                                  )
                                }
                              >
                                Export .xls
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  );
                })
              : null}
          </div>
          <ModalFooter>
            <Button
              className="cancel-btn"
              color="secondary"
              onClick={toggleViewSavedList}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalBody>
      </Modal>

      <Modal 
        isOpen={showDocumentStatusModal} 
        toggle={toggleDocumentStatusModal}
        fade={false}
        className="new-customer modal-xl"
      >
        <ModalHeader toggle={toggleDocumentStatusModal}>
          Document Status
        </ModalHeader>
        <ModalBody>
          <DocumentStatus documentData={documentData} />
        </ModalBody>
      </Modal>

      <Modal
        isOpen={exportToProcoreModal}
        fade={false}
        toggle={() => setExportToProcoreModal(!exportToProcoreModal)}
        className="new-customer modal-md"
      >
        <ModalHeader>Export to Procore</ModalHeader>
        <ModalBody>
          <form className="create-customer-form">
            <div className="save-list-name">
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <p>
                      This action will export
                      <b> {selectedRows === 'All' ? logIdList?.length : JSON.parse(selectedRows)?.length} </b>
                      submittals to the
                      <b> {procoreProjectName}</b> project in Procore. 
                      Do you want to proceed?
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <ModalFooter>
              <Button className="save-btn" onClick={() => handleProceedWithExport()}>
                Proceed with Export
              </Button>
              <Button
                className="cancel-btn"
                color="secondary"
                onClick={() => setExportToProcoreModal(false)}
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ProjectLogs;
