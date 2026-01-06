import React, { useState } from 'react';
import { Alert, Button, Spinner } from 'reactstrap';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { reprocessDocument } from '../../api/ProjectLogs/api';
import { ToastService } from '../shared/Toast/Toast';

/**
 * @param {Object} doc
 * @returns {boolean} - True if document needs reprocessing
 */
export const needsCompassReprocessing = (doc) => {

  const needsProcessing = 
    doc.specgpt_processing_status === "NONE";
  // Document Not currently being processed in Assistant
  const notProcessing = !["UPLOADING", "IN_QUEUE", "PROCESSING", "SUBSECTIONS_EXTRACTED"].includes(
    doc.specgpt_processing_status
  );
  
  return needsProcessing && notProcessing;
};

const CompassReprocessBanner = ({ 
  documentData = [], 
  onReprocessComplete,
  isSpecGptEnabled = true 
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
      let successCount = 0;
      let failCount = 0;

      for (const doc of documentsNeedingReprocess) {
        try {
          await reprocessDocument(doc.document_id);
          successCount++;
        } catch (error) {
          console.error(`Failed to reprocess document ${doc.document_id}:`, error);
          failCount++;
        }
      }

      if (failCount === 0) {
        ToastService.success(`${successCount} document${successCount > 1 ? 's' : ''} queued for Assistant processing`);
      } else if (successCount > 0) {
        ToastService.warning(`${successCount} document${successCount > 1 ? 's' : ''} queued, ${failCount} failed`);
      } else {
        ToastService.error('Failed to queue documents for processing');
      }
      
      if (onReprocessComplete) {
        onReprocessComplete();
      }
    } catch (error) {
      console.error('Error during reprocessing:', error);
      ToastService.error('Failed to queue documents for processing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Alert 
      color="info" 
      className="compass-reprocess-banner"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        margin: '0 16px 16px 16px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d7ff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
        <InfoOutlinedIcon style={{ color: '#0066cc', marginTop: '2px' }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#004085', lineHeight: '1.5' }}>
            We noticed that the listed documents are old, please reprocess them to access their information in Assistant.
          </p>
          <div style={{ marginTop: '8px' }}>
            <strong style={{ color: '#004085', fontSize: '13px' }}>Documents:</strong>
            <ul style={{ 
              margin: '4px 0 0 0', 
              paddingLeft: '20px',
              color: '#004085',
              fontSize: '13px',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {documentsNeedingReprocess.map((doc) => (
                <li key={doc.document_id} style={{ marginBottom: '2px' }}>
                  {doc.document_name}
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
        style={{
          minWidth: '140px',
          whiteSpace: 'nowrap',
          alignSelf: 'flex-start',
        }}
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

export default CompassReprocessBanner;