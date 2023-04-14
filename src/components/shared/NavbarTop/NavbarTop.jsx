import React, { useEffect, useRef, useState } from "react";
import { ReactComponent as Logo } from "../../../assets/images/logo-white.svg";
import { ReactComponent as Down } from "../../../assets/images/chevron-bottom.svg";
// import { ReactComponent as Notification } from '../../../assets/images/notificat.svg';
import { Navbar, Nav, NavItem, NavLink } from "reactstrap";
const NavbarTop = (props) => {
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });
  // Click Outside code ends

  return (
    <section className="navigation-wrapper d-flex align-items-center justify-content-center">
      <Navbar
        className="navigation justify-content-center justify-content-md-start"
        expand="sm"
      >
        <a
          href={
            localStorage.getItem("roleId") === "0"
              ? "/admin-landing"
              : "/project-list"
          }
          className="navbar-brand"
        >
          <Logo />
        </a>
        {window.location.href.includes("project-logs") && (
          <Nav className="ml-auto" navbar>
            <NavItem>
              <span
                style={{
                  color: "white",
                  fontSize: "25px",
                  fontWeight: 600,
                }}
              >
                {props?.qaDashboard ? 'QA Dashboard' : 'Submittal Log'}
              </span>
            </NavItem>
          </Nav>
        )}
        <Nav className="ml-auto" navbar>
          {/* <NavItem>
            <NavLink className="notification-wrapper">
              <Notification />
              <small className="notification-count">3</small>
            </NavLink>
          </NavItem> */}
          <NavItem>
            <NavLink
              className={"user-wrapper " + (navDrop ? "navdrop-open" : "")}
              // href="/"
              onClick={toggleDrop}
            >
              <span className="user-icon">
                {localStorage.getItem("fullName")?.charAt(0) || (
                  <i className="fa fa-user"></i>
                )}
              </span>
              <span className="user-name">
                {localStorage.getItem("fullName")}
              </span>
              <Down />
            </NavLink>
            {navDrop ? (
              <div className="nav-dropdown" ref={ref}>
                {localStorage.getItem("roleId") === "0" && !window.location.pathname.includes('admin-user') && (
                  <a
                    href="/admin-user"
                    className="navlist"
                    onClick={toggleDrop}
                  >
                    View Admin Portal
                  </a>
                )}
                {localStorage.getItem("roleId") === "2" && (
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
              ""
            )}
          </NavItem>
        </Nav>
      </Navbar>
    </section>
  );
};

export default NavbarTop;
