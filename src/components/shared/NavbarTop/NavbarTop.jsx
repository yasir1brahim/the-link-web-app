import React, { useEffect, useRef, useState, useContext } from 'react';
import { ReactComponent as Logo } from '../../../assets/images/logo-dark-v7.svg';
import { ReactComponent as Down } from '../../../assets/images/chevron-bottom.svg';
import HelpOutlineSharpIcon from '@mui/icons-material/HelpOutlineSharp';
// import { ReactComponent as Notification } from '../../../assets/images/notificat.svg';
import { Navbar, Nav, NavItem, NavLink } from 'reactstrap';
import { CircularProgress } from "@mui/material";
import {AuthContext} from '../../../auth/authcontext'
import { getUserTeams } from '../../../api/Authentication/api';
import { getHomeUrl } from '../../../utils/navigation';
import { useNavigate } from 'react-router-dom';

const NavbarTop = ({...props}) => {
  const [navDrop, setNavDrop] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

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
          <a href="#" onClick={(e) => getHomeUrl(e, isAuthenticated, user, getUserTeams, navigate)} className="navbar-brand">
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
              <h1 className="title-content">{props.projectTitle}</h1>
            </div>
          </div>
          <div className='col-4 d-flex justify-content-end'>
            <Nav navbar>
              <NavItem>
                <NavLink className="support" href="mailto:support@thelink.zendesk.com">
                  <HelpOutlineSharpIcon sx={{ color: '#d5e642', fontSize: '28px' }} />
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
                    {user?.is_superuser &&
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
