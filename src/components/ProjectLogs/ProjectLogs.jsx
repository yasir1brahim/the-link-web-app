/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem
} from 'reactstrap';
import { ReactComponent as Trash } from '../../assets/images/trash.svg';
import { useLocation } from 'react-router-dom';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../config/axios';
import CombinedLogs from './combinedLogs';
import { debounce, get } from 'lodash';
import Loader from '../shared/Loader/Loader';
import PdfWrapper from '../../pdfWrapper';
import FileDownload from 'js-file-download';
import { UploadDocuments } from '../ProjectDetails/UploadDocuments';
import { useSearchParams } from 'react-router-dom';
import Procore from './procore';
import { ReactComponent as Logo } from '../../assets/images/procore-vector-logo.svg';
import { ReactComponent as ExcelLogo } from '../../assets/images/excel.svg';
import { ReactComponent as SearchIcon } from '../../assets/images/search.svg';
import handleError from '../../config/errorHandler';
import Pagination from '../shared/Pagination/LogsPagination';
import { getSavedLogs } from '../../api/ProjectLogs/api';

const ProjectLogs = () => {
  const [modal, setModal] = useState(false);
  const [errorModal, toggleErrorModal] = useState(false);
  const [successModal, toggleSuccessModal] = useState(false);
  const toggleModal = () => setModal(!modal);
  const [pdfFile, setPdfFile] = useState({});
  const [fileData, setFileData] = useState({});
  const [isUploadLoading, setUploadLoading] = useState(false);

  const [saveListName, setToggleSaveListNameModal] = useState(false);
  const toggleSaveListName = () => setToggleSaveListNameModal(!saveListName);
  const [listName, setListName] = useState({ value: '', errors: '' });
  const [viewList, setList] = useState([]);
  const [viewSavedList, setToggleViewSavedList] = useState(false);
  const toggleViewSavedList = () => setToggleViewSavedList(!viewSavedList);
  const { state } = useLocation();
  const [logData, setLogData] = useState([]);
  const [filteredLogData, setFilteredLogData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [pageRefresh, setPageRefresh] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  // const [currentItems, setCurrentItems] = useState([]);
  // const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setLoading] = useState(false);
  const [groupingData, setGroupingData] = useState([]);
  const [selectedLogData, setSelectedLogData] = useState([]);
  const [listId, setListId] = useState(null);
  const [pdfData, setPdfData] = useState({
    url: '',
    textLoc: {},
    index: '',
    docId: null
  });
  const [newRowIndex, setNewRowIndex] = useState(null);
  const projectType = state?.project.project_type;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const baseUrl = window.location.href.includes('https://app.thelink.ai')
    ? `https://app.thelink.ai/`
    : `https://dev-app.thelink.ai/`;
  //Procore states
  const [procoreModal, setProcoreModal] = useState(false);
  const toggleProcoreModal = () => setProcoreModal(!procoreModal);
  const [companyList, setCompanyList] = useState([]);
  const [companyId, setCompanyId] = useState();
  const [docParsed, setDocParsed] = useState(0);
  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const [searchParams] = useSearchParams();
  const projectDetails = searchParams.get('projectDetails')?.split(',');
  const projectId = projectDetails?.length
    ? JSON.parse(projectDetails[0])
    : null;
  const customerId =
    projectDetails?.length >= 2 ? JSON.parse(projectDetails[1]) : null;
  // const projectName = searchParams.get('projectName');
  const logType = projectDetails?.length >= 3 ? projectDetails[2] : null;
  const projectName = projectDetails?.length >= 4 ? projectDetails[3] : null;
  const authCode = searchParams.get('code');
  const clientId = window.location.href.includes('https://app.thelink.ai')
    ? 'ce62990f797459a3dd5005c1323a30beb75fafd0ac6304353101b44e809ddcc9'
    : 'ce62990f797459a3dd5005c1323a30beb75fafd0ac6304353101b44e809ddcc9';
  const [selectedFilterValue, setSelectedFilterValue] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [filterValues, setFilterValues] = useState({
    spec_section: [],
    item_desc: [],
    classification: [],
    sd_title: []
  });
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [page, setPage] = React.useState(1);

  useEffect(() => {
    if (!modal) {
      setPdfFile({});
    }
  }, [modal]);

  // get the number of documents uploaded
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await axiosInstance({
        method: 'get',
        url: `/project_data/${projectId || state.project?.project_id}`
      });
      setDocParsed(response.data.doc_parsed);
      setLoading(false);
      console.log(response.data.message);
    };

    fetchData().catch((error) => {
      setLoading(false);
      handleError(error);
    });
  }, [state?.project, pageRefresh, projectId]);

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
      data.append('project_id', projectId || state.project?.project_id);
      projectType === 'ufgs' && data.append('project_type', projectType);
      Object.values(pdfFile)?.forEach((file) => data.append('files', file));
      const response = await axiosInstance({
        method: 'post',
        url: '/upload_file',
        data
      });
      if (response.data) {
        // console.log(response.data);
        setUploadLoading(false);
        setFileData(response.data.message);
        setModal(false);
        toggleSuccessModal(true);
        setPageRefresh(!pageRefresh);
      }
      axiosInstance({
        method: 'get',
        url: '/collab/create_spec_index',
        params: {
          project_id: projectId || state.project?.project_id
        }
      });
      axiosInstance({
        method: 'post',
        url: `/spec-gpt/load_doc`,
        data: {
          project_id: projectId || state.project?.project_id
        }
      });
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
            ...logData.slice(newRowIndex + 1)
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

  const selectedRows =
    localStorage?.getItem('selectedRows') === ''
      ? 'All'
      : localStorage?.getItem('selectedRows');
  // ?.split(',')
  // ?.map((row) => JSON.parse(row));

  // onClick export Procore, we redirect to the same page and POST access token // gets called first
  useEffect(() => {
    const handleExportToProcore = async () => {
      try {
        // setStatus(get(statusResp, 'data.data'));
        const resp = await axiosInstance({
          method: 'post',
          url: '/procore/create_submittals',
          data: {
            project_id: Number(projectId),
            records: selectedRows // array of ids
            // status_id: statusResp?.data?.data?.find((sts) => sts.name === 'Open').id || 1
          }
        });
        if (resp.status === 200) {
          // setProjectMappingsNoContent(false)
          toast.success('Successfully exported to Procore!', {
            position: 'bottom-center',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined
          });
          localStorage.setItem('selectedRows', '');
        }
        // setLoading(false);
      } catch (error) {
        console.log('error', error);
        localStorage.setItem('selectedRows', '');
        handleError(error);
      }
    };

    if (authCode) {
      const fetchData = async () => {
        const accessTokenData = await axiosInstance({
          method: 'post',
          url: '/procore/access_token',
          data: {
            code: authCode,
            redirect_uri: `${baseUrl}project-logs?projectDetails=${projectId},${customerId},${logType},${projectName}`
          }
        });
        localStorage.setItem(
          'procore_access_token',
          accessTokenData?.data.data.access_token
        );

        const res = await axiosInstance({
          method: 'get',
          url: `/procore/project_mapping/${projectId}`
        });
        if (get(res, 'data.data')) {
          setCompanyId(get(res, 'data.data.procore_company_id'));
          localStorage.setItem(
            'companyId',
            get(res, 'data.data.procore_company_id')
          );
          localStorage.setItem('projectId', projectId);
          localStorage.setItem('logType', logType);
          localStorage.setItem('customerId', customerId);
          localStorage.setItem('projectName', projectName);
          searchParams.set('code', '');
          handleExportToProcore();
        }
        if (get(res, 'status') === 204) {
          setProcoreModal(true);
          const companyResp = await axiosInstance({
            method: 'get',
            url: '/procore/companies'
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
    baseUrl
  ]);

  const handleDeleteLogs = async () => {
    if (selected.length !== 0) {
      try {
        await axiosInstance({
          method: 'delete',
          url: '/delete_logs',
          data: {
            project_id: state?.projectId || projectId,
            records: selected,
            type: 'Submittal'
          }
        });
        setPageRefresh(!pageRefresh);
        setSelected([]);
        toast.success('Successfully Deleted Logs!', {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
      } catch (error) {
        // console.log(error.message);
        setSelected([]);
        toast.error(error.response.data.message, {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
      }
    }
  };
  const fetchLogData = async (page, itemsPerPage, filters, search) => {
    setLoading(true);
    setErrorMessage('Fetching data...');
    const response = await axiosInstance({
      method: 'post',
      url: '/filter_logs',
      data: {
        project_id: state?.projectId || projectId,
        search: search || '',
        filters: { ...filters },
        order_col: '',
        order: '',
        page_number: page || 0,
        limit: itemsPerPage
      }
    });
    // setLogData(response.data.message);
    setSelectedFilterValue(response.data.all_filter_vals);

    const submittalLogs = response.data.message;
    selectedLogData.length
      ? setSelectedLogData(submittalLogs)
      : setLogData(submittalLogs);
    localStorage.setItem(
      'filteredIds',
      submittalLogs?.map((item) => item?.id)
    );
    setLoading(false);
    setErrorMessage('');
    if (response.data.message.length === 0) {
      if (search) {
        setErrorMessage('Sorry, no results found for your search query.');
      } else {
        setErrorMessage('Please upload documents, before seeing the logs.');
      }
    }
    setTotalCount(response?.data?.total_count);
  };
  useEffect(() => {
    fetchLogData(0, 25).catch((error) => {
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
        method: 'get',
        url: `/getPackages/${state?.customerId || customerId}`
      });
      setGroupingData(
        response.data.message.map((packageData) => {
          return {
            value: packageData.id,
            label: packageData.name
          };
        })
      );

      // console.log(response.data.message);
    };

    fetchData().catch((error) => {
      handleError(error);
    });
  }, [state, pageRefresh, customerId]);

  useEffect(() => {
    let filterData = selectedLogData.length ? selectedLogData : logData;
    let filteredLog = filterData;
    // .map((log) => {
    //   return Object.values(log)
    //     .filter((value) => value)
    //     .filter((value) => value.toString().includes(searchValue)).length
    //     ? log
    //     : null;
    // })
    // .filter((value) => value);
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
      const rowsSelected = JSON.stringify(selected);
      localStorage.setItem('selectedRows', `${rowsSelected}`);
    }
  }, [selected]);

  const handleExportExcel = async (recordData, fileName) => {
    try {
      const response = await axiosInstance({
        method: 'post',
        url: '/exportLogs',
        responseType: 'arraybuffer',
        data: {
          project_id: state?.projectId || projectId,
          records:
            recordData ||
            localStorage
              .getItem('filteredIds')
              ?.split(',')
              ?.map((item) => Number(item))
        }
      });
      let blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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
    if (listName.value === '') {
      setListName({ ...listName, errors: 'List Name is required.' });
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
          method: 'post',
          url: '/save_list',
          data: {
            project_id: state?.projectId || projectId,
            records: selected,
            view_name: listName.value
          }
        });
        setToggleSaveListNameModal(false);
        toast.success('List created successfully', {
          position: 'bottom-center'
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
        method: 'get',
        url: `/get_list/${state?.projectId || projectId}`
      });
      setList(response.data.message);
      setToggleViewSavedList(true);
    } catch (error) {
      handleError(error);
    }
  };

  const heandleSearchClick = () => {
    let filters = {};
    if (
      Object.values(filterValues)
        .map((value) => (value.length ? true : false))
        .includes(true)
    ) {
      Object.keys(filterValues).forEach((key) =>
        filterValues[key].length
          ? (filters = { ...filters, [key]: filterValues[key] })
          : null
      );
    }
    fetchLogData(0, 25, filters, searchValue);
  };

  const handleOpenSaveList = async (listId) => {
    const savedLogs = await getSavedLogs(listId);
    setSelectedLogData(savedLogs?.data?.message);
    setToggleViewSavedList(false);
  };

  return (
    <div className="page-wrap">
      <NavbarTop qaDashboard={state?.qaDashboard} />
      <div className="project-logs-wrapper log-table-width">
        <Header
          // title={`${state.project?.type} Logs  - ${state.projectName || ''}`}
          centerText={`${projectType === 'ufgs' ? 'UFGS' : 'Commercial'}`}
          // breadcrumb={'Project Details'}
          breadcrumb={'View Projects'}
          breadcrumbUrl={`/project-list?id=${customerId}`}
          breadcrumb2={'Requrement Logs'}
          showBtn={'Upload Additional'}
          toggleModal={toggleModal}
          btnSize={'small'}
          title={state?.projectName || projectName || ''}
          docParsed={docParsed}
          qaDashboard={state?.qaDashboard}
          navBtn={'logs'}
        />

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
                  {selectedLogData?.length ? (
                    <button
                      type="button"
                      className="btn btn-primary mr-3 btn-small"
                      onClick={() => {
                        setSelectedLogData([]);
                        setSelected([]);
                      }}
                    >
                      Clear Selection
                    </button>
                  ) : null}
                  {!selectedLogData.length ? (
                    <button
                      type="button"
                      className="btn btn-primary mr-3 btn-small btn-disabled"
                      onClick={toggleSaveListName}
                      disabled={selected.length === 0}
                    >
                      Save Selection
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={getList}
                  >
                    {' '}
                    View Saved Lists{' '}
                  </button>
                  <div className="table-bulk-changes">
                    <div className="log-search">
                      <input
                        type="text"
                        placeholder="Find In Log"
                        className="log-search-input"
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                      <SearchIcon
                        className="search-icon"
                        onClick={heandleSearchClick}
                      />
                    </div>
                    {localStorage.getItem('roleId') !== '7' && (
                      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                        <DropdownToggle caret>Export</DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem onClick={() => handleExportExcel('All')}>
                            <ExcelLogo style={{ height: '90px' }} />
                          </DropdownItem>
                          <DropdownItem>
                            <a
                              href={`https://login-sandbox.procore.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${baseUrl}project-logs?projectDetails=${projectId},${customerId},${logType},${projectName}`}
                              className="breadcrumb-text"
                            >
                              <Logo style={{ height: '90px' }} />
                            </a>
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    )}
                    {localStorage.getItem('roleId') !== '7' && (
                      <button
                        type="button"
                        className="d-flex btn btn-secondary btn-sm"
                        onClick={handleDeleteLogs}
                      >
                        {' '}
                        <Trash />{' '}
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className={pdfData.url && 'side-by-side'}>
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
                  qaDashboard={state?.qaDashboard}
                  selectedFilterValue={selectedFilterValue}
                  filterValues={filterValues}
                  setFilterValues={setFilterValues}
                  setTotalCount={setTotalCount}
                  errorMessage={errorMessage}
                  page={page}
                  rowsPerPage={rowsPerPage}
                />
                {pdfData.url && <PdfWrapper pdfData={pdfData} />}
              </div>
              {!pdfData.url && !selectedLogData.length && (
                <div className="table-footer-content logs-pagination">
                  <Pagination
                    totalItems={totalCount}
                    fetchData={fetchLogData}
                    filterValues={filterValues}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    page={page}
                    setPage={setPage}
                  />
                </div>
              )}
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
        companyId={companyId}
        companyList={companyList}
        procoreModal={procoreModal}
        projectId={projectId}
        setLoading={setLoading}
        selectedRows={selectedRows}
        toggleProcoreModal={toggleProcoreModal}
        setProcoreModal={setProcoreModal}
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
              </Button>{' '}
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
                    JSON.parse(list.records).length !== 0 && (
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
                                handleOpenSaveList(list.id);
                                setListId(list.id);
                              }}
                            >
                              Open
                            </button>
                            {localStorage.getItem('roleId') !== '7' && (
                              <button
                                type="button"
                                className="btn btn-primary"
                                style={{ textTransform: 'none' }}
                                onClick={() =>
                                  handleExportExcel(
                                    list.records,
                                    list.view_name
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
