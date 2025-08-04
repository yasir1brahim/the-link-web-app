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
    <div className="header-wrapper-swap row mx-0 my-2" style={{ borderBottom: '1px solid #e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        {props.isSpecGptFlagActive && (
          <div className="tab-container" style={{ display: 'flex', gap: '0' }}>
            <button
              className={`tab-button ${props.activeTab === 'submittal' ? 'active' : ''}`}
              onClick={() => props.setActiveTab('submittal')}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: props.activeTab === 'submittal' ? '#fff' : '#f5f5f5',
                borderBottom: props.activeTab === 'submittal' ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: props.activeTab === 'submittal' ? '600' : '400',
                color: props.activeTab === 'submittal' ? '#007bff' : '#666',
                transition: 'all 0.2s ease'
              }}
            >
              Submittal Log
            </button>
            <button
              className={`tab-button ${props.activeTab === 'specgpt' ? 'active' : ''}`}
              onClick={() => props.setActiveTab('specgpt')}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: props.activeTab === 'specgpt' ? '#fff' : '#f5f5f5',
                borderBottom: props.activeTab === 'specgpt' ? '2px solid #007bff' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: props.activeTab === 'specgpt' ? '600' : '400',
                color: props.activeTab === 'specgpt' ? '#007bff' : '#666',
                transition: 'all 0.2s ease'
              }}
            >
              Compass
            </button>
          </div>
        )}
      </div>
      <div className="col-4" style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '0px' }}>
        {props.isVersioningEnabled && props.activeTab === 'submittal' && (
          <>
            {props.isVersionComparisonEnabled && (
              <button
                type="button"
                className="table-top-btn btn-disabled selection-btn mr-2 mb-1"
                onClick={props.toggleVersionComparisonModal}
              >
                <span>Compare Versions</span>
              </button>
            )}
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
              onPressArchive={
                (versionId) => {
                  props.onPressArchive(versionId);
                }
              }
              onPressAddNewVersion={() => props.setShowVersionModal(true)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectLogsHeaderTop;
