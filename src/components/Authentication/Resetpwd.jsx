import React, { useState } from 'react';
import { ReactComponent as Keys } from '../../assets/images/keys.svg';
import { ReactComponent as Eyeshow } from '../../assets/images/eye-show.svg';
import { ReactComponent as Eyehide } from '../../assets/images/eye-hide.svg';
import { ReactComponent as ArrowLeft } from '../../assets/images/arrow-left.svg';
import { ReactComponent as ReactLogo } from '../../assets/images/logo.svg';

const Resetpwd = () => {
  const [showNPwd, setShowNPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);

  const toggleNType = () => setShowNPwd(!showNPwd);
  const toggleCType = () => setShowCPwd(!showCPwd);

  return (
    <section className="authentication-content-wrapper">
      <div className="ac-left">
        <a href="/" className="company-branding">
          <ReactLogo />
        </a>
      </div>
      <div className="ac-right">
        <form className="resetpwd-form">
          <span className="iconheading">
            <Keys />
          </span>
          <h1 className="form-heading heading-two">Set New Password</h1>
          <p className="form-info">
            Your new password must be different to <br /> previous 3 passwords?
          </p>
          <div className="form-group">
            <label className="text-label" for="newPassword">
              New Password
            </label>
            <input
              type={showNPwd ? 'text' : 'password'}
              className="form-control"
              id="newPassword"
              aria-describedby="newPassword"
              placeholder="Enter New Password"
              required
            />
            <a className="iconinput inputpwd" href="/" onClick={toggleNType}>
              {showNPwd ? <Eyeshow /> : <Eyehide />}
            </a>
            {/* <small className='form-error'>Please enter a Password</small> */}
          </div>
          <div className="form-group">
            <label className="text-label" for="cNewPassword">
              Confirm New Password
            </label>
            <input
              type={showCPwd ? 'text' : 'password'}
              className="form-control"
              id="cNewPassword"
              aria-describedby="cNewPassword"
              placeholder="Confirm New Password"
              required
            />
            <a className="iconinput inputpwd" href="/" onClick={toggleCType}>
              {showCPwd ? <Eyeshow /> : <Eyehide />}
            </a>
            {/* <small className='form-error'>Please enter a Password</small> */}
          </div>
          <div className="form-group form-btn">
            <button type="button" className="btn btn-primary w-100">
              Confirm new password
            </button>
          </div>
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

export default Resetpwd;
