import React from 'react';

// @ts-ignore
const Header = ({ ...props }) => {
  const breadcrumbText = [];

  return (
    <div className="header-wrapper">
      <div className="header-left">
        <div className="header-breadcrumb-wrapper">
          <div className="breadcrumb-content">
            <a to="/" className="breadcrumb-text">
              Home
            </a>
            <a className="breadcrumb-text">{props.breadcrumb}</a>
          </div>
          <div className="header-content">
            <h1 className="page-title">{props.title}</h1>
          </div>
        </div>
      </div>
      <div className="header-right">
        <button
          type="button"
          className="btn btn-primary"
          onClick={props.toggleModal}
        >
          Create New Customer
        </button>
      </div>
    </div>
  );
};

export default Header;
