/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";
import { ReactComponent as Logo } from "../../../assets/images/procore-vector-logo.svg";
import { ReactComponent as ExcelLogo } from "../../../assets/images/excel.svg";
import { ReactComponent as MergeIcon } from "../../../assets/images/merge.svg";
import { ReactComponent as JetBuildLogo } from "../../../assets/images/jet_build.svg";
import { Check } from '@mui/icons-material';

// @ts-ignore
const ProjectLogsActionPanel = ({ ...props }) => {
  return (
    <div className="header-wrapper-swap row mx-0">
      <div className="col-6 row">
        <div className="d-flex p-0">
          <div className="mr-2 mb-1">
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
          <div className="mr-2 mb-1">
            {localStorage.getItem('roleId') !== '7' && (
              <Dropdown isOpen={props.dropdownOpen} toggle={props.toggle}>
                <DropdownToggle caret className="export-btn">
                  Export
                </DropdownToggle>
                <DropdownMenu style={{ maxWidth: '200px' }}>
                  <DropdownItem className="text-center" onClick={() => props.handleExportExcel(['All'])}>
                    <ExcelLogo style={{ height: '45px', margin: '5px 0' }} />
                  </DropdownItem>
                  <DropdownItem className="text-center">
                    {props.procoreAccessToken === 'null' ? (
                      <a href={props.procoreAuthUrl} >
                        <Logo style={{ height: '30px', maxWidth: '100%', margin: '20px auto' }} />
                      </a>
                    ) : (
                      <div onClick={props.handleExportToProcoreButtonClick}>
                        <Logo style={{ height: '30px', maxWidth: '100%', margin: '20px auto' }} />
                      </div>
                    )}
                  </DropdownItem>
                  <DropdownItem className="text-center" onClick={() => props.handleExportJetBuild(['All'])}>
                    <JetBuildLogo style={{ height: '40px', maxWidth: '100%', margin: '20px auto' }} />
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </div>
        <div className="p-0">
          <div className="header-swap">
            <button
              type="button"
              className="table-top-btn selection-btn mr-2 mb-1"
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
        <div className="p-0">
          {props.listId === null && props.selected?.length > 0 && !props.isCombining && (
            <button
              type="button"
              className="table-top-btn btn-disabled selection-btn mr-2 mb-1"
              onClick={props.toggleSaveListName}
              disabled={props.selected?.length === 0}
            >
              <svg
                width="14"
                height="18"
                viewBox="0 0 14 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.16683 0.666748H12.8335C13.0545 0.666748 13.2665 0.754545 13.4228 0.910826C13.579 1.06711 13.6668 1.27907 13.6668 1.50008V17.4526C13.6669 17.5271 13.647 17.6003 13.6092 17.6645C13.5715 17.7287 13.5171 17.7816 13.4519 17.8176C13.3868 17.8537 13.3131 17.8717 13.2386 17.8696C13.1641 17.8675 13.0916 17.8456 13.0285 17.8059L7.00016 14.0251L0.971829 17.8051C0.908803 17.8447 0.836319 17.8667 0.761914 17.8688C0.68751 17.8709 0.613901 17.853 0.548742 17.817C0.483583 17.781 0.429252 17.7283 0.391398 17.6642C0.353545 17.6001 0.333551 17.527 0.333496 17.4526V1.50008C0.333496 1.27907 0.421294 1.06711 0.577574 0.910826C0.733854 0.754545 0.945816 0.666748 1.16683 0.666748ZM12.0002 2.33341H2.00016V15.1934L7.00016 12.0592L12.0002 15.1934V2.33341Z"
                  fill={
                    props.selected?.length === 0
                      ? '#374151'
                      : '#0E2332'
                  }
                />
              </svg>
              <span>Save Selection</span>
            </button>
          )}
          {props.listId === null && props.selected?.length > 0 && props.isCombining && (
            <button
              type="button"
              className="table-top-btn btn-disabled selection-btn mr-2 mb-1"
              onClick={() => {
                props.handleCombineRows();
              }}
            >
              <Check />
              <span>Combine</span>
            </button>
          )}
          {props.listId !== null ? (
            <button
              type="button"
              className="table-top-btn selection-btn mr-2 mb-1"
              onClick={() => {
                props.handleClearSelection();
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 5L15 15"
                  stroke="#0E2332"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 5L5 15"
                  stroke="#0E2332"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Clear Selection</span>
            </button>
          ) : null}
        </div>
        <div className="p-0 d-flex">
          {props.showClearFilters && <div className="clear-filters">
            <button
              type="button"
              className="table-top-btn selection-btn mr-2 mb-1"
              onClick={props.clearFilters}
            >
              <span>Clear Filters</span>
            </button>
          </div>}
          {!props.logInViewer && props.listId === null && props.selected?.length > 0 && !props.isSelectAll && (
            <button
              type="button"
              className={`table-top-btn btn-disabled selection-btn mr-2 mb-1`}
              onClick={() => {
                // PDF reader won't be available with row combining for now
                if (props.logInViewer) {
                  props.setLogInViewer(null);
                  props.setPdfData({
                    url: "",
                    textLoc: {},
                    index: "",
                    docId: null,
                    additionalTextLocations: [],
                  })
                }
                console.log('+++++++++++++++++++')
                props.setIsCombining(value => !value);
                props.updateCombiningQueue(props.selected, true);
              }}
              disabled={props.editRow}
            >
              <MergeIcon />
              <span>
                {props.isCombining ? 'Stop Combining' : 'Combine Rows'}
              </span>
            </button>
          )}
          {props.logInViewer &&
            <button
              type="button"
              className="table-top-btn btn-disabled selection-btn close-pdf-btn mr-2 mb-1"
              onClick={() => {
                props.setLogInViewer(null);
                props.setPdfData({
                  url: "",
                  textLoc: {},
                  index: "",
                  docId: null,
                  submittalId: null,
                  additionalTextLocations: [],
                });
                props.setSubmittalIdParam(null);
              }}
            >
              <span>Close PDF Viewer</span>
            </button>
          }
        </div>
      </div>
      <div className="col-6 row justify-content-end">
        <div className="col-3">
          {props.documentIsProcessing(props.documentData) && (
            <button
              type="button"
              className="table-top-btn selection-btn m-auto"
              onClick={props.toggleDocumentStatusModal}
            >
              <span>Document Status</span>
            </button>
          )}
        </div>
        <div className="col-6 row">
          <div className={props.showSearch ? "d-none" : "col-6 d-flex justify-content-end spliter pl-0"}>
            {props?.docParsed ? (
              <div className="total-count-documents">
                {props?.docParsed} document{props?.docParsed > 1 ? 's' : ''}{' '}
                uploaded{' '}
              </div>
            ) : (
              ''
            )}
          </div>
          <div className={props.showSearch ? "col-12 d-flex justify-content-end" : "pr-0 col-6 d-flex justify-content-between"}>
            <div className={props.showSearch ? "d-none" : "total-count-submittals"}>
              {`${props.totalCount} submittals`}
            </div>
            {localStorage.getItem("roleId") !== "7" ? (
              <div className={`header-right-swap header-right ${props.showSearch ? "w-100" : ""}`}>
                <div className={props.showSearch ? "log-search w-100" : "log-search search-disable"}>
                  {props.showSearch && (
                    <input
                      type="text"
                      placeholder="Find In Log"
                      className="log-search-input w-100"
                      value={props.searchValue}
                      onChange={(e) => props.handleSearchChange(e.target.value)}
                      onKeyPress={props.handleEnterKeyPress}
                    />
                  )}
                  <span
                    className="search-icon"
                    onClick={props.handleSearchClick}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="11" cy="11" r="6" stroke="#231F20" stroke-width="1.5" />
                      <path d="M19 19L16 16" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                  </span>
                  {props.showSearch && (
                    <span
                      className="clear-icon"
                      onClick={props.handleClearSearch}
                    >
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
                  )}
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="col-3 px-0 d-flex justify-content-end">
          {props.showBtn && localStorage.getItem('roleId') !== '7' ? (
            <button
              type="button"
              className={`light-btn ${props.btnSize === 'small' ? 'btn-small' : ''
                }`}
              onClick={props.toggleModal}
            >
              <span className="">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM11.25 17.75V17V12.75H7H6.25V11.25H7H11.25V7V6.25H12.75V7V11.25H17H17.75V12.75H17H12.75V17V17.75H11.25Z" fill="#231F20" />
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

export default ProjectLogsActionPanel;