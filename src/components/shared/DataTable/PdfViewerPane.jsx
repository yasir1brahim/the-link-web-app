import React from 'react';
import PdfWrapper from '../../../pdfWrapper';
import { ReactComponent as CloseIcon } from '../../../assets/images/close-x.svg';
import Loader from '../Loader/Loader';
import './DataTable.css';

const PdfViewerPane = ({
  pdfData,
  setPdfData,
  title,
  onClose,
  isLoading = false,
  setLoading,
}) => {
  return (
    <div className="dt-pdf-pane">
      <div className="dt-pdf-header">
        <span className="dt-pdf-title" title={title}>
          {title}
        </span>

        <button
          className="dt-pdf-close"
          data-testid="pdf-close"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <div className="dt-pdf-content">
        {isLoading && (
          <div data-testid="pdf-loading" className="dt-loading">
            <Loader />
          </div>
        )}
        <PdfWrapper
          pdfData={pdfData}
          setPdfData={setPdfData}
          loading={isLoading}
          setLoading={setLoading}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default PdfViewerPane;
