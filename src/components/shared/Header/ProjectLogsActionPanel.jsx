/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";
import { ReactComponent as Logo } from "../../../assets/images/procore-vector-logo.svg";
import { ReactComponent as ExcelLogo } from "../../../assets/images/microsoft-excel-symbol.svg";
import { ReactComponent as MergeIcon } from "../../../assets/images/merge.svg";
import { ReactComponent as JetBuildLogo } from "../../../assets/images/jet_build.svg";
import { Check } from '@mui/icons-material';
import StyledTooltip from '../StyledTooltip/StyledTooltip';
import { ReactComponent as TrashIcon } from "../../../assets/images/trash.svg";
import { ReactComponent as EyeIcon } from "../../../assets/images/eye.svg";
import { ReactComponent as BookmarkIcon } from "../../../assets/images/bookmark.svg";
import { ReactComponent as CloseXIcon } from "../../../assets/images/close-x.svg";
import { ReactComponent as SearchIcon } from "../../../assets/images/search-icon.svg";
import { ReactComponent as CloseClearIcon } from "../../../assets/images/close-clear.svg";
import { ReactComponent as PlusUploadIcon } from "../../../assets/images/plus-upload.svg";

// @ts-ignore
const ProjectLogsActionPanel = ({ ...props }) => {
  return (
    <div className="header-wrapper-swap row mx-0 my-3">
      <div className="col-6 row">
        <div className="d-flex p-0">
          <div className="mr-2 mb-1">
            {localStorage.getItem('roleId') !== '7' && !!props.handleDeleteLogs && (
              <StyledTooltip title="Delete" arrow>
                <button
                  type="button"
                  className="trash-icon"
                  onClick={props.handleDeleteLogs}
                >
                  <TrashIcon />
                </button>
              </StyledTooltip>
            )}
          </div>
          {props.isFullSpecProcessing && props.onExportCsv && (
            <button
              type="button"
              className="table-top-btn selection-btn mr-2 mb-1"
              onClick={props.onExportCsv}
            >
              Export CSV
            </button>
          )}
          <div className="mr-2 mb-1">
            {localStorage.getItem('roleId') !== '7' && !!props.handleExportExcel && (
              <Dropdown isOpen={props.dropdownOpen} toggle={props.toggle}>
                <DropdownToggle caret className="export-btn">
                  Export
                </DropdownToggle>
                <DropdownMenu style={{ width: '110px', maxWidth: '110px', minWidth: '100px', backgroundColor: 'white' }}>
                  <DropdownItem
                    className="text-center"
                    style={{ backgroundColor: 'white', padding: '8px' }}
                    onClick={() => props.handleExportExcel()}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0eaf7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <ExcelLogo style={{ height: '30px', width: '100%', objectFit: 'contain' }} />
                  </DropdownItem>
                  <DropdownItem
                    className="text-center"
                    style={{ backgroundColor: 'white', padding: '8px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0eaf7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    {props.procoreAccessToken === 'null' ? (
                      <a href={props.procoreAuthUrl} className="breadcrumb-text">
                        <Logo style={{ height: '30px', width: '100%', objectFit: 'contain' }} />
                      </a>
                    ) : (
                      <div onClick={props.handleExportToProcoreButtonClick}>
                        <Logo style={{ height: '30px', width: '100%', objectFit: 'contain' }} />
                      </div>
                    )}
                  </DropdownItem>
                  <DropdownItem
                    className="text-center"
                    style={{ backgroundColor: 'white', padding: '8px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0eaf7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    onClick={() => props.handleExportJetBuild()}
                  >
                    <JetBuildLogo style={{ height: '30px', width: '100%', objectFit: 'contain' }} />
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </div>
        <div className="p-0">
          <div className="header-swap">
            {!!props.getProjectLists && <button
              type="button"
              className="table-top-btn selection-btn mr-2 mb-1"
              onClick={props.getProjectLists}
            >
              <EyeIcon />
              <span>View Saved Lists</span>
            </button>}
          </div>
        </div>
        <div className="p-0">
          {props.listId === null && props.selected?.length > 0 && !props.isCombining && !!props.toggleSaveListName && (
            <button
              type="button"
              className="table-top-btn btn-disabled selection-btn mr-2 mb-1"
              onClick={props.toggleSaveListName}
              disabled={props.selected?.length === 0}
            >
              <BookmarkIcon fill={props.selected?.length === 0 ? '#374151' : '#0E2332'} />
              <span>Save Selection</span>
            </button>
          )}
          {props.listId === null && props.selected?.length > 0 && props.isCombining && !!props.handleCombineRows && (
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
          {props.listId !== null && !!props.handleClearSelection ? (
            <button
              type="button"
              className="table-top-btn selection-btn mr-2 mb-1"
              onClick={() => {
                props.handleClearSelection();
              }}
            >
              <CloseXIcon />
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
          {!props.logInViewer && props.listId === null && props.selected?.length > 0 && !props.isSelectAll && !!props.setIsCombining && (
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
                props.setIsCombining(value => !value);
                props.updateCombiningQueue(props.selected, true);
              }}
              disabled={!!props.editRow}
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
      <div className="col-6 d-flex justify-content-end">
        <div className="d-flex w-100 align-items-center justify-content-end">
          
          <div className={`${props.showSearch ? "d-none" : "d-flex align-items-center mr-3"}`}>
            {props?.docParsed > 0 ? (
              <div className="total-count-documents d-flex align-items-center" style={{ fontSize: '0.9em' }}>
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={props.onShowDocumentListModal}
                >
                  {props.docParsed} document{props.docParsed > 1 ? 's' : ''}
                </div>

                {props.specSectionCount > 0 && <div style={{ margin: '0 6px' }}>|</div>}

                {props.specSectionCount > 0 && (
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={props.onShowSpecSectionListModal}
                  >
                    {props.specSectionCount} spec section{props.specSectionCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>

            ) : null}
            {props?.docParsed > 0 && (
              <div className="mx-2" style={{ color: '#ccc' }}>|</div>
            )}
            <div className="total-count-submittals">
              {`${props.totalCount} ${!!props.isNotices ? 'notices' : props.isFullSpecProcessing ? 'spec items' : 'submittals'}`}
            </div>
          </div>

          <div className="d-flex align-items-center">
            {props.searchEnabled ? (
              <div className={`header-right-swap header-right ${props.showSearch ? "w-auto mr-2" : "mr-2"}`}>
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
                    <SearchIcon />
                  </span>
                  {props.showSearch && (
                    <span
                      className="clear-icon"
                      onClick={props.handleClearSearch}
                    >
                      <CloseClearIcon />
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            {props.showBtn && (
              <button
                type="button"
                className={`light-btn ${props.btnSize === 'small' ? 'btn-small' : ''}`}
                style={{ padding: '5px 10px', minWidth: '140px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={props.toggleModal}
              >
                <PlusUploadIcon />
                <span style={{ whiteSpace: 'nowrap' }}>{props.showBtn}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectLogsActionPanel;