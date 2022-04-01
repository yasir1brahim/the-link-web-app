import React, { useState, useEffect } from 'react';
import Header from '../shared/Header/Header';
import NavbarTop from '../shared/NavbarTop/NavbarTop';
// import PaginatedItems from '../shared/Pagination/Pagination';
import { ReactComponent as Trash } from '../../assets/images/trash.svg';
import { useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../config/axios';
import SubmittalTable from './submittalTable';
import TestingTable from './testingTable';
import CloseOutTable from './closeOutTable';
import MeetingTable from './meetingTable';
import { CSVLink } from 'react-csv';

const ProjectLogs = () => {
  const { state } = useLocation();
  const [logData, setLogData] = useState([]);
  const headers = [
    { label: 'Spec Section', key: 'spec_section' },
    { label: 'Sub Section', key: 'sub_section' },
    { label: 'Type', key: 'section_name' },
    { label: 'Description', key: 'description' },
    // { label: 'Status', key: 'status' },
    // { label: 'Date Issued', key: 'date_issued' },
    // { label: 'Date Approved', key: 'date_approved' },
    // { label: 'Comments', key: 'comments' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'post',
        url: '/get_logs',
        data: {
          project_id: state?.project.project_id,
          type: state?.project.type,
        },
      });
      setLogData(response.data.message);
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
  }, [state]);

  return (
    <div className="page-wrap">
      <NavbarTop />
      <div className="page-wrap-content project-logs-wrapper">
        <Header
          title={`${state.project?.type} Logs  - ${state.projectName || ''}`}
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
                    <h5 className="m-0">Logs List</h5>
                    <label className="table-entries">
                      Showing entries <span className="showing-strong">6 </span>
                      of <span className="showing-strong">90</span>.
                    </label>
                  </div>
                  <div className="table-bulk-changes">
                    <div className="log-search">
                      <input
                        type="text"
                        placeholder="Find In Log"
                        className="search-icon log-search-input"
                      />
                    </div>
                    {/* <button type="button" className="btn btn-secondary btn-sm"> */}
                    <CSVLink
                      filename={`${state.project?.type}.csv`}
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
                    >
                      {' '}
                      <Trash />{' '}
                    </button>
                  </div>
                </div>

                {state.project?.type === 'Submittal' && (
                  <SubmittalTable logData={logData} />
                )}
                {state.project?.type === 'Testing' && (
                  <TestingTable logData={logData} />
                )}
                {state.project?.type === 'Meeting' && (
                  <MeetingTable logData={logData} />
                )}
                {state.project?.type === 'Closeout' && (
                  <CloseOutTable logData={logData} />
                )}
              </>
            )}

            {/* <div className="table-footer-content">
              <button type="button" className="btn btn-secondary btn-sm">
                Back
              </button>
              <PaginatedItems itemsPerPage={4} />
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
    </div>
  );
};

export default ProjectLogs;
