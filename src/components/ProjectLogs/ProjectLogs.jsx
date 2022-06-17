import React, { useState, useEffect, useCallback } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
// import PaginatedItems from '../shared/Pagination/Pagination';
import { ReactComponent as Trash } from '../../assets/images/trash.svg';
import { useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../config/axios';
// import SubmittalTable from './submittalTable';
// import TestingTable from './testingTable';
// import CloseOutTable from './closeOutTable';
// import MeetingTable from './meetingTable';
import { CSVLink } from 'react-csv';
import CombinedLogs from './combinedLogs';
import { debounce } from 'lodash';
import Loader from '../shared/Loader/Loader';

const ProjectLogs = () => {
  const { state } = useLocation();
  const [logData, setLogData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [pageRefresh, setPageRefresh] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  // const [currentItems, setCurrentItems] = useState([]);
  // const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setLoading] = useState(false);
  const [groupingData, setGroupingData] = useState([]);

  const handleSearchChange = useCallback(
    (value) => debounce(setSearchValue(value), 200),
    [setSearchValue]
  );

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      let selectedLogs = selected.filter((logId) => logId !== id);
      setSelected(selectedLogs);
    } else {
      setSelected([...selected, id]);
    }
  };
  const headers = [
    { label: 'Spec Sec', key: 'spec_section' },
    { label: 'Paragraph', key: 'para_no' },
    { label: 'Requirement Type', key: 'type' },
    { label: 'Item', key: 'item_desc' },
    { label: 'Grouping', key: 'Grouping' },
    { label: 'Paragraph Context', key: 'para_context' },
    { label: 'Status', key: 'status' },
    { label: 'Date Issued', key: 'date_issued' },
    { label: 'Date Approved', key: 'date_approved' },
    { label: 'Comments', key: 'comments' },
  ];
  const handleDeleteLogs = async () => {
    try {
      await axiosInstance({
        method: 'delete',
        url: '/delete_logs',
        data: {
          project_id: state?.project.project_id,
          records: selected,
          type: 'Submittal',
        },
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
        progress: undefined,
      });
    } catch (error) {
      console.log(error.message);
      setSelected([]);
      toast.error(error.response.data.message, {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await axiosInstance({
        method: 'post',
        url: '/get_logs',
        data: {
          project_id: state?.project.project_id,
          type: state.logType,
        },
      });
      setLogData(response.data.message);
      setLoading(false);
      console.log(response.data.message);
    };

    fetchData().catch((error) => {
      setLoading(false);
      toast.error('Something went wrong!', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });
  }, [state, pageRefresh]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/getPackages/${state.customerId}`,
      });
      setGroupingData(
        response.data.message.map((packageData) => {
          return {
            value: packageData.id,
            label: packageData.name,
          };
        })
      );

      console.log(response.data.message);
    };

    fetchData().catch((error) => {
      toast.error('Something went wrong!', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    });
  }, [state, pageRefresh]);
  let filteredLogData = logData
    .map((log) => {
      return Object.values(log)
        .filter((value) => value)
        .filter((value) => value.toString().includes(searchValue)).length
        ? log
        : null;
    })
    .filter((value) => value);

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
  return (
    <div className="page-wrap">
      <NavbarTop />
      <div className="page-wrap-content project-logs-wrapper">
        <Header
          // title={`${state.project?.type} Logs  - ${state.projectName || ''}`}
          title={`All Logs  - ${state.projectName || ''}`}
          breadcrumb2={'Project Details'}
          breadcrumb={'View Projects'}
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
                  <div className="table-bulk-changes">
                    <div className="log-search">
                      <input
                        type="text"
                        placeholder="Find In Log"
                        className="search-icon log-search-input"
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                    </div>
                    {/* <button type="button" className="btn btn-secondary btn-sm"> */}
                    <CSVLink
                      filename={`All-Logs.csv`}
                      data={logData}
                      target="_blank"
                      className="btn btn-secondary btn-sm"
                      headers={headers}
                    >
                      Export CSV
                    </CSVLink>
                    {/* </button> */}
                    <button
                      type="button"
                      className="d-flex btn btn-secondary btn-sm"
                      onClick={handleDeleteLogs}
                    >
                      {' '}
                      <Trash />{' '}
                    </button>
                  </div>
                </div>
                <CombinedLogs
                  logData={filteredLogData}
                  selected={selected}
                  handleSelect={handleSelect}
                  handleSelectAll={handleSelectAll}
                  pageRefresh={pageRefresh}
                  setPageRefresh={setPageRefresh}
                  customerId={state.customerId}
                  groupingData={groupingData}
                />
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
      <Loader showComponentLoader={isLoading} />
    </div>
  );
};

export default ProjectLogs;
