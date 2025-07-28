import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const DocumentListModal = ({ isOpen, toggle, documents }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={false} className="new-customer modal-md">
      <ModalHeader toggle={toggle}>Uploaded Documents</ModalHeader>
      <ModalBody>
        {documents?.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Date Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td style={{fontSize: '14px'}}>{doc.document_name}</td>
                  <td style={{fontSize: '14px'}}>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No documents uploaded yet.</div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default DocumentListModal;