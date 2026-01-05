import React, { useState } from "react";
import { toast } from "react-toastify";
import { IconButton, Checkbox } from "@mui/material";
import { ReactComponent as ReprocessIcon } from "../../assets/images/file-reprocess.svg";
import { ReactComponent as DownloadIcon } from "../../assets/images/file-download.svg";
import { ReactComponent as TrashIcon } from "../../assets/images/trash.svg";
import StyledTooltip from "../shared/StyledTooltip/StyledTooltip";
import Loader from "../shared/Loader/Loader";
import {bulkDownloadDocuments, bulkReprocessDocuments, bulkDeleteDocuments } from "../../api/ProjectLogs/api";

const DocumentsTab = ({
  documents,
  onAfterReprocess,
  onAfterDelete
}) => {
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());

  const handleSelectDocument = (documentId) => {
    const newSelectedDocuments = new Set(selectedDocuments);
    if (newSelectedDocuments.has(documentId)) {
      newSelectedDocuments.delete(documentId);
    } else {
      newSelectedDocuments.add(documentId);
    }
    setSelectedDocuments(newSelectedDocuments);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.size === documents.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(documents.map(doc => doc.document_id)));
    }
  };


  const handleBulkDownload = async () => {
    if (selectedDocuments.size === 0) {
      toast.warning("Please select at least one document to download");
      return;
    }

    setIsDownloading(true);
    try {
      const documentIds = Array.from(selectedDocuments);
      await bulkDownloadDocuments(documentIds);
      
      // Only show success message after download is actually completed
      setTimeout(() => {
        const count = selectedDocuments.size;
        toast.success(`${count} document${count > 1 ? 's' : ''} downloaded successfully`);
      }, 1000);
      
      // Clear selection after successful download
      setSelectedDocuments(new Set());
    } catch (error) {
      console.error('Error downloading documents:', error);
      
      let errorMessage = 'Failed to download documents';
      
      if (error.message?.includes('popup was blocked')) {
        errorMessage = 'Download failed and popup was blocked. Please allow popups and try again.';
      } else if (error.message?.includes('HTTP')) {
        errorMessage = 'Some documents are temporarily unavailable. Please try again later.';
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

  const handleBulkReprocess = async () => {
    if (selectedDocuments.size === 0) {
      toast.warning("Please select at least one document to reprocess");
      return;
    }

    setIsReprocessing(true);
    try {
      const documentIds = Array.from(selectedDocuments);
      const count = selectedDocuments.size;
      await bulkReprocessDocuments(documentIds);

      // Call parent callback to refresh data before showing success
      if (onAfterReprocess) {
        await onAfterReprocess();
      }

      toast.success(`${count} document${count > 1 ? 's' : ''} reprocessing started successfully`);

      // Clear selection after successful reprocess
      setSelectedDocuments(new Set());
    } catch (error) {
      console.error('Error reprocessing documents:', error);
      
      let errorMessage = 'Failed to reprocess documents';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) {
      toast.warning("Please select at least one document to delete");
      return;
    }

    const count = selectedDocuments.size;
    const confirmMessage = `Are you sure you want to delete ${count} document${count > 1 ? 's' : ''}? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      const documentIds = Array.from(selectedDocuments);
      await bulkDeleteDocuments(documentIds);

      // Call parent callback to refresh data before showing success
      if (onAfterDelete) {
        await onAfterDelete();
      }

      toast.success(`${count} document${count > 1 ? 's' : ''} deleted successfully`);
      // Clear selection after successful delete
      setSelectedDocuments(new Set());
    } catch (error) {
      console.error('Error deleting documents:', error);
      
      let errorMessage = 'Failed to delete documents';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };


  const getDownloadTooltip = () => {
    const count = selectedDocuments.size;
    if (count === 0) {
      return "Select documents to download";
    } else if (count === 1) {
      return "Download selected";
    } else {
      return "Download selected";
    }
  };

  return (
    <div>
      {documents?.length ? (
        <div style={{ overflowX: "auto" }}>
          {/* Download button common */}
          <div className="d-flex justify-content-start mb-2">
            <div style={{ display: 'flex', gap: '4px' }}>
              <StyledTooltip title={isReprocessing ? "Reprocessing documents..." : selectedDocuments.size > 0 ? "Reprocess Selected Documents" : "Select documents to reprocess"} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={handleBulkReprocess}
                    disabled={isReprocessing || isDownloading || isDeleting || selectedDocuments.size === 0}
                    style={{
                      color: selectedDocuments.size > 0 ? '#1976d2' : '#999',
                      padding: '4px'
                    }}
                  >
                    <ReprocessIcon style={{ width: '20px', height: '20px' }} />
                  </IconButton>
                </span>
              </StyledTooltip>
              <StyledTooltip title={isDownloading ? "Downloading documents..." : getDownloadTooltip()} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={handleBulkDownload}
                    disabled={isDownloading || selectedDocuments.size === 0}
                    style={{
                      color: selectedDocuments.size > 0 ? '#1976d2' : '#999',
                      padding: '4px'
                    }}
                  >
                    <DownloadIcon style={{ width: '20px', height: '20px' }} />
                  </IconButton>
                </span>
              </StyledTooltip>
              <StyledTooltip title={isDeleting ? "Deleting documents..." : selectedDocuments.size > 0 ? "Delete Selected Documents" : "Select documents to delete"} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={handleBulkDelete}
                    disabled={isReprocessing || isDownloading || isDeleting || selectedDocuments.size === 0}
                    style={{
                      color: selectedDocuments.size > 0 ? '#d32f2f' : '#999',
                      padding: '4px'
                    }}
                  >
                    <TrashIcon style={{ width: '20px', height: '20px' }} />
                  </IconButton>
                </span>
              </StyledTooltip>
            </div>
          </div>

          <table className="table table-striped" style={{ minWidth: "600px", marginBottom: 0 }}>
            <thead>
              <tr>
                <th style={{ width: "5%", padding: "8px" }}>
                  <Checkbox
                    checked={selectedDocuments.size === documents.length && documents.length > 0}
                    indeterminate={selectedDocuments.size > 0 && selectedDocuments.size < documents.length}
                    onChange={handleSelectAll}
                    size="small"
                  />
                </th>
                <th style={{ width: "75%", padding: "8px" }}>File Name</th>
                <th style={{ width: "20%", padding: "8px" }}>Date Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.document_id}>
                  <td style={{ padding: "8px" }}>
                    <Checkbox
                      checked={selectedDocuments.has(doc.document_id)}
                      onChange={() => handleSelectDocument(doc.document_id)}
                      size="small"
                    />
                  </td>
                  <td style={{ fontSize: "14px", padding: "8px" }}>{doc.document_name}</td>
                  <td style={{ fontSize: "14px", padding: "8px" }}>
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No documents uploaded yet.</div>
      )}
      
      {/* Loading overlay */}
      <Loader showComponentLoader={isReprocessing || isDownloading || isDeleting} />
    </div>
  );
};

export default DocumentsTab;
