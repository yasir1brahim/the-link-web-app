import React from 'react';

const Loader = (props) => {
  return (
    props.showComponentLoader && (
      <div
        className={
          'loader-wrapper ' +
          (props.showComponentLoader ? 'wrapper-component' : '')
        }
        style={props.specGptLoader && {top: '18%'}}
      >
        <div className="dots">
          {props.showProcessing ? (
            <p className="dot-processing">Processing, this might take upto 5 minutes.</p>
          ) : (
            ''
          )}
          {props.specGptLoader ? (
            <p className="dot-processing">Documents are being processed, SpecGPT will be available shortly.</p>
          ) : (
            ''
          )}
          <div className="dot1"></div>
          <div className="dot2"></div>
          <div className="dot3"></div>
          <div className="dot4"></div>
        </div>
      </div>
    )
  );
};

export default Loader;
