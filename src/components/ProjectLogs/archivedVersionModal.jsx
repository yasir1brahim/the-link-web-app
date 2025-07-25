import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ArchivedVersionsModal = ({
  isOpen,
  toggle,
  archivedVersions,
  onUnarchive,
  loadingUnarchiveId,
}) => (
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
              <th>Date Archived</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {archivedVersions.map((version) => (
              <tr key={version.id}>
                <td>{version.version_name}</td>
                <td>{version.archived_at ? new Date(version.archived_at).toLocaleString() : "-"}</td>
                <td>
                  <Button
                    color="success"
                    size="sm"
                    disabled={loadingUnarchiveId === version.id}
                    onClick={() => onUnarchive(version.id)}
                  >
                    {loadingUnarchiveId === version.id ? "Unarchiving..." : "Unarchive"}
                  </Button>
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

export default ArchivedVersionsModal;