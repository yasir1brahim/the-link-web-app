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
import NoticesLog from "./NoticesLog";
import { debounce, get } from "lodash";
import Loader from "../shared/Loader/Loader";
import PdfWrapper from "../../pdfWrapper";
import FileDownload from "js-file-download";
import { UploadDocuments } from "../ProjectDetails/UploadDocuments";
import { useSearchParams } from "react-router-dom";
import { ReactComponent as Sparkles } from "../../assets/images/sparkles.svg";
import handleError from "../../config/errorHandler";
import Pagination from "../shared/Pagination/LogsPagination";
import DocumentStatus from "../ProjectLogs/documentStatus";
import ProjectLogsHeaderTop from "../shared/Header/ProjectLogsHeaderTop";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { AuthContext } from '../../auth/authcontext';
import { getProjectDetails } from "../../api/Projects/api";
import { uploadFiles } from "../../api/ProjectLogs/api";
import { getNotices } from "../../api/Notices/api";
import ProjectLogsActionPanel from "../shared/Header/ProjectLogsActionPanel";
import { isNoticesFlagActive } from "../../api/FeatureFlags/api";
import { getUserRoleInTeam } from "../../api/Authentication/api";

const NoticesPage = () => {
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

  const { state } = useLocation();
  const [noticesData, setNoticesData] = useState([]);
  const [filteredNoticesData, setFilteredNoticesData] = useState([]);
  const [selected, setSelected] = useState(
    localStorage?.getItem("selectedRows") === "" ||
      localStorage?.getItem("selectedRows") === null
      ? []
      : JSON.parse(localStorage?.getItem("selectedRows"))
  );
  const [pageRefresh, setPageRefresh] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [pdfData, setPdfData] = useState({
    url: "",
    textLoc: {},
    index: "",
    docId: null,
    additionalTextLocations: [],
  });
  const [newRowIndex, setNewRowIndex] = useState(null);
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [loadingProjectDetails, setLoadingProjectDetails] = useState(false);
  const [docParsed, setDocParsed] = useState(0);
  const [documentData, setDocumentData] = useState([]);
  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const [searchParams, setSearchParams] = useSearchParams();
  const projectDetails = searchParams.get("projectDetails")?.split(",");
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
  const [isAssociatedUser, setIsAssociatedUser] = useState(true);

  const [userRole, setUserRole] = useState('');
  const [userRoleInCompany, setUserRoleInCompany] = useState('member');
  const [teamId, setTeamId] = useState(null);

  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

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
      setUserRole(await getUserRoleInProject(response.data));
      setUserRoleInCompany(await getUserRoleInTeam(user.id, response.data.team));
      localStorage.setItem("docParsed", response.data.doc_parsed);
      isNoticesFlagActive(response.data.team).then(isActive => {
        if (!isActive) {
          navigate('/');
        }
      });
      setLoading(false);
    };


    if (projectId !== null) {
      fetchProjectData().catch((error) => {
        setLoading(false);
        handleError(error);
      });
    }
  }, [user, projectId]);

//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       if (documentIsProcessing(documentData)) {
//         const fetchDocumentData = async () => {
//           const response = await getProjectDetails(projectId);
//           setDocumentData(response.data.document_details);
//           console.log('documentIsProcessing', documentIsProcessing(response.data.document_details));
//           if (!documentIsProcessing(response.data.document_details)) {
//             fetchNoticesData(0, rowsPerPage);
//           }
//         };
//         fetchDocumentData().catch((error) => {
//           handleError(error);
//         });
//       }
// //     }, 10000); // 10000 milliseconds = 10 seconds

