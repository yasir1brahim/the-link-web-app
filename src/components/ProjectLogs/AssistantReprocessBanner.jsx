import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Spinner } from 'reactstrap';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { bulkReprocessDocuments } from '../../api/ProjectLogs/api';
import { ToastService } from '../shared/Toast/Toast';
import './AssistantReprocessBanner.scss';

/**
 * Determines if a document needs reprocessing for Compass/Assistant feature
 * @param {Object} doc - Document object with specgpt_processing_status
 * @returns {boolean} - True if document needs reprocessing
 */
export const needsCompassReprocessing = (doc) => {
  const status = doc.specgpt_processing_status;
  const doc_status = doc.document_status;

  // Special case: document failed AND specgpt is in queue (stuck state)
  if ( (doc_status === "FAILED" || doc_status === "SECTION_PROCESSING_FAILED") && status === "IN_QUEUE") {
    return true;
  }

  // Documents that need reprocessing: NONE or FAILED
  const needsReprocessing = status === "NONE" || status === "FAILED" || status === "SECTION_PROCESSING_FAILED";

  // Don't show if currently processing
  const isProcessing = ["UPLOADING", "IN_QUEUE", "PROCESSING", "SUBSECTIONS_EXTRACTED"].includes(status);

  return needsReprocessing && !isProcessing;
};

const AssistantReprocessBanner = ({
  documentData,
  onReprocessComplete,
  isSpecGptEnabled
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isSpecGptEnabled) {
    return null;
  }

  const documentsNeedingReprocess = documentData.filter(needsCompassReprocessing);

  if (documentsNeedingReprocess.length === 0) {
    return null;
  }

  const handleProcessAll = async () => {
    setIsProcessing(true);

    try {
      const documentIds = documentsNeedingReprocess.map(doc => doc.document_id);

      // Use bulk API for efficient processing
      await bulkReprocessDocuments(documentIds);

      ToastService.success(
        `${documentIds.length} document${documentIds.length > 1 ? 's' : ''} queued for Assistant processing`
      );

      // Refresh documents to update status and hide banner
      if (onReprocessComplete) {
        onReprocessComplete();
      }
    } catch (error) {
      console.error('Error during reprocessing:', error);
      ToastService.error('Failed to queue documents for processing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Alert
      color="info"
      className="assistant-reprocess-banner"
      role="alert"
      aria-live="polite"
    >
      <div className="banner-content">
        <InfoOutlinedIcon className="banner-icon" aria-hidden="true" />
        <div className="banner-text">
          <p className="banner-message">
            Please reprocess the listed documents in order to access their information in Assistant.
          </p>
          <div className="documents-list-container">
            <strong className="documents-label">Documents:</strong>
            <ul className="documents-list" aria-label="Documents needing reprocessing">
              {documentsNeedingReprocess.map((doc) => (
                <li key={doc.document_id}>
                  {doc.document_name}
                  {doc.specgpt_processing_status === "FAILED" && (
                    <span className="failed-badge" aria-label="Processing failed"> (Failed)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Button
        color="primary"
        size="sm"
        onClick={handleProcessAll}
        disabled={isProcessing}
        className="reprocess-button"
        aria-busy={isProcessing}
      >
        {isProcessing ? (
          <>
            <Spinner size="sm" className="me-2" />
            Processing...
          </>
        ) : (
          'Reprocess Now'
        )}
      </Button>
    </Alert>
  );
};

AssistantReprocessBanner.propTypes = {
  documentData: PropTypes.arrayOf(
    PropTypes.shape({
      document_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      document_name: PropTypes.string.isRequired,
      specgpt_processing_status: PropTypes.string,
    })
  ),
  onReprocessComplete: PropTypes.func,
  isSpecGptEnabled: PropTypes.bool,
};

AssistantReprocessBanner.defaultProps = {
  documentData: [],
  onReprocessComplete: null,
  isSpecGptEnabled: true,
};

export default AssistantReprocessBanner;