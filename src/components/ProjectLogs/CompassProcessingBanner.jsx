import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axios';
import { ToastService } from '../shared/Toast/Toast';
import './CompassProcessingBanner.css';

const CompassProcessingBanner = ({ projectId, onProcessingTriggered }) => {
    const [showBanner, setShowBanner] = useState(false);
    const [processingStatus, setProcessingStatus] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetchProcessingStatus();
        }
    }, [projectId]);

    const fetchProcessingStatus = async () => {
        try {
            const response = await axiosInstance.get(
                `/api/deliverables/projects/${projectId}/compass-processing-status/`
            );
            setProcessingStatus(response.data);

            // Show banner if processing is needed and Compass is enabled
            setShowBanner(
                response.data.compass_enabled &&
                response.data.needs_processing
            );
        } catch (error) {
            console.error('Error fetching compass processing status:', error);
            // Don't show banner if there's an error
            setShowBanner(false);
        }
    };

    const handleTriggerProcessing = async () => {
        setIsProcessing(true);
        try {
            const response = await axiosInstance.post(
                `/api/deliverables/projects/${projectId}/trigger-compass-processing/`
            );

            ToastService.success(response.data.message);
            setShowBanner(false); // Hide banner after successful trigger

            // Notify parent component to refresh document data
            if (onProcessingTriggered) {
                onProcessingTriggered();
            }
        } catch (error) {
            console.error('Error triggering compass processing:', error);
            ToastService.error('Failed to trigger processing. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!showBanner || !processingStatus) {
        return null;
    }

    return (
        <div className="compass-processing-banner" role="alert">
            <div className="banner-content">
                <div className="banner-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#1976D2" />
                    </svg>
                </div>
                <div className="banner-text">
                    <strong>Compass Feature Now Available!</strong>
                    <p>
                        You have <strong>{processingStatus.unprocessed_document_count}</strong> document
                        {processingStatus.unprocessed_document_count !== 1 ? 's' : ''} that{' '}
                        {processingStatus.unprocessed_document_count !== 1 ? 'haven\'t' : 'hasn\'t'} been
                        processed with Compass yet. Process them now to enable AI-powered document search
                        and analysis in the Assistant tab.
                    </p>
                </div>
            </div>
            <div className="banner-actions">
                <button
                    type="button"
                    className="btn-process"
                    onClick={handleTriggerProcessing}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <span className="spinner"></span>
                            Processing...
                        </>
                    ) : (
                        'Process Documents'
                    )}
                </button>
            </div>
        </div>
    );
};

export default CompassProcessingBanner;
