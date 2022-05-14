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
        <div class="dots">
          <div class="dot1"></div>
          <div class="dot2"></div>
          <div class="dot3"></div>
          <div class="dot4"></div>
        </div>
      </div>
    )
  );
};

export default Loader;
