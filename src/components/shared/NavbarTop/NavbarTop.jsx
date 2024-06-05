import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as Logo } from '../../../assets/images/logo-dark-v7.svg';
import { ReactComponent as Down } from '../../../assets/images/chevron-bottom.svg';
// import { ReactComponent as Notification } from '../../../assets/images/notificat.svg';
import { Navbar, Nav, NavItem, NavLink } from 'reactstrap';
const NavbarTop = () => {
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

  return (
    <section className="navigation-wrapper d-flex align-items-center justify-content-center">
      <Navbar
        className="navigation justify-content-center justify-content-md-start"
        expand="sm"
      >
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
        <Nav className="ml-auto" navbar>
          {/* <NavItem>
            <NavLink className="notification-wrapper">
              <Notification />
              <small className="notification-count">3</small>
            </NavLink>
          </NavItem> */}
          <NavItem>
            <NavLink
              className={'user-wrapper ' + (navDrop ? 'navdrop-open' : '')}
              // href="/"
              onClick={toggleDrop}
            >
              <span className="user-icon">
                {generateInitials(localStorage.getItem('fullName')) || (
                  <i className="fa fa-user"></i>
                )}
              </span>
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
                  onClick={toggleDrop}
                >
                  Logout
                </a>
              </div>
            ) : (
              ''
            )}
          </NavItem>
        </Nav>
      </Navbar>
    </section>
  );
};

export default NavbarTop;
