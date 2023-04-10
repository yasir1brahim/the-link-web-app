import React from 'react';
import { useNavigate } from 'react-router-dom';

// @ts-ignore
const Header = ({ ...props }) => {
  const navigate = useNavigate();

  return (
    <div className="header-wrapper">
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
                  props.breadcrumb3 ? navigate(-2) : navigate(-1)
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
      {props.showBtn ? (
        <div className="header-right">
          {props?.centerText ? <div className='header-docs-uploaded breadcrumb-text project-type'>{props?.centerText}</div> : ''}
          {props?.docParsed ? <div className='header-docs-uploaded breadcrumb-text'>Docs uploaded : {props?.docParsed}</div> : ''}
          <button
            type="button"
            className={`btn btn-primary ${props.btnSize === 'small' ? 'btn-small' : ''}`}
            onClick={props.toggleModal}
          >
            {props.showBtn}
          </button>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default Header;
