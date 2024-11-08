/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../config/axios";
import { Tooltip } from "@mui/material";
import {AuthContext} from '../../../auth/authcontext'
import { getUserTeams } from "../../../api/Authentication/api";
import { getHomeUrl } from "../../../utils/navigation";

// @ts-ignore
const Header = ({ ...props }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectDetails = searchParams.get("projectDetails")?.split(",");
  const projectId = projectDetails?.length ? JSON.parse(projectDetails[0]) : null;

  const [docsLoaded, setDocsLoaded] = useState(true);
  const specGptUser = localStorage.getItem("isSpecGptUser") === "true";

  const { user, isAuthenticated } = useContext(AuthContext);
  
  const checkDocsStatus = async () => {
    if ((props.breadcrumb2 === "Submittal Log" || props.breadcrumb2 === "Collab Hub" || props.breadcrumb2 === "Spec GPT") && !specGptUser) {
      try {
        const response = await axiosInstance({
          method: "get",
          url: "/spec-gpt/docsIndexed",
          params: {
            project_id: projectId,
          },
        });
        const { docsIndexed } = response.data;
        setDocsLoaded(docsIndexed);
      } catch (error) {
        console.error("Error checking docs status:", error);
      }
    }
  };

  useEffect(() => {
    // Initial check
    checkDocsStatus();

    // Set up interval to check docs status every 10 seconds (adjust as needed)
    const intervalId = setInterval(() => {
      checkDocsStatus();
    }, 120000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
    <div className="header-wrapper-swap">
      <div className="header-swap">
        <div className="main-wrapper">
          <div className="breadcrumb-wrap">
            <a href="#" onClick={(e) => getHomeUrl(e, isAuthenticated, user, getUserTeams, navigate)} className="main-link">
              Home
            </a>
            {props.breadcrumb && (
              <>
                <span className="main-link">/</span>
                <a onClick={() => navigate(props.breadcrumbUrl)} className="active-link" style={{ cursor: "pointer" }}>
                  {props.breadcrumb}
                </a>
              </>
            )}
            {props.breadcrumb2 && (
              <>
                <span className="main-link">/</span>
                <a onClick={() => navigate(-1)} className="active-link" style={{ cursor: "pointer" }}>
                  {props.breadcrumb2}
                </a>
              </>
            )}
            {props.breadcrumb3 && (
              <>
                <span className="main-link">/</span>
                <a onClick={() => navigate(-1)} className="active-link" style={{ cursor: "pointer" }}>
                  {props.breadcrumb3}
                </a>
              </>
            )}
            {/* <div className="breadcrumb-text">{props.title}</div> */}
          </div>
          <div className="title-wrap">
            <h1 className="title-content">{props.title ?? "All Projects"}</h1>
          </div>
        </div>
      </div>
      {/* {props.centerText ? <div className='header-center header-content'>
      <h1 className="page-title">{props.centerText?.toUpperCase()}</h1>
      </div> : ''} */}
      
      {props.showBtn && localStorage.getItem("roleId") !== "7" ? (
        <div className="header-right-swap header-right">
          {/* {props?.centerText ? <div className="header-docs-uploaded breadcrumb-text project-type">{props?.centerText}</div> : ""} */}
            {props?.docParsed ? <div className="header-docs-uploaded breadcrumb-text">{props?.docParsed} document{props?.docParsed > 1 ? 's' : ''} uploaded </div> : ""}
            < div className="divider" />
          {props.navBtn !== "specGpt" && (
            <button
              type="button"
              className={`light-btn ${props.btnSize === "small" ? "btn-small" : ""} `}
              onClick={props.toggleModal}
              // style={{backgroundColor: 'rgb(213, 232, 62)', border: 'none', color: '#202a44 !important'}}
            >
              <span className="">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3.33325V16.6666M16.6667 9.99992L3.33337 9.99992" stroke="#0E2332" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>

              {props.showBtn}
            </button>
          )}
        </div>
      ) : (
        ""
      )}
      {props?.goBack && (
        <div className="header-right">
          <button type="button" className={`btn btn-primary ${props.btnSize === "small" ? "btn-small" : ""} accent-btn`} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      )}
    </div>
    
    <div className="header-center pt-0">
    </div>
    </>
  );
};

export default Header;
