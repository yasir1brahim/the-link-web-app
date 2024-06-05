import React from 'react';

import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import PendingOutlined from '@mui/icons-material/PendingOutlined';


export default function DocumentStatus(props) {

    const getStatusDisplay = (status, isDocumentStatus = false) => {
        if (status === "PROCESSED" || status === null) {
            return <span><CheckIcon color='success'/>{isDocumentStatus ? "Document" : "Section"} Processed</span>;
        } else if (status === "FAILED") {
            return <span><ErrorIcon color='error'/>{isDocumentStatus ? "Document" : "Section"} Failed</span>;
        } else {
            return <span>{isDocumentStatus ? "Document" : "Section"} Processing</span>;
        }
    }
  const documentData = props.documentData;
  console.log("DOCUMENT DATA", documentData);
  return (
    <div style={{marginBottom: '20px'}}>
        {documentData.length === 0 ? <div>No documents uploaded yet</div> : (
            <div className="l-table-wrapper">
            <table className="table">
                <thead>
                <tr>
                    <th>
                    <span>File Name</span>
                    </th>
                    <th>
                    <span>Processing Status</span>
                    </th>
                </tr>
                </thead>
                <tbody>
                {documentData.map((document) => {
                    console.log("DOCUMENT", document);
                    
                    return (
                        <tr key={document.id}>
                            <td>{document.document_name}</td>
                            <td>
                                <b>{getStatusDisplay(document.document_status, true)}</b>
                                <table>
                                    <tbody>
                                        {document.document_subsections.map((document_subsection) => {return <tr><td>{document_subsection.masterformat_number}</td><td>{getStatusDisplay(document_subsection.processing_status)}</td></tr>})}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        )}
    </div>
  );
}
