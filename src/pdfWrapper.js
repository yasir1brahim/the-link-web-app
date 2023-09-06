// import PdfReader from './components/PdfReader'
// import { useLocation } from 'react-router-dom';

import React from 'react';
import ProjectLogsReader from './components/PdfReader/projectLogsReader';
const PdfWrapper = (props) => {
  // const location = useLocation()
  return (
    <div className="ss-pdf-wrraper">
      <ProjectLogsReader
        url={props.pdfData.url}
        textLoc={props.pdfData.textLoc}
        docId={props.pdfData.docId}
      />
      {/* <PdfReader url={props.pdfData.url} textLoc={props.pdfData.textLoc} docId={props.pdfData.docId}/> */}
    </div>
  );
};
export default PdfWrapper;
