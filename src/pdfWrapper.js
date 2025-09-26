// import PdfReader from './components/PdfReader'
// import { useLocation } from 'react-router-dom';

import React from 'react';
import ProjectLogsReader from './components/PdfReader/projectLogsReader';
import { useS3LinkValidation } from './hooks/useS3LinkValidation.js';

const PdfWrapper = (props) => {
  const { handleError, ErrorModal } = useS3LinkValidation();

  const highlightLocations = [props.pdfData.textLoc].concat(props.pdfData.additionalTextLocations || []);

  return (
    <div className="ss-pdf-wrraper" style={{width: '100%'}}>
      <ErrorModal />
      <ProjectLogsReader
        url={props.pdfData.url}
        highlightLocations={highlightLocations}
        docId={props.pdfData.docId}
        setPdfData={props.setPdfData}
        setSubmittalIdParam={props.setSubmittalIdParam}
        handleAddNewRow={props.handleAddNewRow}
        handleAppendToSelectedRow={props.handleAppendToSelectedRow}
        setLogInViewer={props.setLogInViewer}
        loading={props.loading}
        setLoading={props.setLoading}
        onError={handleError}
      />
    </div>
  );
};

export default PdfWrapper;
