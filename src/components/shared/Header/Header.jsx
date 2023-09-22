import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// @ts-ignore
const Header = ({ ...props }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectDetails = searchParams.get('projectDetails')?.split(',');
  const projectId = projectDetails?.length
    ? JSON.parse(projectDetails[0])
    : null;
  const customerId =
    projectDetails?.length >= 2 ? JSON.parse(projectDetails[1]) : null;
  const logType = projectDetails?.length >= 3 ? projectDetails[2] : null;

  const handleNavRedirect = (redirectFrom) => {
    navigate(
      `/${
        redirectFrom === 'collab' ? `project-logs` : `collaboration-hub`
      }?projectDetails=${projectId},${customerId},${logType}&projectName=${
        searchParams.get('projectName') || props?.title
      }`
    );
  };

  return (
    <div
      className={
        props.breadcrumb === 'Collaboration Hub'
          ? 'header-wrapper collab-wrapper'
          : 'header-wrapper'
      }
    >
      <div className="header-left">
        <div className="header-breadcrumb-wrapper">
          <div className="breadcrumb-content">
            <a
              href={
                localStorage.getItem('roleId') === '0'
                  ? '/admin-landing'
                  : '/project-list'
              }
              className="breadcrumb-text"
            >
              Home
            </a>
            {props.breadcrumb && (
              <a
                href={() => false}
                onClick={() =>
                  props.breadcrumb3 && localStorage.getItem('roleId') === '0'
                    ? navigate(-2)
                    : navigate(-1)
                }
                className="breadcrumb-text"
                style={{ cursor: 'pointer' }}
              >
                {props.breadcrumb}
              </a>
            )}
            {props.breadcrumb2 && (
              <a
                href={() => false}
                onClick={() => navigate(-1)}
                className="breadcrumb-text"
                style={{ cursor: 'pointer' }}
              >
                {props.breadcrumb2}
              </a>
            )}
            {props.breadcrumb3 && (
              <a
                href={() => false}
                onClick={() => navigate(-1)}
                className="breadcrumb-text"
                style={{ cursor: 'pointer' }}
              >
                {props.breadcrumb3}
              </a>
            )}
            {/* <div className="breadcrumb-text">{props.title}</div> */}
          </div>
          <div className="header-content">
            <h1 className="page-title">{props.title}</h1>
          </div>
        </div>
      </div>
      {/* {props.centerText ? <div className='header-center header-content'>
      <h1 className="page-title">{props.centerText?.toUpperCase()}</h1>
      </div> : ''} */}
      {props.navBtn && (
        <div
          className={`header-center`}
          style={
            localStorage.getItem('roleId') === '7'
              ? { width: '58%', justifyContent: 'initial' }
              : { width: '34%' }
          }
        >
          <button
            type="button"
            className={`btn btn-primary ${
              props.navBtn !== 'logs' ? 'btn-white' : 'btn-margin-right'
            } ${props.btnSize === 'small' ? 'btn-small' : ''}`}
            onClick={() =>
              props.navBtn !== 'logs' ? handleNavRedirect('collab') : null
            }
          >
            Submittal Log
          </button>
          <button
            type="button"
            className={`btn btn-primary ${
              props.navBtn !== 'collab' ? 'btn-white' : ''
            } ${props.btnSize === 'small' ? 'btn-small' : ''}`}
            onClick={() =>
              props.navBtn !== 'collab' ? handleNavRedirect('logs') : null
            }
          >
            Collab Hub
          </button>
          {!window.location.href.includes('app.thelink.ai') ? (
            <button
              type="button"
              className={`btn btn-primary btn-white ${
                props.btnSize === 'small' ? 'btn-small' : ''
              }`}
              style={
                props.navBtn === 'collab'
                  ? { marginLeft: '4px' }
                  : { marginLeft: '0' }
              }
            >
              <a
                href="https://specgpt.ai/chat"
                target="_blank"
                rel="noreferrer"
              >
                Spec GPT <span style={{ fontSize: '9px' }}>Beta</span>
              </a>
            </button>
          ) : null}
        </div>
      )}
      {props.showBtn && localStorage.getItem('roleId') !== '7' ? (
        <div className="header-right">
          {props?.centerText ? (
            <div className="header-docs-uploaded breadcrumb-text project-type">
              {props?.centerText}
            </div>
          ) : (
            ''
          )}
          {props?.docParsed ? (
            <div className="header-docs-uploaded breadcrumb-text">
              Docs uploaded : {props?.docParsed}
            </div>
          ) : (
            ''
          )}
          {!props?.qaDashboard && (
            <button
              type="button"
              className={`btn btn-primary ${
                props.btnSize === 'small' ? 'btn-small' : ''
              } accent-btn`}
              onClick={props.toggleModal}
              // style={{backgroundColor: 'rgb(213, 232, 62)', border: 'none', color: '#202a44 !important'}}
            >
              {props.showBtn}
            </button>
          )}
        </div>
      ) : (
        ''
      )}
      {props?.goBack && (
        <div className="header-right">
          <button
            type="button"
            className={`btn btn-primary ${
              props.btnSize === 'small' ? 'btn-small' : ''
            } accent-btn`}
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
