/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../config/axios";
import { Tooltip } from "@mui/material";

// @ts-ignore
const Header = ({ ...props }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectDetails = searchParams.get("projectDetails")?.split(",");
  const projectId = projectDetails?.length ? JSON.parse(projectDetails[0]) : null;
  const customerId = projectDetails?.length >= 2 ? JSON.parse(projectDetails[1]) : null;
  const logType = projectDetails?.length >= 3 ? projectDetails[2] : null;

  const [docsLoaded, setDocsLoaded] = useState(true);
  const specGptUser = localStorage.getItem("isSpecGptUser") === "true";

  const checkDocsStatus = async () => {
    if ((props.breadcrumb2 === "Requrement Logs" || props.breadcrumb2 === "Collab Hub" || props.breadcrumb2 === "Spec GPT") && !specGptUser) {
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

  const handleNavRedirect = (redirectTo) => {
    const redirectUrl = {
      logs: `/project-logs?projectDetails=${projectId},${customerId},${logType},${searchParams.get("projectName") || props?.title}`,
      collab: `/collaboration-hub?projectDetails=${projectId},${customerId},${logType},${searchParams.get("projectName") || props?.title}`,
      specGpt: `/spec-gpt?projectDetails=${projectId},${customerId},${logType},${searchParams.get("projectName") || props?.title}`,
    };
    navigate(redirectUrl[redirectTo]);
  };

  return (
    <>
    <div className={props.breadcrumb === "Collaboration Hub" ? "header-wrapper collab-wrapper" : "header-wrapper-swap"}>
      <div className="header-swap">
        <div className="main-wrapper">
          <div className="breadcrumb-wrap">
            <a href={localStorage.getItem("roleId") === "0" ? "/admin-landing" : "/project-list"} className="main-link">
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
    
    {props.navBtn && (
        <div className={`header-center`} style={localStorage.getItem("roleId") === "7" ? { width: "58%", justifyContent: "initial" } : { width: "100%" }}>
          <button
            type="button"
            className={`btn-normal ${props.navBtn !== "logs" ? "" : "btn-active"} ${props.btnSize === "small" ? "btn-small" : ""}`}
            onClick={() => (props.navBtn !== "logs" ? handleNavRedirect("logs") : null)}
            disabled={specGptUser}
          >
            Submittal Log
          </button>
          <button
            type="button"
            className={`btn-normal ${props.navBtn !== "collab" ? "" : "btn-active"} ${props.btnSize === "small" ? "btn-small" : ""}`}
            onClick={() => (props.navBtn !== "collab" ? handleNavRedirect("collab") : null)}
            disabled={specGptUser}
          >
            Collab Hub
          </button>
          <Tooltip disableHoverListener={docsLoaded} title={<span style={{ fontSize: "14px" }}>Documents are being processed, SpecGPT will be available shortly</span>} placement="right-end" arrow>
            <button
              type="button"
              className={`btn-normal spec-btn-disabled ${props.navBtn !== "specGpt" ? "" : "btn-active"} ${props.btnSize === "small" ? "btn-small" : ""}`}
              style={props.navBtn === "collab" ? { marginLeft: "4px" } : { marginLeft: "0" }}
              onClick={() => (props.navBtn !== "specGpt" ? handleNavRedirect("specGpt") : null)}
              disabled={!docsLoaded}
            >
              {/* <a
                href="https://specgpt.ai/chat"
                target="_blank"
                rel="noreferrer"
              > */}
              Spec GPT
              {/* </a> */}
            </button>
          </Tooltip>
        </div>
      )}
    </>
    
  );
};

export default Header;
