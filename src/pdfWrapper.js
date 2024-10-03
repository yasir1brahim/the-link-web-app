// import PdfReader from './components/PdfReader'
// import { useLocation } from 'react-router-dom';

import React from 'react';
import ProjectLogsReader from './components/PdfReader/projectLogsReader';
const PdfWrapper = (props) => {
  // const location = useLocation()
  return (
    <div className="ss-pdf-wrraper" style={{width: '100%'}}>
      <ProjectLogsReader
        url={props.pdfData.url}
        textLoc={props.pdfData.textLoc}
        docId={props.pdfData.docId}
        additionalTextLocations={props.pdfData.additionalTextLocations}
        setPdfData={props.setPdfData}
        setSubmittalIdParam={props.setSubmittalIdParam}
        handleAddNewRow={props.handleAddNewRow}
        handleAppendToSelectedRow={props.handleAppendToSelectedRow}
        setLogInViewer={props.setLogInViewer}
        loading={props.loading}
        setLoading={props.setLoading}
      />
      {/* <PdfReader url={props.pdfData.url} textLoc={props.pdfData.textLoc} docId={props.pdfData.docId}/> */}
    </div>
  );
};
export default PdfWrapper;
