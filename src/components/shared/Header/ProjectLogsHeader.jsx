/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../../config/axios';

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
    <>
      <div className="header-wrapper-swap row">
        <div className="col-4">
          <div className="header-swap">
            <button
              type="button"
              className="table-top-btn ml-1"
              onClick={props.getList}
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
        <div className="col-4"></div>
        <div className="col-4 d-flex row">
          <div className="col-6">
            {props?.docParsed ? (
              <div className="total-count-documents">
                {props?.docParsed} document{props?.docParsed > 1 ? 's' : ''}{' '}
                uploaded{' '}
              </div>
            ) : (
              ''
            )}
          </div>
          <div className="col-6 d-flex justify-content-end">
            {props.showBtn && localStorage.getItem('roleId') !== '7' ? (
              <button
                type="button"
                className={`light-btn ${
                  props.btnSize === 'small' ? 'btn-small' : ''
                } mr-1`}
                onClick={props.toggleModal}
              >
                <span className="">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 3.33325V16.6666M16.6667 9.99992L3.33337 9.99992"
                      stroke="#0E2332"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {props.showBtn}
              </button>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectLogsHeader;
