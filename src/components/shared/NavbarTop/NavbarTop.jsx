import React, { useState } from "react";
import {ReactComponent as Logo} from "../../../assets/images/logo.svg";
import {ReactComponent as Down} from "../../../assets/images/chevron-bottom.svg";
import {ReactComponent as Notification} from "../../../assets/images/notificat.svg";
import { Navbar, Nav, NavItem, NavLink } from "reactstrap";
import { Link } from "react-router-dom";

const NavbarTop = () => {
  const [navDrop, setNavDrop] = useState(false);

  const toggleDrop = () => setNavDrop(!navDrop);

  return (
    <section className="navigation-wrapper d-flex align-items-center justify-content-center">
      <Navbar
        className="navigation justify-content-center justify-content-md-start"
        expand="sm"
      >
        <a href="/" className="navbar-brand">
          <Logo />
        </a>
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink className="notification-wrapper" href="#">
              <Notification/>
              <small className="notification-count">3</small>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink className={'user-wrapper '+ (navDrop?'navdrop-open':'')} href="#" onClick={toggleDrop}>
              <span className="user-icon">
                <i className="fa fa-user"></i>
              </span>
              <span className="user-name">Admin</span>
              <Down />
            </NavLink>
            {(navDrop ?
              <div className="nav-dropdown">
                <a href="javascript:void(0);" className="navlist" onClick={toggleDrop}>View Company Profile</a>
                <a href="javascript:void(0);" className="navlist list-logout" onClick={toggleDrop}>Logout</a>
              </div>:''
            )}
          </NavItem>
        </Nav>
      </Navbar>
    </section>
  );
};

export default NavbarTop;
