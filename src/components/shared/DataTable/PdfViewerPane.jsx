import React from 'react';
import PdfWrapper from '../../../pdfWrapper';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ReactComponent as CloseIcon } from '../../../assets/images/close-x.svg';
import Loader from '../Loader/Loader';
import './DataTable.css';

const PdfViewerPane = ({
  pdfData,
  title,
  onClose,
  onNavigateUp,
  onNavigateDown,
  canNavigateUp = true,
  canNavigateDown = true,
  isLoading = false,
}) => {
  return (
    <div className="dt-pdf-pane">
      <div className="dt-pdf-header">
        <span className="dt-pdf-title" title={title}>
          {title}
        </span>

        <div className="dt-pdf-nav">
          <button
            data-testid="pdf-nav-up"
            onClick={onNavigateUp}
            disabled={!canNavigateUp || isLoading}
          >
            <ArrowDropUpIcon />
          </button>
          <button
            data-testid="pdf-nav-down"
            onClick={onNavigateDown}
            disabled={!canNavigateDown || isLoading}
          >
            <ArrowDropDownIcon />
          </button>
        </div>

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
        <PdfWrapper pdfData={pdfData} />
      </div>
    </div>
  );
};

export default PdfViewerPane;
