import React from 'react';
import ProjectLogsReader from '../PdfReader/projectLogsReader';
import './DocumentHighlighter.css';

const DocumentHighlighter = ({ 
  highlights = [], 
  highlightsEnabled = true, 
  onHighlightClick,
  documentUrl = null,
  documentId = null
}) => {
  if (!documentUrl) {
    return (
      <div className="document-highlighter-container">
        <div className="document-placeholder">
          <div className="placeholder-content">
            <h3>Document Viewer</h3>
            <p>Select a spec section to view its document.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="document-highlighter-container">
      <ProjectLogsReader
        url={documentUrl}
        textLoc={null}
        docId={documentId}
        additionalTextLocations={[]}
        setPdfData={() => {}}
        setSubmittalIdParam={() => {}}
        handleAddNewRow={() => {}}
        handleAppendToSelectedRow={() => {}}
        setLogInViewer={() => {}}
        loading={false}
        setLoading={() => {}}
        onError={() => {}}
      />
    </div>
  );
};

export default DocumentHighlighter;