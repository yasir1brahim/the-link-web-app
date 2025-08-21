import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { reprocessDocument, downloadDocument, deleteDocument } from "../../api/ProjectLogs/api";
import { toast } from "react-toastify";
import Loader from "../shared/Loader/Loader";
import { Tooltip, IconButton } from "@mui/material";
import { ReactComponent as ReprocessIcon } from "../../assets/images/file-reprocess.svg";
import { ReactComponent as DownloadIcon } from "../../assets/images/file-download.svg";
import { ReactComponent as TrashIcon } from "../../assets/images/trash.svg";

const DocumentListModal = ({ isOpen, toggle, documents, onAfterReprocess, onAfterDelete }) => {
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  const handleReprocess = async (documentId, documentName) => {
    setIsReprocessing(true);
    try {
      console.log('Reprocessing document:', { documentId, documentName });
      await reprocessDocument(documentId);

      toast.success(`Successfully started reprocessing "${documentName}"`);

      setIsReprocessing(false);
      toggle();

      if (onAfterReprocess) {
        onAfterReprocess(documentId);
      }

    } catch (error) {
      console.error('Error reprocessing document:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to reprocess document';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleDownload = async (documentId, documentName) => {
    setIsDownloading(true);
    try {
      await downloadDocument(documentId);
      toast.success(`Successfully downloaded "${documentName}"`);
    } catch (error) {
      console.error('Error downloading document:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to download document';
      
      if (error.message?.includes('popup was blocked')) {
        errorMessage = 'Download failed and popup was blocked. Please allow popups and try again.';
      } else if (error.message?.includes('HTTP')) {
        errorMessage = 'Document is temporarily unavailable. Please try again later.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteClick = (documentId, documentName) => {
    setDocumentToDelete({ id: documentId, name: documentName });
    setDeleteConfirmationModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteDocument(documentToDelete.id);
      toast.success(`Successfully deleted "${documentToDelete.name}"`);
      
      setDeleteConfirmationModal(false);
      setDocumentToDelete(null);
      toggle();

      if (onAfterDelete) {
        onAfterDelete(documentToDelete.id);
      }

    } catch (error) {
      console.error('Error deleting document:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to delete document';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmationModal(false);
    setDocumentToDelete(null);
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
                    <th style={{ width: "20%" }}>Actions</th>
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
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <Tooltip title="Reprocess Document" placement="top">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleReprocess(doc.document_id, doc.document_name)}
                                disabled={isReprocessing || isDownloading || isDeleting}
                                style={{ 
                                  color: '#1976d2',
                                  // padding: '4px'
                                }}
                              >
                                <ReprocessIcon style={{ width: '20px', height: '20px' }}/>
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Download Document" placement="top">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleDownload(doc.document_id, doc.document_name)}
                                disabled={isReprocessing || isDownloading || isDeleting}
                                style={{ 
                                  color: '#1976d2',
                                  padding: '4px'
                                }}
                              >
                                <DownloadIcon style={{ width: '20px', height: '20px' }}/>  
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Delete Document" placement="top">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(doc.document_id, doc.document_name)}
                                disabled={isReprocessing || isDownloading || isDeleting}
                                style={{ 
                                  color: '#d32f2f',
                                  padding: '4px'
                                }}
                              >
                                <TrashIcon style={{ width: '20px', height: '20px' }}/>  
                              </IconButton>
                            </span>
                          </Tooltip>
                        </div>
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
          <Button color="secondary" onClick={toggle} disabled={isReprocessing || isDownloading || isDeleting}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmationModal} toggle={handleDeleteCancel} fade={false} className="new-customer">
        <ModalHeader toggle={handleDeleteCancel}>Confirm Document Deletion</ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to delete the document "{documentToDelete?.name}"?
          </p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            <strong>Note:</strong> This will permanently delete the document file. However, all submittal logs and other related data will be preserved and remain accessible.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDeleteConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Document'}
          </Button>
        </ModalFooter>
      </Modal>

      <Loader showComponentLoader={isReprocessing || isDownloading || isDeleting} />
    </>
  );
};

export default DocumentListModal;