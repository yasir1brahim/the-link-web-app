import React from 'react';

const ClassificationChip = ({ classification, index }) => {
  return (
    <span 
      key={index}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: '#F5F7FF',
        color: '#0D47A1',
        width: 'fit-content',
        maxWidth: '100%',
        wordBreak: 'break-word',
        whiteSpace: 'normal',
        border: '1px solid #90CAF9'
      }}
    >
      {typeof classification === 'string' ? classification.trim() : ''}
    </span>
  );
};

export default ClassificationChip;

