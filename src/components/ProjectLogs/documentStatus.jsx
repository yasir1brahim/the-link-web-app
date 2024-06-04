import React from 'react';

export default function DocumentStatus(props) {
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
                    <td>{document.document_name}</td>
                    <td>{document.document_subsections.map((document_subsection) => {return <><span>{document_subsection.masterformat_number}: {document_subsection.processing_status}</span><br /></>})}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
