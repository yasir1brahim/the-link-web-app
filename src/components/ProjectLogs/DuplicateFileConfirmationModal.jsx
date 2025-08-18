import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { reprocessDocument } from "../../api/ProjectLogs/api";
import { toast } from "react-toastify";
import Loader from "../shared/Loader/Loader";

const DuplicateFileConfirmationModal = ({ 
  isOpen, 
  toggle, 
  duplicateFiles, 
  onConfirmAll, 
  onSkipAll,
  onFileReprocessed 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFiles, setProcessingFiles] = useState(new Set());

  const handleReprocessFile = async (fileInfo) => {
    const fileId = fileInfo.existing_file_id;
    setProcessingFiles(prev => new Set([...prev, fileId]));
    
    try {
      await reprocessDocument(fileId);
      toast.success(`Successfully started reprocessing "${fileInfo.filename}"`);
      
      if (onFileReprocessed) {
        onFileReprocessed(fileId);
      }
      
      // Check if this was the last file and close modal if needed
      const remainingFiles = duplicateFiles.filter(f => f.existing_file_id !== fileId);
      if (remainingFiles.length === 0) {
        toggle(); // Close modal if no more files
      }
    } catch (error) {
      console.error('Error reprocessing file:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to reprocess file';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleReprocessAll = async () => {
    setIsProcessing(true);
    
    try {
      const promises = duplicateFiles.map(fileInfo => 
        reprocessDocument(fileInfo.existing_file_id)
      );
      
      await Promise.all(promises);
      toast.success(`Successfully started reprocessing ${duplicateFiles.length} files`);
      
      if (onFileReprocessed) {
        duplicateFiles.forEach(fileInfo => {
          onFileReprocessed(fileInfo.existing_file_id);
        });
      }
      
      toggle();
    } catch (error) {
      console.error('Error reprocessing files:', error);
      toast.error('Error reprocessing some files');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipAll = () => {
    onSkipAll();
    toggle();
  };

  if (!duplicateFiles || duplicateFiles.length === 0) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={false} className="new-customer modal-lg">
      <ModalHeader toggle={toggle}>Duplicate Files Detected</ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <p>The following files already exist in this project. You can choose to reprocess them or skip them:</p>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Original Upload Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {duplicateFiles.map((fileInfo) => (
                <tr key={fileInfo.existing_file_id}>
                  <td style={{ fontSize: "14px" }}>{fileInfo.filename}</td>
                  <td style={{ fontSize: "14px" }}>
                    {fileInfo.upload_date ? new Date(fileInfo.upload_date).toLocaleDateString() : "-"}
                  </td>
                  <td>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => handleReprocessFile(fileInfo)}
                      disabled={processingFiles.has(fileInfo.existing_file_id) || isProcessing}
                    >
                      {processingFiles.has(fileInfo.existing_file_id) ? 'Processing...' : 'Reprocess'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isProcessing && (
          <Loader showComponentLoader={true} showProcessing={true} />
        )}
      </ModalBody>
      <ModalFooter>
        <Button 
          color="primary" 
          onClick={handleReprocessAll}
          disabled={isProcessing || processingFiles.size > 0}
        >
          {isProcessing ? 'Processing All...' : 'Reprocess All'}
        </Button>
        <Button 
          color="secondary" 
          onClick={handleSkipAll}
          disabled={isProcessing || processingFiles.size > 0}
        >
          Skip All
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DuplicateFileConfirmationModal; 