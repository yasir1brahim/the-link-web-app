import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { reprocessDocument } from "../../api/ProjectLogs/api";
import { toast } from "react-toastify";
import Loader from "../shared/Loader/Loader";

const DocumentListModal = ({ isOpen, toggle, documents }) => {
  const [isReprocessing, setIsReprocessing] = useState(false);

  const handleReprocess = async (documentId, documentName) => {
    setIsReprocessing(true);
    try {
      console.log('Reprocessing document:', { documentId, documentName });
      const response = await reprocessDocument(documentId);

      toast.success(`Successfully started reprocessing "${documentName}"`);

      toggle();

    } catch (error) {
      console.error('Error reprocessing document:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to reprocess document';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsReprocessing(false);
    }
  };

  return (
    <>
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
                    <tr key={doc.document_id}>
                      <td style={{ fontSize: "14px" }}>{doc.document_name}</td>
                      <td style={{ fontSize: "14px" }}>
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td>
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() => handleReprocess(doc.document_id, doc.document_name)}
                          disabled={isReprocessing}
                        >
                          {isReprocessing ? 'Processing...' : 'Reprocess'}
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
          <Button color="secondary" onClick={toggle} disabled={isReprocessing}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <Loader showComponentLoader={isReprocessing} />
    </>
  );
};

export default DocumentListModal;