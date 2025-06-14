import React from "react";

const ProcessingIndicator = ({ documentIsProcessing, documentData, toggleDocumentStatusModal, indicatorText }) => {
  return (
    <>
      {documentIsProcessing(documentData) && (
        <>
          <div
            className="alert"
            style={{ backgroundColor: "#D5E73E" }}
            role="alert">
            {indicatorText}
          </div>
            <div style={{ display: 'flex', justifyContent: 'left' }}>
            {documentIsProcessing(documentData) && (
                <button
                type="button"
                className="table-top-btn selection-btn"
                style={{ marginTop: '10px', marginBottom: '20px' }}
                onClick={toggleDocumentStatusModal}
                >
                <span>Document Status</span>
                </button>
            )}
            </div>
        </>
      )}
    </>
  );
};

export default ProcessingIndicator;