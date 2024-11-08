/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {AuthContext} from '../../../auth/authcontext'
import { getUserTeams } from '../../../api/Authentication/api';
import { getHomeUrl } from '../../../utils/navigation';

// @ts-ignore
const ProjectLogsHeaderTop = ({ teamId, ...props }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);


  return (
    <div className="header-wrapper-swap row mx-0">
      <div className="col-4 px-0">
        <div className="header-swap">
          <div className="main-wrapper">
            <div className="breadcrumb-wrap">
              <a
                href="#"
                onClick={(e) => getHomeUrl(e, isAuthenticated, user, getUserTeams, navigate)}
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
      <div className="col-4"></div>
      <div className="col-4 d-flex row">
        <div className="col-6 px-0">
          {props?.docParsed ? (
            <div className="total-count-documents">
              {props?.docParsed} document{props?.docParsed > 1 ? 's' : ''}{' '}
              uploaded{' '}
            </div>
          ) : (
            ''
          )}
        </div>
        <div className="col-6 d-flex justify-content-end px-0">
          {props.showBtn && localStorage.getItem('roleId') !== '7' ? (
            <button
              type="button"
              className={`light-btn ${
                props.btnSize === 'small' ? 'btn-small' : ''
              }`}
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
  );
};

export default ProjectLogsHeaderTop;
