import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import axiosInstance from "../../config/axios";
import { toast } from "react-toastify";

const DocumentListModal = ({ isOpen, toggle, documents, projectId, projectVersionId }) => {

  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={false} className="new-customer modal-lg">
      <ModalHeader toggle={toggle}>Uploaded Documents</ModalHeader>
      <ModalBody>
        {documents?.length ? (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ minWidth: "600px" }}>
              <thead>
                <tr>
                  <th style={{ width: "60%" }}>File Name</th>
                  <th style={{ width: "20%" }}>Date Uploaded</th>
                  <th style={{ width: "20%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td style={{ fontSize: "14px" }}>{doc.document_name}</td>
                    <td style={{ fontSize: "14px" }}>
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td>
                      <Button
                        color="primary"
                        size="sm"
                        // onClick={() => handleReprocess(doc.id, doc.document_name)}
                      >
                        Reprocess
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>No documents uploaded yet.</div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DocumentListModal;