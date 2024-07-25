/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// @ts-ignore
const ProjectLogsHeaderTop = ({ ...props }) => {
  const navigate = useNavigate();
  return (
    <div className="header-wrapper-swap">
      <div className="header-swap">
        <div className="main-wrapper">
          <div className="breadcrumb-wrap">
            <a
              href={
                localStorage.getItem('roleId') === '0'
                  ? '/admin-landing'
                  : '/project-list'
              }
              className="main-link"
            >
              Home
            </a>
            {props.breadcrumb && (
              <>
                <span className="main-link">/</span>
                <a
                  onClick={() => navigate(props.breadcrumbUrl)}
                  className="active-link"
                  style={{ cursor: 'pointer' }}
                >
                  {props.breadcrumb}
                </a>
              </>
            )}
            {props.breadcrumb2 && (
              <>
                <span className="main-link">/</span>
                <a
                  onClick={() => navigate(-1)}
                  className="active-link"
                  style={{ cursor: 'pointer' }}
                >
                  {props.breadcrumb2}
                </a>
              </>
            )}
            {props.breadcrumb3 && (
              <>
                <span className="main-link">/</span>
                <a
                  onClick={() => navigate(-1)}
                  className="active-link"
                  style={{ cursor: 'pointer' }}
                >
                  {props.breadcrumb3}
                </a>
              </>
            )}
          </div>
        </div>
      </div>
      {localStorage.getItem('roleId') !== '7' ? (
        <div className="header-right-swap header-right">
          <div className="log-search">
            <input
              type="text"
              placeholder="Find In Log"
              className="log-search-input"
              value={props.searchValue}
              onChange={(e) => props.handleSearchChange(e.target.value)}
              onKeyPress={props.handleEnterKeyPress}
            />
            <span className="search-icon" onClick={props.heandleSearchClick}>
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
            <span className="clear-icon" onClick={props.handleClearSearch}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 5L15 15"
                  stroke="#cbcbcb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 5L5 15"
                  stroke="#cbcbcb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default ProjectLogsHeaderTop;
