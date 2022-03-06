import React from "react";
import back from "../../../assets/images/back.svg";
import { Link } from "react-router-dom";

// @ts-ignore
const Header = ({ ...props }) => {
  const breadcrumbText = [];

  return (
    <div className="header-wrapper">
      <div className="header-left">
        <div className="header-back-wrapper">
          <Link className="header-back" to="/">
            <img src={back} alt="back" />
          </Link>
        </div>
        <div className="header-breadcrumb-wrapper">
          <div className="breadcrumb-content">
            <Link to="/" className="breadcrumb-text">
              Home
            </Link>
            <a className="breadcrumb-text">{props.breadcrumb}</a>
          </div>
          <div className="header-content">
            <h1 className="page-title">{props.title}</h1>
          </div>
        </div>
      </div>
      {props.showStatusSection && (
        <div className="header-center">
          <ul className="timecard-legends">
            <li className="timecard-legend">
              <a href="" className="legend-item item-all">
                <span className="legend-name">All</span>
              </a>
            </li>
            <li className="timecard-legend">
              <a href="" className="legend-item item-open">
                <span className="legend-name">Open</span>
              </a>
            </li>
            <li className="timecard-legend">
              <a href="" className="legend-item item-submitted">
                <span className="legend-name">Submitted</span>
              </a>
            </li>
            <li className="timecard-legend">
              <a href="" className="legend-item item-rejected">
                <span className="legend-name">Rejected</span>
              </a>
            </li>
            <li className="timecard-legend legend-active">
              <a href="" className="legend-item item-approved">
                <span className="legend-name">Approved</span>
              </a>
            </li>
            <li className="timecard-legend">
              <a href="" className="legend-item item-exported">
                <span className="legend-name">Exported</span>
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Header;
