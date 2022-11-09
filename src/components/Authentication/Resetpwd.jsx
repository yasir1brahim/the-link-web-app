import React, { useState } from 'react';
import { ReactComponent as Keys } from '../../assets/images/keys.svg';
import { ReactComponent as Eyeshow } from '../../assets/images/eye-show.svg';
import { ReactComponent as Eyehide } from '../../assets/images/eye-hide.svg';
import { ReactComponent as ArrowLeft } from '../../assets/images/arrow-left.svg';
import { ReactComponent as ReactLogo } from '../../assets/images/logo-white.svg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../config/axios';

const Resetpwd = () => {
  const [showNPwd, setShowNPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [error, setError] = useState('')

  const toggleNType = () => setShowNPwd(!showNPwd);
  const toggleCType = () => setShowCPwd(!showCPwd);

const validate = () => {
    let error = false;

    if (newPassword && newPassword !== confirmedPassword) {
      setError('Password not matched with confirm Passsword.');
      error = true;
    }
    if(newPassword === '') {
      setError('Password is required.');
      error = true;
    }
    if(confirmedPassword === '') {
      setError('Password is required.');
      error = true;
    }
    if ((newPassword && !confirmedPassword) || (confirmedPassword && !newPassword)) {
      setError('Enter both password and confirm password.');
      error = true;
    }
    return error;
  };
  const handleResetPassword = async(e) => {
    e.preventDefault();
    let errors = validate();
    if (!errors) {
    try {
    await axiosInstance({
        method: 'post',
        url: `/reset_password`,
        data: {
          password: newPassword
        },
      });
      toast.success('Password changed successfully.', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      window.location = '/';
    }catch(e) {
      toast.error('Something went wrong.', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }
  }
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
          {/* <p className="form-info">
            Your new password must be different to <br /> previous 3 passwords?
          </p> */}
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
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
              }}
            />
            <div className="iconinput inputpwd" onClick={toggleNType}>
              {showNPwd ? <Eyeshow /> : <Eyehide />}
            </div>
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
              value={confirmedPassword}
              onChange={(e) => {
                setConfirmedPassword(e.target.value);
              }}
            />
            <div className="iconinput inputpwd" onClick={toggleCType}>
              {showCPwd ? <Eyeshow /> : <Eyehide />}
            </div>
            {/* <small className='form-error'>Please enter a Password</small> */}
          </div>
          {error && (
              <small className="form-error" style={{color: 'red'}}>{error}</small>
            )}
          <div className="form-group form-btn">
            <button type="button" className="btn btn-primary w-100" onClick={handleResetPassword}>
              Reset Password
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
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </section>
  );
};

export default Resetpwd;
