/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../../config/axios';
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";
import { ReactComponent as ExcelLogo } from "../../../assets/images/excel.svg";
import { ReactComponent as JetBuildLogo} from "../../../assets/images/jet_build.svg";

// @ts-ignore
const ProjectLogsHeader = ({ ...props }) => {
  const [searchParams] = useSearchParams();
  const projectDetails = searchParams.get('projectDetails')?.split(',');
  const projectId = projectDetails?.length
    ? JSON.parse(projectDetails[0])
    : null;

  const [docsLoaded, setDocsLoaded] = useState(true);
  const specGptUser = localStorage.getItem('isSpecGptUser') === 'true';

  const checkDocsStatus = async () => {
    if (
      (props.breadcrumb2 === 'Submittal Log' ||
        props.breadcrumb2 === 'Collab Hub' ||
        props.breadcrumb2 === 'Spec GPT') &&
      !specGptUser
    ) {
      try {
        const response = await axiosInstance({
          method: 'get',
          url: '/spec-gpt/docsIndexed',
          params: {
            project_id: projectId
          }
        });
        const { docsIndexed } = response.data;
        setDocsLoaded(docsIndexed);
      } catch (error) {
        console.error('Error checking docs status:', error);
      }
    }
  };

  useEffect(() => {
    // Initial check
    checkDocsStatus();

    // Set up interval to check docs status every 10 seconds (adjust as needed)
    const intervalId = setInterval(() => {
      checkDocsStatus();
    }, 120000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="header-wrapper-swap row mx-0">
      <div className="col-4 px-0">
        <div className="header-swap">
          <button
            type="button"
            className="table-top-btn ml-1"
            onClick={props.getProjectLists}
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
        </div>
      </div>
      <div className="col-4">
        {props.showClearFilters && <div className="clear-filters">
          <button
            type="button"
            className="table-top-btn m-auto"
            onClick={props.clearFilters}
          >
            <span>Clear Filters</span>
          </button>
        </div>}
      </div>

      <div className="col-4 d-flex row">
        <div className="col-6 d-flex px-0">
          <div className="total-count-submittals">
            {`${props.totalCount} submittals`}
          </div>
        </div>
        <div className="col-6 d-flex p-0 justify-content-end">
          {localStorage.getItem('roleId') !== '7' && (
            <Dropdown isOpen={props.dropdownOpen} toggle={props.toggle}>
              <DropdownToggle caret className="export-btn">
                Export
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem className="text-center" onClick={() => props.handleExportExcel(['All'])}>
                  <ExcelLogo style={{ height: '90px' }} />
                </DropdownItem>
                <DropdownItem className="text-center">
                </DropdownItem>
                <DropdownItem className="text-center" onClick={() => props.handleExportJetBuild(['All'])}>
                  <JetBuildLogo style={{ height: '90px' }} />
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
          {localStorage.getItem('roleId') !== '7' && (
            <button
              type="button"
              className="trash-icon"
              onClick={props.handleDeleteLogs}
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
    </div>
  );
};

export default ProjectLogsHeader;
