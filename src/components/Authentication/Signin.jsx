import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Mail } from '../../assets/images/mail.svg';
import { ReactComponent as Eyeshow } from '../../assets/images/eye-show.svg';
import { ReactComponent as Eyehide } from '../../assets/images/eye-hide.svg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactComponent as ReactLogo } from '../../assets/images/logo-dark-v7.svg';
import { login, getUserTeams, getMicrosoftLoginUrl } from '../../api/Authentication/api'
import { AuthContext } from '../../auth/authcontext';
import { getHomeUrl } from '../../utils/navigation';
import Loader from '../shared/Loader/Loader';



const Signin = (props) => {
  const { setUserDetails, isAuthenticated, user } = useContext(AuthContext);

  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState({ value: '', errors: '' });
  const [password, setPassword] = useState({ value: '', errors: '' });
  const toggleType = () => setShowPwd(!showPwd);
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);

  const validate = () => {
    let error = false;
    if (email.value === '') {
      setEmail({ ...email, errors: 'Email is required.' });
      error = true;
    }
    if (password.value === '') {
      setPassword({ ...password, errors: 'Password is required.' });
      error = true;
    }
    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = validate();
    if (!errors) {  
      setLoading(true); 
      try {
        const response = await login(email.value, password.value);
        console.log(response);
        if (response.data.status === 'success') {
          setUserDetails(response.data.jwt);
          localStorage.setItem('jwt', response.data.jwt);
          await getHomeUrl(e, true, user, getUserTeams, navigate);
        }
      } catch (error) {
        console.log("Error in handleSubmit", error);
        if (error.response && error.response.status === 400) {
          toast.error('Incorrect email or password');
        } else {
          toast.error(`Error: ${error.response.statusText}`);
        }
      } finally {
        setLoading(false); 
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
          <div className="form-group">
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </div>
          <div className="form-group">
            <button 
              type="button" 
              className="btn btn-secondary w-100 mt-2" 
              onClick={(e) => {
                e.preventDefault();
                console.log('Navigating to SSO with email:', email.value);
                navigate('/login/sso', { 
                  state: { user_email: email.value },
                  replace: false 
                });
              }}
            >
              Login with SSO
            </button>
          </div>
          <div className="form-helping-text">
            <p>
              Don't have credentials?
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
      <Loader showComponentLoader={isLoading} />
    </section>
  );
};

export default Signin;
