/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { useNavigate } from 'react-router-dom';

// @ts-ignore
const ProjectLogsHeaderTop = ({ ...props }) => {
  const navigate = useNavigate();
  return (
    <div className="header-wrapper-swap row mx-0 my-3">
      <div className="col-4 px-0">
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
      </div>
      <div className="col-8"></div>
    </div>
  );
};

export default ProjectLogsHeaderTop;
