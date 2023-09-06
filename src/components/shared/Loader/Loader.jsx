import React from 'react';

const Loader = (props) => {
  return (
    props.showComponentLoader && (
      <div
        className={
          'loader-wrapper ' +
          (props.showComponentLoader ? 'wrapper-component' : '')
        }
      >
        <div className="dots">
          {props.showProcessing ? (
            <p className="dot-processing">Processing, this might take upto 5 minutes.</p>
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
