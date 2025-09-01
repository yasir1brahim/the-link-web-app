import { useState } from 'react';
import { S3ExpiredLinkModal } from '../components/PdfReader/S3ExpiredLinkModal';

/**
 * Simple hook for S3 link validation and error handling
 */
export const useS3LinkValidation = () => {
  const [showExpiredLinkModal, setShowExpiredLinkModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleError = (error) => {
    console.error('S3 link error:', error);
    setErrorMessage(error.message || 'The document link has expired. Please refresh the page to get a new link and try again.');
    setShowExpiredLinkModal(true);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const closeModal = () => {
    setShowExpiredLinkModal(false);
    setErrorMessage('');
  };

  const ErrorModal = () => (
    <S3ExpiredLinkModal
      isOpen={showExpiredLinkModal}
      onClose={closeModal}
      onRefresh={handleRefresh}
      message={errorMessage}
    />
  );

  return {
    handleError,
    ErrorModal
  };
}; 