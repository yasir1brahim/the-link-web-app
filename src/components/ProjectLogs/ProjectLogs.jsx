/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useContext } from "react";
import Header from "../shared/Header/Header";
import NavbarTop from "../shared/NavbarTop/NavbarTop";

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
import { ReactComponent as SearchIcon } from "../../assets/images/search.svg";
import { ReactComponent as Sparkles } from "../../assets/images/sparkles.svg";
import handleError from "../../config/errorHandler";
import Pagination from "../shared/Pagination/LogsPagination";
import { getExportJetBuildData, getSavedLogs } from "../../api/ProjectLogs/api";
import DocumentStatus from "./documentStatus";
import ProjectLogsHeader from "../shared/Header/ProjectLogsHeader";
import ProjectLogsHeaderTop from "../shared/Header/ProjectLogsHeaderTop";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { AuthContext } from '../../auth/authcontext';
import { getProjectDetails } from "../../api/Projects/api";
import { getSubmittalItems, getProjectLists, createSubmittalList, deleteSubmittalItems, uploadFiles, getExportExcelData } from "../../api/ProjectLogs/api";
import ManageExcelExport from "./manageExcelExport";
import ProjectLogsActionPanel from "../shared/Header/ProjectLogsActionPanel";


const ProjectLogs = () => {
  const [modal, setModal] = useState(false);
  const [errorModal, toggleErrorModal] = useState(false);
  const [successModal, toggleSuccessModal] = useState(false);
  const [showDocumentStatusModal, setShowDocumentStatusModal] = useState(false);
  const toggleDocumentStatusModal = () =>
    setShowDocumentStatusModal(!showDocumentStatusModal);
  const toggleModal = () => setModal(!modal);
  const [pdfFile, setPdfFile] = useState({});
  const [logInViewer, setLogInViewer] = useState(null);
  const [fileData, setFileData] = useState({});
  const [alreadyExistingFiles, setAlreadyExistingFiles] = useState([]);
  const [isUploadLoading, setUploadLoading] = useState(false);

  const [saveListName, setToggleSaveListNameModal] = useState(false);
  const toggleSaveListName = () => {
    setListName({ ...listName, errors: "" });
    setToggleSaveListNameModal(!saveListName);
    resetListName();
  }
  const [listName, setListName] = useState({ value: "", errors: "" });
  const [viewList, setList] = useState([]);
  const [viewSavedList, setToggleViewSavedList] = useState(false);
  const toggleViewSavedList = () => setToggleViewSavedList(!viewSavedList);
  const { state } = useLocation();
  const [logData, setLogData] = useState([]);
  const [filteredLogData, setFilteredLogData] = useState([]);
  const [selected, setSelected] = useState(
    localStorage?.getItem("selectedRows") === "" ||
      localStorage?.getItem("selectedRows") === null
      ? []
      : JSON.parse(localStorage?.getItem("selectedRows"))
  );
  const [isCombining, setIsCombining] = useState(false);
  const [combiningQueue, setCombiningQueue] = useState([]);
  const [combiningResult, setCombiningResult] = useState({_meta: {}});
  const [pageRefresh, setPageRefresh] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [listId, setListId] = useState(null);
  const [pdfData, setPdfData] = useState({
    url: "",
    textLoc: {},
    index: "",
    docId: null,
    submittalId: null,
    additionalTextLocations: [],
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
  const customerData = state?.customerData;
  const projectType = state?.project?.project_type;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const baseUrl = window.location.href.includes("https://app.thelink.ai")
    ? `https://app.thelink.ai/`
    : window.location.href.includes("http://localhost:3000")
    ? `http://localhost:3000/`
    : `https://app-sl.thelink.ai/`;
  const [manageExcelExportModal, setManageExcelExportModal] = useState(false);
  const toggleManageExcelExportModal = () =>
    setManageExcelExportModal(!manageExcelExportModal);
  const [initLoading, setInitLoading] = useState(false);
  const [loadingProjectDetails, setLoadingProjectDetails] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [companyId, setCompanyId] = useState();
  const [docParsed, setDocParsed] = useState(0);
  const [documentData, setDocumentData] = useState([]);
  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const [searchParams, setSearchParams] = useSearchParams();
  const projectDetails = searchParams.get("projectDetails")?.split(",");
  const submittalId = searchParams.get("submittal_id")
  const [projectId, setProjectId] = useState(projectDetails?.length
    ? JSON.parse(projectDetails[0])
    : null);
  const [customerId, setCustomerId] = useState(
    projectDetails?.length >= 2 ? JSON.parse(projectDetails[1]) : null);
  const [projectName, setProjectName] = useState("");
  const authCode = searchParams.get("code");
  const [loadingView, setLoadingView] = useState(false);
  const [selectedFilterValue, setSelectedFilterValue] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const initFilter = {
    spec_section: [],
    item_desc: [],
    classification: [],
    sd_title: [],
    type: [],
  };
  const [filterValues, setFilterValues] = useState(initFilter);
  const [showClearFilters, setShowClearFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(initFilter);
  const [rowsPerPage, setRowsPerPage] = React.useState(50);
  const [page, setPage] = React.useState(1);

  const [logIdList, setLogIdList] = React.useState([]);
  const [isSelectAll, setIsSelectAll] = React.useState(false);
  const history = useNavigate();
  const [isAssociatedUser, setIsAssociatedUser] = useState(true);

  const [userRole, setUserRole] = useState('');
  const [teamId, setTeamId] = useState(null);

  const { user, isAuthenticated } = useContext(AuthContext);

  const getUserRoleInProject = async (projectData) => {
    console.log('user', user);
    console.log('projectData', projectData);
    if (user.is_superuser) {
      return 'Admin';
    } 
    const membership = projectData.members.find((member) => member.user_id === user.id);
    if (membership) {
      return membership.role === 'admin' ? 'Admin' : 'Member';
    }
    return 'Unauthorized';
  }

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      const response = await getProjectDetails(projectId);
      console.log('projectData', response.data);
      setTeamId(response.data.team);
      setProjectName(response.data.name);
      setDocParsed(response.data.doc_parsed);
      setDocumentData(response.data.document_details);
      setUserRole(getUserRoleInProject(response.data));
      setLoading(false);
    };

    fetchProjectData().catch((error) => {
      setLoading(false);
      handleError(error);
    });

  }, [user, projectId]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (documentIsProcessing(documentData)) {
        const fetchDocumentData = async () => {
          const response = await getProjectDetails(projectId);
          setDocumentData(response.data.document_details);
          console.log('documentIsProcessing', documentIsProcessing(response.data.document_details));
          if (!documentIsProcessing(response.data.document_details)) {
            fetchLogData(0, rowsPerPage);
          }
        };
        fetchDocumentData().catch((error) => {
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

  const resetListName = () => {
  setListName({ value: '', errors: '' });
  };

  const handleSubmit = async () => {
    // console.log(pdfFile);
    try {
      setUploadLoading(true);
      const data = new FormData();
      data.append("project_id", projectId || state.project?.project_id);
      projectType === "ufgs" && data.append("project_type", projectType);
      Object.values(pdfFile)?.forEach((file) => data.append("files", file));
      const response = await uploadFiles(data)
      if (response.data) {
        const check_response = await getProjectDetails(projectId);
        setDocumentData(check_response.data.document_details);
        setDocParsed(check_response.data.doc_parsed);
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
        200
      ),
    [setSearchValue, logData, newRowIndex]
  );

  const areSameValues = (key) => {
    return combiningQueue.every((log) => log[key] === combiningQueue[0][key]);
  }

  const updateCombiningQueue = (selectedIds, force = false) => {
    const newQueue = [];
    console.log(selectedIds, isCombining)
    if (isCombining || force) {
      selectedIds.forEach((id) => {
        const index = logData.findIndex((log) => log.id === id);
        const queueItem = {...logData[index], index}
        newQueue.push(queueItem);
      });

      newQueue.sort((a, b) => a.index - b.index);
    }

    setCombiningQueue(newQueue)
    if (!newQueue.length) {
      setCombiningResult({})
    }

    // Reset values to default if they become homogenous again
    if (newQueue) {
      const newValue = {...combiningResult};

      // Submittal Type & Submittal Title should have the top value as default
      ['type', 'item_desc', 'para_no', 'spec_section'].forEach((key) => {
        newValue[key] = newQueue[0][key];
      })

      // Submittal Description should just be joined with newlines
      newValue['para_context'] = newQueue.map((log) => log.para_context);

      setCombiningResult(newValue);
    }
  }

  const handleSelect = (id) => {
    let selectedLogs;
    if (selected.includes(id)) {
      selectedLogs = selected.filter((logId) => logId !== id);
    } else {
      selectedLogs = [...selected, id];
    }
    setSelected(selectedLogs);

    // If the user was combining, and then unselected everything, get out of
    // the combining mode
    if (selectedLogs.length === 0) {
      setIsCombining(false);
    }
    updateCombiningQueue(selectedLogs);
  };

  const selectedRows =
    localStorage?.getItem("selectedRows") === "" ||
    localStorage?.getItem("selectedRows") === null
      ? "All"
      : localStorage?.getItem("selectedRows");
  // ?.split(',')
  // ?.map((row) => JSON.parse(row));

  const handleDeleteLogs = async () => {
    if (selected?.length !== 0) {
      try {
        await deleteSubmittalItems(state?.projectId || projectId, selected);
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
  const fetchLogData = async (
    page,
    itemsPerPage,
    search,
    listId = null,
    _filters = null,
    orderCol = "",
    order = "",
  ) => {
    setLoading(true);
    setLoadingView(true);
    setLogInViewer(null);

    const submittalItems = await getSubmittalItems(
      projectId,
      search,
      filterValues,
      orderCol,
      order,
      page || 0,
      itemsPerPage,
      listId
    );

    console.log("responseData", submittalItems.data);
    setSelectedFilterValue(submittalItems.data.all_filter_vals);

    const submittalLogs = submittalItems.data.message;
    setLogData(submittalLogs);
    console.log("submittalLogs", submittalLogs);

    if(submittalId) {
      const submittalIdx = submittalLogs.findIndex((log) => log.id.toString() === submittalId);
      if (submittalIdx !== -1) {
        setPdfData({
          url: submittalLogs[submittalIdx].doc_link,
          textLoc: submittalLogs[submittalIdx].text_loc,
          index: submittalIdx,
          docId: submittalLogs[submittalIdx].doc_id,
          submittalId: submittalLogs[submittalIdx].id,
          additionalTextLocations: submittalLogs[submittalIdx].additional_text_locations,
        });
      }
    }

    localStorage.setItem(
      "filteredIds",
      submittalLogs?.map((item) => item?.id)
    );
    setLogIdList(submittalItems.data.log_id_list);
    setLoading(false);
    setLoadingView(false);
    setErrorMessage("");
    if (submittalItems.data.message?.length === 0) {
      if (search) {
        setErrorMessage("Sorry, no results found for your search query.");
      } else {
        if (documentData?.length === 0) {
          setErrorMessage("Upload spec documents to generate submittal log");
        } else if (documentIsProcessing(documentData)) {
          setErrorMessage("Documents are being processed...");
        } else {
          setErrorMessage(
            "No submittals were detected in the uploaded document(s)"
          );
        }
      }
    }
    setTotalCount(submittalItems?.data?.total_count);
  };
  useEffect(() => {
    if (projectId !== null) {
      fetchLogData(0, rowsPerPage).catch((error) => {
        setLoading(false);
        handleError(error);
      });
    }
  }, [state, pageRefresh, projectId]);


  useEffect(() => {
    setFilteredLogData(logData);
  }, [logData, searchValue, setFilteredLogData]);

  const handleSelectAll = () => {
    setIsSelectAll(!isSelectAll);
    setSelected(isSelectAll ? [] : logIdList);

    if (selected?.length === 0) {
      setIsCombining(false);
    }
  };

  const documentIsProcessing = (documents = []) => {
    return documents.some((doc) =>
      ["PENDING_PROCESSING", "PROCESSING", "SUBSECTIONS_EXTRACTED"].includes(
        doc.document_status
      )
    );
  }

  // useEffect(() => {
  //   const retriveSelected = localStorage.getItem('selectedRows')?.split(',')?.map( row => JSON.parse(row));
  //   if (retriveSelected) setSelected(retriveSelected);
  // }, []);

  // add the selected rows in session storage to be used by export procore
  useEffect(() => {
    // do not update the values if navigated from procore page
    if (selected?.length) {
      const rowsSelected = JSON.stringify(selected);
      localStorage.setItem("selectedRows", `${rowsSelected}`);
    }
    if (selected?.length === 0) {
      localStorage.setItem("selectedRows", "");
    }
    setIsSelectAll(
      selected?.length === logIdList?.length && selected?.length > 0
        ? true
        : false
    );
  }, [selected]);

  const handleExportExcel = async (recordData, fileName) => {
    try {
      const exportExcelData = await getExportExcelData(
        state?.projectId || projectId,
        recordData || localStorage.getItem("filteredIds")?.split(",")?.map((item) => Number(item)),
        filterValues
      );

      let blob = new Blob([exportExcelData.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      FileDownload(
        blob,
        `${
          state?.project.project_name || `Project`
        }_logs_${new Date().getHours()}${new Date().getMinutes()}.xlsx`
      );
    } catch (error) {
      handleError(error);
    }
  };

  const handleExportJetBuild = async (recordData) => {
    try {
      const exportExcelData = await getExportJetBuildData(
        state?.projectId || projectId,
        recordData || localStorage.getItem("filteredIds")?.split(",")?.map((item) => Number(item)),
        filterValues
      );

      let blob = new Blob([exportExcelData.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      FileDownload(
        blob,
        `${
          state?.project.project_name || `Project`
        }_logs_${new Date().getHours()}${new Date().getMinutes()}.xlsx`
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

  const handleUpDownView = (direction) => {
    if (!pdfData || loadingView) return;

    if (
      (direction > 0 && pdfData.index < filteredLogData.length - 1) ||
      (direction < 0 && pdfData.index > 0)
    ) {
      const pIndex = pdfData.index + direction;
      const data = filteredLogData[pIndex];
      
      setPdfData({
        ...pdfData,
        url: data.doc_link,
        textLoc: data.text_loc,
        index: pIndex,
        docId: data.doc_id,
        submittalId: data.id,
        additionalTextLocations: data.additional_text_locations,
      });
      setSubmittalIdParam(data.id);
    }
  };

  const setSubmittalIdParam = (submittal_id) => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    if (submittal_id) {
      params.set('submittal_id', submittal_id);
    } else {
      params.delete('submittal_id');
    }
  
    url.search = params.toString();
    window.history.pushState({}, '', url);
  }

  const handleListSubmit = async (e) => {
    e.preventDefault();
    let errors = validate();
    if (!errors) {
      try {
        await createSubmittalList(state?.projectId || projectId, listName.value, localStorage.getItem("userId"), selected);
        resetListName();
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
  const getSavedListsForProjects = async () => {
    try {
      const response = await getProjectLists(state?.projectId || projectId);
      setList(response.data.results);
      setToggleViewSavedList(true);
    } catch (error) {
      handleError(error);
    }
  };

  const handleSearchClick = () => {
    setShowSearch(true);
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
    if (event.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setShowSearch(false);
    fetchLogData(0, rowsPerPage, "", listId);
  };

  const handleClearSelection = async () => {
    await fetchLogData(0, rowsPerPage, searchValue, null);
    setListId(null);
    setSelected([]);
  };

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
            dashIndex !== -1
              ? logInViewer.para_no.slice(0, dashIndex)
              : logInViewer.para_no
          )
        );
      //Now we are making an array containing the ascii character values of elements after '-' in paraNos
      const charArray = paraNos.map((paraNo) =>
        paraNo.search("-") !== -1
          ? paraNo.codePointAt(paraNo.search("-") + 1)
          : 96
      );
      const logObj = {
        ...logInViewer,
        para_no:
          dashIndex !== -1
            ? logInViewer.para_no.slice(0, dashIndex + 1) +
              String.fromCharCode(Math.max(...charArray) + 1)
            : `${logInViewer.para_no}-${String.fromCharCode(
                Math.max(...charArray) + 1
              )}`,
        para_context: content,
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
      console.log("error", error);
    }
  };

  const handleAppendToSelectedRow = async (content) => {
    try {
      let index = logData?.findIndex((item) => item === logInViewer);
      const logObj = {
        ...logInViewer,
        para_context: `${logInViewer.para_context} \n\n${content}`,
      };
      handleEditToggle(logObj, index);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleCombineRows = async () => {
    setLoading(true)

    const payload = {
      prepared_object: combiningResult,
      project_id: projectId,
      lst_all_logs: combiningQueue,
    }

    try {
      await axiosInstance({
        method: 'POST',
        url: '/combine_rows',
        data: payload,
      })
    } finally {
      setLoading(false)
    }

    setIsCombining(false)
    setSelected([])
    setPageRefresh(!pageRefresh);
  }

  useEffect(() => {
    const hasActiveFilters = Object.keys(appliedFilters).some(
      (key) => appliedFilters[key]?.length
    );
    setShowClearFilters(hasActiveFilters);

    fetchLogData(0, rowsPerPage, "", listId, appliedFilters);
  }, [appliedFilters]);

  const clearFilters = () => {
    setFilterValues({ ...initFilter });
    setAppliedFilters({ ...initFilter });
  };

  const applyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
  };

  const handleManageExcelExportButtonClick = async () => {
    setManageExcelExportModal(true);
  };



  return (
    <div className="page-wrap">
      <NavbarTop
        qaDashboard={state?.qaDashboard}
        projectTitle={state?.projectName || projectName || ""}
        handleManageExcelExportButtonClick={handleManageExcelExportButtonClick}
        initLoading={initLoading}
        loadingProjectDetails={loadingProjectDetails}
        customerData={customerData}
      />
      {isAssociatedUser === true && (
        <div className="project-logs-wrapper log-table-width">
          <ProjectLogsHeaderTop
            breadcrumb={"View Projects"}
            breadcrumbUrl={`/project-list/${teamId}`}
            breadcrumb2={"Submittal Log"}
            showBtn={"Upload Documents"}
            toggleModal={toggleModal}
            btnSize={"small"}
            docParsed={docParsed}
            qaDashboard={state?.qaDashboard}
            navBtn={"logs"}
            teamId={teamId}
          />
          <ProjectLogsActionPanel
            handleDeleteLogs={handleDeleteLogs}

            toggle={toggle}
            dropdownOpen={dropdownOpen}
            handleExportExcel={handleExportExcel}
            handleExportJetBuild={handleExportJetBuild}
            getProjectLists={getProjectLists}

            listId={listId}
            selected={selected}
            isCombining={isCombining}
            toggleSaveListName={toggleSaveListName}

            isSelectAll={isSelectAll}
            logInViewer={logInViewer}
            setLogInViewer={setLogInViewer}
            setPdfData={setPdfData}
            pdfData={pdfData}
            setIsCombining={setIsCombining}
            updateCombiningQueue={updateCombiningQueue}
            editRow={editRow}
            handleCombineRows={handleCombineRows}

            handleClearSelection={handleClearSelection}

            setSubmittalIdParam={setSubmittalIdParam}

            documentIsProcessing={documentIsProcessing}
            documentData={documentData}
            toggleDocumentStatusModal={toggleDocumentStatusModal}
            
            showClearFilters={showClearFilters}
            clearFilters={clearFilters}

            showSearch={showSearch}
            searchValue={searchValue}
            handleSearchChange={handleSearchChange}
            handleEnterKeyPress={handleEnterKeyPress}
            handleSearchClick={handleSearchClick}
            handleClearSearch={handleClearSearch}

            docParsed={docParsed}
            totalCount={totalCount}
            showBtn={"Upload Documents"}
            toggleModal={toggleModal}
            btnSize={"small"}
          />
          {documentIsProcessing(documentData) && (
            <div
              className="alert"
              style={{ backgroundColor: "#D5E73E" }}
              role="alert"
            >
              Documents are being processed...
            </div>
          )}

          <div className="project-logs-content">
            <div className="project-logs">
              <div className={pdfData.url && "side-by-side"}>
                <CombinedLogs
                  logData={filteredLogData}
                  setFilteredLogData={setFilteredLogData}
                  selected={selected}
                  handleSelect={handleSelect}
                  handleSelectAll={handleSelectAll}
                  pageRefresh={pageRefresh}
                  setPageRefresh={setPageRefresh}
                  setLoading={setLoading}
                  customerId={state?.customerId || customerId}
                  setLogData={setLogData}
                  projectId={state?.projectId || projectId}
                  listId={listId}
                  setPdfData={setPdfData}
                  setSubmittalIdParam={setSubmittalIdParam}
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
                  loading={loadingView}
                  fetchLogData={fetchLogData}
                  applyFilters={applyFilters}
                  isCombining={isCombining}
                  setIsCombining={setIsCombining}
                  combiningQueue={combiningQueue}
                  setCombiningQueue={setCombiningQueue}
                  updateCombiningQueue={updateCombiningQueue}
                  combiningResult={combiningResult}
                  setCombiningResult={setCombiningResult}
                  handleCombineRows={handleCombineRows}
                  areSameValues={areSameValues}
                />
                {pdfData.url && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                        justifyContent: "center",
                      }}
                    >
                      <button
                        disabled={pdfData && pdfData.index > 0 ? false : true}
                        onClick={() => {
                          handleUpDownView(-1);
                        }}
                        style={{
                          borderColor: "#E2E2E2",
                          borderWidth: "thin",
                        }}
                      >
                        <ArrowDropUpIcon/>
                      </button>
                      <button
                        disabled={
                          pdfData &&
                          pdfData.index < filteredLogData.length - 1
                            ? false
                            : true
                        }
                        onClick={() => {
                          handleUpDownView(1);
                        }}
                        style={{
                          borderColor: "#E2E2E2",
                          borderWidth: "thin",
                        }}
                      >
                        <ArrowDropDownIcon />
                      </button>
                    </div>
                    <PdfWrapper
                      pdfData={pdfData}
                      setPdfData={setPdfData}
                      setSubmittalIdParam={setSubmittalIdParam}
                      handleAddNewRow={handleAddNewRow}
                      handleAppendToSelectedRow={handleAppendToSelectedRow}
                      setLogInViewer={setLogInViewer}
                      loading={loadingView}
                      setLoading={setLoadingView}
                    />
                  </div>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    marginTop: "10px",
                    fontStyle: "italic",
                    fontSize: "14px",
                  }}
                >
                  <strong>Note: </strong>
                  <span role="img" aria-label="sparkle">
                    <Sparkles />
                  </span>{" "}
                  indicates this submittal was extracted by our AI.
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
              </div>
            </div>
          </div>
        </div>
      )}
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
      <Modal
        isOpen={saveListName}
        fade={false}
        toggle={toggleSaveListName}
        onClosed={resetListName}
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
                        setListName({ ...listName, value: e.target.value, errors: "" });
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
        <ModalHeader>Saved Lists</ModalHeader>
        <ModalBody>
          <div className="save-list-name save-list">
            {viewList?.length
              ? viewList?.map((list) => {
                  return (
                    list.submittals?.length !== 0 && (
                      <div className="row">
                        <div className="col-6">
                          <h5 className="">{list.name}</h5>
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
                                    list.submittals,
                                    list.name
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

      {manageExcelExportModal && <ManageExcelExport
        manageExcelExportModal={manageExcelExportModal}
        toggleManageExcelExportModal={toggleManageExcelExportModal}
      />}
    </div>
  );
};

export default ProjectLogs;
