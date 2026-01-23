import {React , useEffect} from 'react';

const Loader = (props) => {
  useEffect(() => {
    const shouldLockScroll = props.showComponentLoader && !props.componentScoped;
    if (shouldLockScroll) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [props.showComponentLoader, props.componentScoped]);

  return (
    props.showComponentLoader && (
      <div
        className={
          'loader-wrapper ' +
          (props.componentScoped ? 'wrapper-component' : '')
        }
        style={props.specGptLoader && {top: '18%'}}
      >
        <div className="dots">
          {props.showProcessing ? (
            <p className="dot-processing">Uploading files. For larger files and full projects, this can take as much as 10 minutes.</p>
          ) : (
            ''
          )}
          {props.specGptLoader ? (
            <p className="dot-processing">Documents are being processed, Assistant will be available shortly.</p>
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
