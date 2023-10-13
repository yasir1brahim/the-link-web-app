import React from 'react';
import { ReactComponent as Mail } from '../../assets/images/mail.svg';
import { ReactComponent as ArrowLeft } from '../../assets/images/arrow-left.svg';
import { ReactComponent as ReactLogo } from '../../assets/images/logo-dark-v7.svg';

const Checkemail = () => {
  return (
    <section className="authentication-content-wrapper">
      <div className="ac-left">
        <a href="/" className="company-branding">
          <ReactLogo />
        </a>
      </div>
      <div className="ac-right">
        <form className="forgot-form">
          <span className="iconheading">
            <Mail />
          </span>
          <h1 className="form-heading heading-two">Check your email</h1>
          <p className="form-info">
            We have sent a password reset link to
            <br />
            {/* <b>mohanrj@designer.com</b> */}
            your email address.
          </p>
          {/* <div className="form-helping-text">
            <p>
              Din’t receive the email? <a href="#;">Click to resend</a>
            </p>
          </div> */}
          <div className="form-helping-text">
            <a
              className="d-flex align-items-center justify-content-center"
              href="/login"
            >
              <ArrowLeft />
              Back to log in
            </a>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Checkemail;
