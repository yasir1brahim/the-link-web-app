import React, { useState } from 'react';
import { ReactComponent as User } from '../../assets/images/user.svg';
import { ReactComponent as Mail } from '../../assets/images/mail.svg';
import { ReactComponent as Eyeshow } from '../../assets/images/eye-show.svg';
import { ReactComponent as Eyehide } from '../../assets/images/eye-hide.svg';
import axiosInstance from '../../config/axios';
import { ReactComponent as ReactLogo } from '../../assets/images/logo-dark 1.svg';

const SignUp = () => {
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailError, setEmailError] = useState(false);

  const toggleType = () => setShowPwd(!showPwd);
  const handleSubmit = async () => {
    try {
      const response = await axiosInstance({
        method: 'post',
        url: '/register',
        data: {
          username: userName,
          full_name: fullName,
          email_address: email,
          password: password
        }
      });
      if (response.data) {
        if (response.data.message === 'Account already exists !') {
          setEmailError(true);
        } else {
          console.log(response.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="authentication-content-wrapper">
      <div className="ac-left">
        <a href="/" className="company-branding">
          <ReactLogo />
        </a>
      </div>
      <div className="ac-right">
        <form className="signup-form">
          <h1 className="form-heading">Sign Up</h1>
          <p className="form-info">
            Welcome to The Link Requirements Manager. Please sign in if you have
            credentials. If not, please see your administrator.
          </p>
          <div className="form-group">
            <label className="text-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="userName"
              aria-describedby="userName"
              placeholder="User Name"
              required
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            />
            <i className="iconinput inputuser">
              <User />
            </i>
            {/* <small className="form-error">Please enter a Valid Username</small> */}
          </div>
          <div className="form-group">
            <label className="text-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              id="fullName"
              aria-describedby="fullName"
              placeholder="Full Name"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
              }}
            />
            <i className="iconinput inputuser">
              <User />
            </i>
            {/* <small className="form-error">Please enter a Valid Fullname</small> */}
          </div>
          <div className="form-group">
            <label className="text-label">Email</label>
            <input
              type="text"
              className="form-control"
              id="emailId"
              aria-describedby="emailId"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <i className="iconinput inputuser">
              <Mail />
            </i>
            {emailError && (
              <small className="form-error">Email Id already taken!</small>
            )}
          </div>

          <div className="form-group">
            <label className="text-label">Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-control"
              id="password"
              aria-describedby="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <div className="iconinput inputpwd" onClick={toggleType}>
              {showPwd ? <Eyeshow /> : <Eyehide />}
            </div>
            {/* <small className='form-error'>Please enter a correct Password</small> */}
          </div>
          <div className="form-group form-btn">
            <button
              type="submit"
              className="btn btn-primary w-100"
              onSubmit={handleSubmit}
            >
              Sign Up
            </button>
          </div>
          <div className="form-helping-text">
            <p>
              Already have an account? <a href="/login">Login</a>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignUp;
