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
            <a href="/admin-landing" className="breadcrumb-text">
              Home /
            </a>
            {props.breadcrumb && (
              <div
                onClick={() =>
                  props.breadcrumb2 ? navigate(-2) : navigate(-1)
                }
                className="breadcrumb-text"
              >
                {props.breadcrumb}
              </div>
            )}
            {props.breadcrumb2 && (
              <div onClick={() => navigate(-1)} className="breadcrumb-text">
                {props.breadcrumb2}
              </div>
            )}
            {/* <div className="breadcrumb-text">{props.title}</div> */}
          </div>
          <div className="header-content">
            <h1 className="page-title">{props.title}</h1>
          </div>
        </div>
      </div>
      {props.showBtn ? (
        <div className="header-right">
          <button
            type="button"
            className="btn btn-primary"
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
