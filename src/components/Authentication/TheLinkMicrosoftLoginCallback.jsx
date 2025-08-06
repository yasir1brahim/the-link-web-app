import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { microsoftLogin, getUserTeams } from '../../api/Authentication/api';
import { AuthContext } from '../../auth/authcontext';
import { getHomeUrl } from '../../utils/navigation';
import { ToastContainer } from 'react-toastify';
import { ReactComponent as ReactLogo } from '../../assets/images/the-link-ai-header-logo-new.svg';
import Loader from '../shared/Loader/Loader';

const TheLinkMicrosoftLoginCallback = () => {
    const { setUserDetails, isAuthenticated, user } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        setLoading(true);
        setError(null);
        
        try {
          // Get the code from URL query parameters
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          const sessionState = urlParams.get('session_state');

          console.log(code);
          console.log(sessionState);
          urlParams.forEach((value, key) => {
            console.log(`${key}: ${value}`);
          });
          
          if (!code) {
            throw new Error('Authorization code not found in the URL.');
          }
          
          // Send the code to the backend
            const response = await microsoftLogin(
              '/api/auth/the_link/microsoft/login/callback/', 
              code, 
              `${window.location.origin}/the_link/microsoft/login/callback`
            );
            console.log(response);
            if (response.data.status === 'success') {
                setUserDetails(response.data.jwt);
                localStorage.setItem('jwt', response.data.jwt);
                await getHomeUrl(null, true, user, getUserTeams, navigate);
            }
          
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to authenticate';
          setError(errorMessage);
          
        //   if (onLoginError && err instanceof Error) {
        //     onLoginError(err);
        //   }
        } finally {
          setLoading(false);
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
            Authenticating with Microsoft...
          </p>
        </form>
        <ToastContainer position="bottom-center" />
      </div>
      <Loader showComponentLoader={true} />
      </section>
    )
}

export default TheLinkMicrosoftLoginCallback;