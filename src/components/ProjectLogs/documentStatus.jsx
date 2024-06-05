import React from 'react';

import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import PendingOutlined from '@mui/icons-material/PendingOutlined';


export default function DocumentStatus(props) {

    const getStatusDisplay = (status) => {
        if (status === "PROCESSED") {
            return <span><CheckIcon color='success'/> Processed</span>;
        } else if (status === "FAILED") {
            return <span><ErrorIcon color='error'/> Failed</span>;
        } else {
            return <span><PendingOutlined /> Processing</span>;
        }
    }
  const documentData = props.documentData;
  console.log("DOCUMENT DATA", documentData);
  return (
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
                <tr>
                    <td>{document.document_name}: {getStatusDisplay(document.document_status)}</td>
                    <td>{document.document_subsections.map((document_subsection) => {return <><span>{document_subsection.masterformat_number}: {getStatusDisplay(document_subsection.processing_status)}</span><br /></>})}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
