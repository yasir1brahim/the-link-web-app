import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactComponent as ReactLogo } from '../../assets/images/the-link-ai-header-logo-new.svg';
import { getMicrosoftLoginUrl } from '../../api/Authentication/api';
import Loader from '../shared/Loader/Loader';

const SSODisambiguationPage = () => {
  const location = useLocation();
  const [userEmail, setUserEmail] = useState({ value: location.state?.user_email || '', errors: '' });
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Location state:', location.state);
    console.log('User email from state:', location.state?.user_email);
  }, [location]);

  const validate = () => {
    if (userEmail.value === '') {
      setUserEmail({ ...userEmail, errors: 'User email is required.' });
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = validate();
    
    if (!hasErrors) {
      setLoading(true);
      try {
        const response = await getMicrosoftLoginUrl(userEmail.value);
        window.location.href = response.data.auth_url;
      } catch (error) {
        console.error("Error in SSO login:", error);
        if (error.response) {
          toast.error(`Error: ${error.response.data.error || error.response.statusText}`);
        } else {
          toast.error('An error occurred while trying to log in with SSO');
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
        <form className="login-form">
          <h1 className="form-heading">SSO Login</h1>
          <p className="form-info">
            Please enter your email address to continue with Single Sign-On.
          </p>
          <div className="form-group">
            <label className="text-label">Email address</label>
            <input
              type="text"
              className="form-control"
              id="domainId"
              placeholder="test@example.com"
              value={userEmail.value}
              onChange={(e) => setUserEmail({ value: e.target.value, errors: '' })}
            />
            {userEmail.errors && <div className="error-message">{userEmail.errors}</div>}
          </div>
          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              Continue with SSO
            </button>
          </div>
          <div className="form-group text-center">
            <a href="/login" className="form-link">
              Return to login
            </a>
          </div>
        </form>
        <ToastContainer position="bottom-center" />
      </div>
      <Loader showComponentLoader={isLoading} />
    </section>
  );
};

export default SSODisambiguationPage;
