/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {AuthContext} from '../../../auth/authcontext'
import { getUserTeams } from '../../../api/Authentication/api';
import { getHomeUrl } from '../../../utils/navigation';
import { Button } from 'reactstrap';
import VersionDropdown from '../../ProjectLogs/versionDropdown';

// @ts-ignore
const ProjectLogsHeaderTop = ({ teamId, ...props }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  console.log("props.projectVersionId", props.projectVersionId)
  console.log("props.projectVersions", props.projectVersions)
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
      <div className="col-4"></div>
      <div className="col-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {props.isVersioningEnabled && (
            <VersionDropdown
              availableVersions={props.projectVersions}
              currentVersionId={props.projectVersionId}
              currentVersionName={props.projectVersions.find(version => parseInt(version.id) === parseInt(props.projectVersionId))?.version_name || ''}
              onSelectVersion={props.onClickVersion}
              onPressEdit={
                (versionId) => {
                  props.setEditingVersionId(versionId);
                  props.setEditingVersionName(props.projectVersions.find(version => version.id === versionId).version_name);
                  props.setShowVersionModal(true);
                }
              }
              onPressAddNewVersion={() => props.setShowVersionModal(true)}
            />
        )}
      </div>
    </div>
  );
};

export default ProjectLogsHeaderTop;
