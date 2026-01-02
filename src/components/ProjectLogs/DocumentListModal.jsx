import React, { useState,useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import { deleteDocument } from "../../api/ProjectLogs/api";
import { toast } from "react-toastify";
import Loader from "../shared/Loader/Loader";
import SpecSectionsTab from "./SpecSectionsTab";
import DocumentsTab from "./DocumentsTab";

const DocumentListModal = ({ isOpen, toggle, documents, onAfterReprocess, onAfterDelete, projectId, projectVersionId, specSectionCount = 0, defaultTab = "documents",  }) => {
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Check if we're in production environment
  const isProduction = window.location.hostname === 'app.thelink.ai';


  const handleDeleteClick = (documentId, documentName) => {
    setDocumentToDelete({ id: documentId, name: documentName });
    setDeleteConfirmationModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteDocument(documentToDelete.id);
      toast.success("Document Deleted Successfully");
      
      if (onAfterDelete && typeof onAfterDelete === 'function') {
        try {
          await onAfterDelete(documentToDelete.id);
        } catch (callbackError) {
          console.error('Error in onAfterDelete callback:', callbackError);
        }
      }

      setDeleteConfirmationModal(false);
      setDocumentToDelete(null);
      toggle();

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
        <ModalHeader toggle={toggle}>Project Files</ModalHeader>
        <ModalBody>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={activeTab === 'documents' ? 'active' : ''}
                onClick={() => setActiveTab('documents')}
              >
                Documents ({documents?.length || 0})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === 'spec-sections' ? 'active' : ''}
                onClick={() => setActiveTab('spec-sections')}
              >
                Spec Sections ({specSectionCount})
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="documents">
              <div style={{ marginTop: '20px' }}>
                <DocumentsTab 
                  documents={documents}
                  onAfterReprocess={onAfterReprocess}
                  onAfterDelete={onAfterDelete}
                  isProduction={isProduction}
                />
              </div>
            </TabPane>
            <TabPane tabId="spec-sections">
              <div style={{ marginTop: '20px' }}>
                <SpecSectionsTab 
                  projectId={projectId} 
                  projectVersionId={projectVersionId} 
                />
              </div>
            </TabPane>
          </TabContent>
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