import React, { useState } from "react";
import ologo from "../../../assets/images/logo.png";
import notification from "../../../assets/images/notification.svg";
import logout from "../../../assets/images/logout.svg";
import { Navbar, Nav, NavItem, NavLink } from "reactstrap";
import { Link } from "react-router-dom";

const NavbarTop = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="navigation-wrapper d-flex align-items-center justify-content-center">
      <Navbar
        className="navigation justify-content-center justify-content-md-start"
        expand="sm"
      >
        <a href="/" className="navbar-brand">
          <img src={ologo} alt="logo" />
        </a>
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink className="notification-wrapper" href="#">
              {/* <Notification/> */}
              <img src={notification} alt="Notification" />
              <small className="notification-count">3</small>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink className="user-wrapper" href="#">
              <span className="user-icon">
                <i className="fa fa-user"></i>
              </span>
              <span className="user-name">John Villy</span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink className="logout-wrapper d-flex" href="#">
              <img src={logout} alt="Logout" />
            </NavLink>
          </NavItem>
        </Nav>
      </Navbar>
    </section>
  );
};

export default NavbarTop;