//     return () => clearInterval(intervalId); // This will clear the interval when the component unmounts
//   }, [projectId, state, documentData]); // Dependencies array, re-run the effect if these values change

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
      data.append('extract_notices', true);
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
          setNoticesData([
            ...noticesData.slice(0, newRowIndex),
            ...noticesData.slice(newRowIndex + 1),
          ]),
        setNewRowIndex(null),
        200
      ),
    [setSearchValue, noticesData, newRowIndex]
  );


  const handleSelect = (id) => {
    let selectedLogs;
    if (selected.includes(id)) {
      selectedLogs = selected.filter((logId) => logId !== id);
    } else {
      selectedLogs = [...selected, id];
    }
    setSelected(selectedLogs);
  };

  const selectedRows =
    localStorage?.getItem("selectedRows") === "" ||
    localStorage?.getItem("selectedRows") === null
      ? "All"
      : localStorage?.getItem("selectedRows");

  
  const fetchNoticesData = async (
    page,
    itemsPerPage,
    search,
    _filters = null,
    orderCol = "",
    order = "",
  ) => {
    console.log("Fetching notice data for projectId: ", projectId);
    if (projectId === null) return;
    setLoading(true);
    setLoadingView(true);
    setLogInViewer(null);

    const noticesResponse = await getNotices(projectId);

    console.log("responseData", noticesResponse);

    const notices = noticesResponse.data.results;
    setNoticesData(notices);
    console.log("notices", notices);


   
    setLoading(false);
    setLoadingView(false);
    setErrorMessage("");
    setTotalCount(notices.length);
  };
  useEffect(() => {
    if (projectId !== null) {
      fetchNoticesData(0, rowsPerPage).catch((error) => {
        setLoading(false);
        handleError(error);
      });
    }
  }, [state, pageRefresh, projectId]);


  useEffect(() => {
    setFilteredNoticesData(noticesData);
  }, [noticesData, searchValue, setFilteredNoticesData]);

  const handleSelectAll = () => {
    setIsSelectAll(!isSelectAll);
    setSelected(isSelectAll ? [] : logIdList);
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


  const formatPrimaryTextLocation = (notice) => {
    const primaryLine = notice.excerpt_anchors[0].lines[0];
    return {
      x: primaryLine.x_start,
      y: primaryLine.y_start,
      end_x: primaryLine.x_end,
      end_y: primaryLine.y_end,
      page_no: primaryLine.page_no,
    }
  }

  const formatAdditionalTextLocations = (notice) => {
    const additionalLinesFromPrimaryAnchor = notice.excerpt_anchors[0].lines.slice(1);
    const additionalLinesFromOtherAnchors = notice.excerpt_anchors.slice(1).map((anchor) => anchor.lines);
    const additionalLines = [...additionalLinesFromPrimaryAnchor];
    for (const lines of additionalLinesFromOtherAnchors) {
      additionalLines.push(...lines);
    }

    const additionalTextLocations = additionalLines.map((line) => ({
      x: line.x_start,
      y: line.y_start,
      end_x: line.x_end,
      end_y: line.y_end,
      page_no: line.page_no,
    }));

    return additionalTextLocations;
  }



  const handleUpDownView = (direction) => {
    if (!pdfData || loadingView) return;

    if (
      (direction > 0 && pdfData.index < noticesData.length - 1) ||
      (direction < 0 && pdfData.index > 0)
    ) {
      const pIndex = pdfData.index + direction;
      const data = noticesData[pIndex];
      
      setPdfData({
        ...pdfData,
        url: data.document.document_link,
        textLoc: data.text_loc,
        index: pIndex,
        docId: data.doc_id,
        additionalTextLocations: data.additional_text_locations,
      });
    }
  };

  const handleSearchClick = () => {
    setShowSearch(true);
    fetchNoticesData(0, rowsPerPage, searchValue);
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setShowSearch(false);
    fetchNoticesData(0, rowsPerPage, "");
  };

  const handleClearSelection = async () => {
    await fetchNoticesData(0, rowsPerPage, searchValue, null);
    setSelected([]);
  };

  useEffect(() => {
    const hasActiveFilters = Object.keys(appliedFilters).some(
      (key) => appliedFilters[key]?.length
    );
    setShowClearFilters(hasActiveFilters);

    fetchNoticesData(0, rowsPerPage, "", appliedFilters);
  }, [appliedFilters]);

  const clearFilters = () => {
    setFilterValues({ ...initFilter });
    setAppliedFilters({ ...initFilter });
  };

  const applyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
  };




  return (
    <div className="page-wrap">
      <NavbarTop
        qaDashboard={state?.qaDashboard}
        projectTitle={state?.projectName || projectName || ""}
        loadingProjectDetails={loadingProjectDetails}
        customerData={customerData}
        userRole={userRoleInCompany}
        teamId={teamId}
      />
      {isAssociatedUser === true && (
        <div className="project-logs-wrapper log-table-width">
          <ProjectLogsHeaderTop
            breadcrumb={"View Projects"}
            breadcrumbUrl={`/project-list/${teamId}`}
            breadcrumb2={"Notices Log"}
            showBtn={"Upload Documents"}
            toggleModal={toggleModal}
            btnSize={"small"}
            docParsed={docParsed}
            qaDashboard={state?.qaDashboard}
            navBtn={"logs"}
            teamId={teamId}
          />
          <ProjectLogsActionPanel
            toggle={toggle}
            dropdownOpen={dropdownOpen}

            selected={selected}

            isSelectAll={isSelectAll}
            logInViewer={logInViewer}
            setLogInViewer={setLogInViewer}
            setPdfData={setPdfData}
            pdfData={pdfData}

            documentIsProcessing={documentIsProcessing}
            documentData={documentData}
            toggleDocumentStatusModal={toggleDocumentStatusModal}
            
            showClearFilters={showClearFilters}
            clearFilters={clearFilters}

            searchEnabled={false}
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
            isNotices={true}
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
                <NoticesLog
                  noticesData={noticesData}
                  setFilteredNoticesData={setNoticesData}
                  selected={selected}
                  handleSelect={handleSelect}
                  handleSelectAll={handleSelectAll}
                  pageRefresh={pageRefresh}
                  setPageRefresh={setPageRefresh}
                  setLoading={setLoading}
                  customerId={state?.customerId || customerId}
                  setNoticesData={setNoticesData}
                  projectId={state?.projectId || projectId}
                  setPdfData={setPdfData}
                  pdfData={pdfData}
                  completeNoticesData={noticesData}
                  newRowIndex={newRowIndex}
                  setNewRowIndex={setNewRowIndex}
                  searchValue={searchValue}
                  qaDashboard={state?.qaDashboard}
                  selectedFilterValue={selectedFilterValue}
                  filterValues={filterValues}
                  setFilterValues={setFilterValues}
                  setTotalCount={setTotalCount}
                  errorMessage={errorMessage}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  setLogInViewer={setLogInViewer}
                  rowData={rowData}
                  setRowData={setRowData}
                  setLogIdList={setLogIdList}
                  isSelectAll={isSelectAll}
                  setSelected={setSelected}
                  loading={loadingView}
                  fetchNoticesData={fetchNoticesData}
                  applyFilters={applyFilters}
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
                          pdfData.index < filteredNoticesData.length - 1
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
                    fetchData={fetchNoticesData}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    page={page}
                    setPage={setPage}
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
      <Loader showComponentLoader={isLoading} />
    </div>
  );
};

export default NoticesPage;
