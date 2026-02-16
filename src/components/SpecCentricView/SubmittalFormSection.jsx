import React from 'react';
import PropTypes from 'prop-types';
import './SubmittalFormSection.css';

const SubmittalFormSection = ({
  isVisible,
  paraNo,
  description,
  type,
  onParaNoChange,
  onDescriptionChange,
  onTypeChange,
}) => {
  if (!isVisible) return null;

  return (
    <div className="submittal-form-section">
      <div className="submittal-form-field">
        <label htmlFor="submittal-description">
          Submittal Description <span className="required">*</span>
        </label>
        <input
          id="submittal-description"
          type="text"
          className="submittal-input"
          placeholder="e.g., Product Data, Shop Drawings"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={500}
          required
        />
      </div>

      <div className="submittal-form-field">
        <label htmlFor="submittal-type">
          Submittal Type <span className="required">*</span>
        </label>
        <input
          id="submittal-type"
          type="text"
          className="submittal-input"
          placeholder="e.g., Submittals, Samples"
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          maxLength={200}
          required
        />
      </div>

      <div className="submittal-form-field">
        <label htmlFor="submittal-para-no">
          Paragraph Number <span className="optional">(Optional)</span>
        </label>
        <input
          id="submittal-para-no"
          type="text"
          className="submittal-input"
          placeholder="e.g., 1.4.1"
          value={paraNo}
          onChange={(e) => onParaNoChange(e.target.value)}
          maxLength={50}
        />
      </div>
    </div>
  );
};

SubmittalFormSection.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  paraNo: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  onParaNoChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onTypeChange: PropTypes.func.isRequired,
};

export default SubmittalFormSection;
