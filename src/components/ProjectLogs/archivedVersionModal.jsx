import { React, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { RestoreIcon } from "../shared/icons/restoreIcon";
import StyledTooltip from "../shared/StyledTooltip/StyledTooltip";

const ArchivedVersionsModal = ({
  isOpen,
  toggle,
  archivedVersions,
  onUnarchive,
  loadingUnarchiveId,
}) => {
  return(
    <Modal isOpen={isOpen} toggle={toggle} fade={false} className="modal-md">
      <ModalHeader toggle={toggle}>Archived Versions</ModalHeader>
      <ModalBody>
        {archivedVersions.length === 0 ? (
          <div>No archived versions found.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Version Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {archivedVersions.map((version) => (
                <tr key={version.id}>
                  <td>{version.version_name}</td>
                  <td>
                    <StyledTooltip 
                      title={loadingUnarchiveId === version.id ? "Unarchiving..." : "Restore Project"} 
                      arrow
                      placement="left"
                    >
                      <span
                        onClick={() => {
                          onUnarchive(version.id);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <RestoreIcon />
                      </span>
                    </StyledTooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}
export default ArchivedVersionsModal;