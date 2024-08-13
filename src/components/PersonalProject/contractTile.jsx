import { ArchiveIcon } from "../shared/icons/archiveIcon";
import { EditIcon } from "../shared/icons/editIcon";
import { LaunchIcon } from "../shared/icons/launchIcon";
import { UploadIcon } from "../shared/icons/uploadIcon";
import { RestoreIcon } from "../shared/icons/restoreIcon";
import { Tooltip } from "reactstrap";

const ContractTile = ({
  ifSpecsUploaded,
  projectName,
  handleLaunch,
  project,
  toggleUploadSpecsModal,
  setSpecUploadProject,
  // handleCollaborationLaunch,
  toggleUploadSpecsButton,
  roleId,
  handleEdit,
  toggleArchiveProjectModal,
  setArchiveProject,
  toggleRestoreProjectModal,
  setRestoreProject,
  index,
  launchTooltip,
  setLaunchTooltip,
  uploadTooltip,
  setUploadTooltip,
  editTooltip,
  setEditTooltip,
  archiveTooltip,
  setArchiveTooltip,
  restoreTooltip,
  setRestoreTooltip
}) => {
  const generateInitials = (name) => {
    // Split the name into words
    const words = name.split(" ");
    const initials = words
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2);

    return initials.toUpperCase();
  }
  return (
    <div className="contract-card-wrapper">
      <div
        className="upper-card"
        onClick={() => handleLaunch(project)}
        disabled={!ifSpecsUploaded}
        style={{ cursor: "pointer" }}
      >
        <div className="contract-wrapper">
          <div className="content-wrapper">
            <p className="content"># {project.project_type}</p>
          </div>
          <div
            className={`content-wrapper-secondary ${
              project.status === "Open" 
                ? "open-theme"
                : "complete-theme"
            }`}
          >
            <span className="">
              {project.status === "Open" ? (
                <svg
                  width="6"
                  height="6"
                  viewBox="0 0 6 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="3" cy="3" r="3" fill="#3B82F6" />
                </svg>
              ) : (
                <svg
                  width="7"
                  height="6"
                  viewBox="0 0 7 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="3.33334"
                    cy="3"
                    r="3"
                    fill="#DC2626"
                  />
                </svg>
              )}
            </span>
            <p className="content">{project.status}</p>
          </div>
        </div>
        <div className="name-wrapper">
          <h4 className="content">{projectName}</h4>
        </div>
        <div className="date-wrap">
          <span className="mb-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.6667 2.66659H11.3333V1.99992C11.3333 1.82311 11.2631 1.65354 11.1381 1.52851C11.013 1.40349 10.8435 1.33325 10.6667 1.33325C10.4899 1.33325 10.3203 1.40349 10.1953 1.52851C10.0702 1.65354 9.99999 1.82311 9.99999 1.99992V2.66659H5.99999V1.99992C5.99999 1.82311 5.92976 1.65354 5.80473 1.52851C5.67971 1.40349 5.51014 1.33325 5.33333 1.33325C5.15652 1.33325 4.98695 1.40349 4.86192 1.52851C4.7369 1.65354 4.66666 1.82311 4.66666 1.99992V2.66659H3.33333C2.8029 2.66659 2.29419 2.8773 1.91911 3.25237C1.54404 3.62744 1.33333 4.13615 1.33333 4.66658V12.6666C1.33333 13.197 1.54404 13.7057 1.91911 14.0808C2.29419 14.4559 2.8029 14.6666 3.33333 14.6666H12.6667C13.1971 14.6666 13.7058 14.4559 14.0809 14.0808C14.4559 13.7057 14.6667 13.197 14.6667 12.6666V4.66658C14.6667 4.13615 14.4559 3.62744 14.0809 3.25237C13.7058 2.8773 13.1971 2.66659 12.6667 2.66659ZM13.3333 12.6666C13.3333 12.8434 13.2631 13.013 13.1381 13.138C13.013 13.263 12.8435 13.3333 12.6667 13.3333H3.33333C3.15652 13.3333 2.98695 13.263 2.86192 13.138C2.7369 13.013 2.66666 12.8434 2.66666 12.6666V7.99992H13.3333V12.6666ZM13.3333 6.66658H2.66666V4.66658C2.66666 4.48977 2.7369 4.3202 2.86192 4.19518C2.98695 4.07016 3.15652 3.99992 3.33333 3.99992H4.66666V4.66658C4.66666 4.8434 4.7369 5.01297 4.86192 5.13799C4.98695 5.26301 5.15652 5.33325 5.33333 5.33325C5.51014 5.33325 5.67971 5.26301 5.80473 5.13799C5.92976 5.01297 5.99999 4.8434 5.99999 4.66658V3.99992H9.99999V4.66658C9.99999 4.8434 10.0702 5.01297 10.1953 5.13799C10.3203 5.26301 10.4899 5.33325 10.6667 5.33325C10.8435 5.33325 11.013 5.26301 11.1381 5.13799C11.2631 5.01297 11.3333 4.8434 11.3333 4.66658V3.99992H12.6667C12.8435 3.99992 13.013 4.07016 13.1381 4.19518C13.2631 4.3202 13.3333 4.48977 13.3333 4.66658V6.66658Z"
                fill="#676F74"
              />
            </svg>
          </span>
          {project.start_date && (<p className="content">{project.start_date} ~ {project.end_date}</p>)}
        </div>
      </div>
      <div className="lower-card">
        {!!project.lead_contact ? (
          <div className="icon-wrap">
            <div className="icon">
              <p className="content">
                {generateInitials(project.lead_contact)}
              </p>
            </div>
            <p className="content">{project.lead_contact}</p>
          </div>
        ) : (
          <div className="icon-wrap empty"></div>
        )}
        <div className="icons-wrap">
          <span
            onClick={() => handleLaunch(project)}
            disabled={!ifSpecsUploaded}
            style={{ cursor: "pointer" }}
            id={"launch-tooltip" + index + 1}
          >
            <LaunchIcon />
          </span>
          <span>
            <Tooltip
              placement="left"
              target={"launch-tooltip" + index + 1}
              isOpen={launchTooltip === index + 1}
              toggle={() =>
                setLaunchTooltip(
                  launchTooltip
                    ? launchTooltip === index + 1
                      ? null
                      : index + 1
                    : index + 1,
                )
              }
            >
              Launch Project
            </Tooltip>
          </span>
          {toggleUploadSpecsButton ? (
            project.status !== "Archived" && <>
              <span
                onClick={() => {
                  toggleUploadSpecsModal();
                  setSpecUploadProject(project);
                }}
                style={{ cursor: "pointer" }}
                id={"upload-tooltip" + index + 1}
              >
                <UploadIcon />
              </span>
              <span>
                <Tooltip
                  placement="left"
                  target={"upload-tooltip" + index + 1}
                  isOpen={uploadTooltip === index + 1}
                  toggle={() =>
                    setUploadTooltip(
                      uploadTooltip
                        ? uploadTooltip === index + 1
                          ? null
                          : index + 1
                        : index + 1,
                    )
                  }
                >
                  Upload Document
                </Tooltip>
              </span>
            </>
          ) : null}
          {(
            project.status === "Archived" ? (
              <>
                <span
                  onClick={() => {
                    toggleRestoreProjectModal()
                    setRestoreProject(project)
                  }}
                  style={{ cursor: "pointer" }}
                  id={"restore-tooltip" + index + 1}
                >
                  <RestoreIcon />
                </span>
                <span>
                  <Tooltip
                    placement="left"
                    target={"restore-tooltip" + index + 1}
                    isOpen={restoreTooltip === index + 1}
                    toggle={() =>
                      setRestoreTooltip(
                        restoreTooltip
                          ? restoreTooltip === index + 1
                            ? null
                            : index + 1
                          : index + 1,
                      )
                    }
                  >
                    Restore Project
                  </Tooltip>
                </span>
              </>
            ) : 
            <>
              <span
                onClick={() => handleEdit(project)} style={{ cursor: "pointer" }}
                id={"edit-tooltip" + index + 1}
              >
                <EditIcon />
              </span>
              <span>
                <Tooltip
                  placement="left"
                  target={"edit-tooltip" + index + 1}
                  isOpen={editTooltip === index + 1}
                  toggle={() =>
                    setEditTooltip(
                      editTooltip
                        ? editTooltip === index + 1
                          ? null
                          : index + 1
                        : index + 1,
                    )
                  }
                >
                  Edit Project
                </Tooltip>
              </span>
              <span
                onClick={() => {
                  toggleArchiveProjectModal()
                  setArchiveProject(project)
                }}
                style={{ cursor: "pointer" }}
                id={"archive-tooltip" + index + 1}
              >
                <ArchiveIcon />
              </span>
              <span>
                <Tooltip
                  placement="left"
                  target={"archive-tooltip" + index + 1}
                  isOpen={archiveTooltip === index + 1}
                  toggle={() =>
                    setArchiveTooltip(
                      archiveTooltip
                        ? archiveTooltip === index + 1
                          ? null
                          : index + 1
                        : index + 1,
                    )
                  }
                >
                  Archive Project
                </Tooltip>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractTile;
