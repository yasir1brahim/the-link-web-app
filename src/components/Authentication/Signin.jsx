import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Mail } from '../../assets/images/mail.svg';
import { ReactComponent as Eyeshow } from '../../assets/images/eye-show.svg';
import { ReactComponent as Eyehide } from '../../assets/images/eye-hide.svg';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactComponent as ReactLogo } from '../../assets/images/logo-dark-v7.svg';
import { login } from '../../api/Authentication/api'
const Signin = (props) => {
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState({ value: '', errors: '' });
  const [password, setPassword] = useState({ value: '', errors: '' });
  const toggleType = () => setShowPwd(!showPwd);
  const history = useNavigate();

  const validate = () => {
    let error = false;
    if (email.value === '') {
      setEmail({ ...email, errors: 'Email is required.' });
      error = true;
    }
    if (password.value === '') {
      setPassword({ ...password, errors: 'Password is reuired.' });
      error = true;
    }
    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = validate();
    if (!errors) {
      const response = await login(email.value,password.value);
      if (response.data) {
        window.heap.identify(email.value);
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('roleId', response.data.role_id);
        localStorage.setItem('userId', response.data.user_id);
        localStorage.setItem('fullName', response.data.full_name);
        localStorage.setItem('isSpecGptUser', response.data.is_gpt_user);
        return response.data.role_id === 0
            ? history({ pathname: '/admin-landing' })
            : response.data.role_id === 2 ||
            response.data.role_id === 6 ||
            response.data.role_id === 7
                ? history({ pathname: '/project-list' })
                : history({ pathname: '/' });
      }
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
        <form className="login-form" onSubmit={handleSubmit}>
          <h1 className="form-heading">Hello!</h1>
          <p className="form-info">
            Welcome to The Link Submittal Log Manager. Please sign in if you have
            credentials. If not, please see your administrator.
          </p>
          <div className="form-group">
            <label className="text-label">Email</label>
            <input
              type="text"
              className="form-control"
              id="emailId"
              aria-describedby="emailId"
              placeholder="Email Address"
              required
              value={email.value}
              onChange={(e) => {
                setEmail({ ...email, value: e.target.value });
              }}
            />
            <i className="iconinput inputuser">
              <Mail />
            </i>
            {email.errors && (
              <small className="form-error">{email.errors}</small>
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
              value={password.value}
              onChange={(e) => {
                setPassword({ ...password, value: e.target.value });
              }}
            />
            <div className="iconinput inputpwd" onClick={toggleType}>
              {showPwd ? <Eyeshow /> : <Eyehide />}
            </div>
            {password.errors && (
              <small className="form-error">{password.errors}</small>
            )}
          </div>
          <div className="form-group forgot-pwd">
            <div>
            </div>
            <a className="forgot-pwd" href="/forgot-password">
              Forgot Password?
            </a>
          </div>
          <div className="form-group form-btn">
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </div>
          <div className="form-helping-text">
            <p>
              Don’t have credentials?
              <br />
              Ask your administrator, or email{' '}
              <a href="mailto:support@thelink.ai">support@thelink.ai</a>
            </p>
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

export default Signin;
