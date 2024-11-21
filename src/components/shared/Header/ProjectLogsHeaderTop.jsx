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
    <div className="header-wrapper-swap row mx-0 my-3">
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
      <div className="col-8"></div>
    </div>
  );
};

export default ProjectLogsHeaderTop;
