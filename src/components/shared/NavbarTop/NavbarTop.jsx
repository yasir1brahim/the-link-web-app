import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as Logo } from '../../../assets/images/logo-dark-v7.svg';
import { ReactComponent as Down } from '../../../assets/images/chevron-bottom.svg';
// import { ReactComponent as Notification } from '../../../assets/images/notificat.svg';
import { Navbar, Nav, NavItem, NavLink } from 'reactstrap';
import { CircularProgress } from "@mui/material";

const NavbarTop = ({...props}) => {
  const [navDrop, setNavDrop] = useState(false);

  const toggleDrop = () => {
    setNavDrop(!navDrop);
  };

  // Click Outside code
  const ref = useRef();
  const handleClickOutside = (e) => {
    if (!ref.current?.contains(e.target)) {
      setNavDrop(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });
  // Click Outside code ends

  const generateInitials = (name) => {
    // Split the name into words
    const words = name.split(" ");
    const initials = words
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2);

    return initials.toUpperCase();
  }

  const isOnProjectPage = window.location.pathname.includes('project-logs');

  const handleLogout = () => {
    localStorage.clear();
    setNavDrop(!navDrop);
  }
  return (
    <section className="navigation-wrapper d-flex align-items-center justify-content-center">
      <Navbar
        className="navigation justify-content-center justify-content-md-start"
        expand="sm"
      >
        <div className='row w-100 m-0'>
          <div className='col-4 d-flex'>
            <a
            href={
              localStorage.getItem('roleId') === '0'
                ? '/admin-landing'
                : '/project-list'
            }
            className="navbar-brand"
          >
            <Logo />
          </a>
          {props?.customerData &&
            <div className="cust-name d-flex justify-content-center">
              <div className="title-wrap">
                <h1 className="title-content">{props?.customerData['customer_name']}</h1>
              </div>
            </div>
          }
          </div>
          <div className='col-4 text-center d-flex justify-content-center'>
            <div className="title-wrap">
              {isOnProjectPage && <div className="title-label">Project Name</div>}
              {isOnProjectPage && <h1 className="title-content">{props.projectTitle}</h1>}
            </div>
          </div>
          <div className='col-4 d-flex justify-content-end'>
            <Nav navbar>
              <NavItem>
                <NavLink className="support" href="mailto:support@thelink.zendesk.com">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9.25" stroke="white" stroke-width="1.5"/>
                    <path d="M9 9.71429C9.03125 8.91156 9.30357 8.26531 9.81696 7.77551C10.3616 7.2585 11.1027 7 12.0402 7C12.9152 7 13.6295 7.2381 14.183 7.71429C14.7277 8.18594 15 8.78912 15 9.52381C15 10.5079 14.5312 11.2857 13.5938 11.8571C13.1652 12.1156 12.8728 12.356 12.7165 12.5782C12.5603 12.7959 12.4821 13.0816 12.4821 13.4354V13.8503H11.096L11.0893 13.3061C11.058 12.4308 11.4888 11.7211 12.3817 11.1769C12.7924 10.9274 13.0759 10.6871 13.2321 10.4558C13.3973 10.2245 13.4799 9.93424 13.4799 9.58503C13.4799 9.19501 13.3415 8.87755 13.0647 8.63265C12.7879 8.37868 12.4219 8.2517 11.9665 8.2517C11.5067 8.2517 11.1362 8.38322 10.8549 8.64626C10.5737 8.9093 10.4174 9.26531 10.3862 9.71429H9ZM11.7991 17C11.5536 17 11.346 16.9161 11.1763 16.7483C11.0067 16.5805 10.9219 16.3719 10.9219 16.1224C10.9219 15.873 11.0067 15.6644 11.1763 15.4966C11.346 15.3288 11.5536 15.2449 11.7991 15.2449C12.0491 15.2449 12.2589 15.3288 12.4286 15.4966C12.5982 15.6644 12.683 15.873 12.683 16.1224C12.683 16.3719 12.5982 16.5805 12.4286 16.7483C12.2589 16.9161 12.0491 17 11.7991 17Z" fill="white"/>
                  </svg>
                </NavLink>
                <NavLink
                  className={'user-wrapper ' + (navDrop ? 'navdrop-open' : '')}
                  // href="/"
                  onClick={toggleDrop}
                >
                  {localStorage.getItem('fullName') && <span className="user-icon">
                    {generateInitials(localStorage.getItem('fullName')) || (
                      <i className="fa fa-user"></i>
                    )}
                  </span>}
                  <span className="user-name">
                    {localStorage.getItem('fullName')}
                  </span>
                  <Down />
                </NavLink>
                {navDrop ? (
                  <div className="nav-dropdown" ref={ref}>
                    {localStorage.getItem('roleId') === '0' &&
                      !window.location.pathname.includes('admin-user') && (
                      <a
                        href="/admin-user"
                        className="navlist"
                        onClick={toggleDrop}
                      >
                        View Admin Portal
                      </a>
                    )}
                    {localStorage.getItem("roleId") !== "7" &&
                      props.handleManageProcoreButtonClick && (
                      <div
                        className="navlist flex"
                        onClick={props.handleManageProcoreButtonClick}
                        disabled={props.initLoading || props.loadingProjectDetails}
                      >
                        <div>Manage Procore Integration</div>
                        {(props.initLoading || props.loadingProjectDetails) && <CircularProgress size={12} />}
                      </div>
                    )}
                    {props.handleManageExcelExportButtonClick && (
                      <div
                        className="navlist"
                        onClick={props.handleManageExcelExportButtonClick}
                      >
                        <div>Manage Excel Export</div>
                      </div>
                    )}
                    {localStorage.getItem('roleId') === '2' && (
                      <a
                        href="/customer-profile"
                        className="navlist"
                        onClick={toggleDrop}
                      >
                        View Company Profile
                      </a>
                    )}
                    <a
                      href="/"
                      className="navlist list-logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </a>
                  </div>
                ) : (
                  ''
                )}
              </NavItem>
            </Nav>
          </div>
        </div>
      </Navbar>
    </section>
  );
};

export default NavbarTop;
