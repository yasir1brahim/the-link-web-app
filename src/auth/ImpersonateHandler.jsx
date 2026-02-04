import { useEffect, useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authcontext';
import { getCurrentUserData, getUserTeams } from '../api/Authentication/api';
import { getHomeUrl } from '../utils/navigation';
import axios from 'axios';
import './ImpersonateHandler.scss';

export const ImpersonateHandler = () => {
  const navigate = useNavigate();
  const { setUserDetails } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const hasAttemptedExchange = useRef(false);

  useEffect(() => {
    const handleImpersonation = async () => {
      // Prevent double execution 
      if (hasAttemptedExchange.current) {
        return;
      }
      hasAttemptedExchange.current = true;

      try {
        // Extract exchange token from URL parameters
        const params = new URLSearchParams(window.location.search);
        const exchangeToken = params.get('exchange_token');

        if (!exchangeToken) {
          throw new Error('No exchange token provided');
        }

        // Clear URL to remove token from browser history (security measure)
        window.history.replaceState({}, document.title, '/auth/impersonate');

        // Exchange the token for JWT tokens via POST request
        // Use plain axios (not axiosInstance) to avoid auth interceptor
        const baseURL = window.location.href.includes('https://app-dj.thelink.ai')
          ? 'https://app-dj-qa-api.thelink.ai'
          : window.location.href.includes('https://app.thelink.ai')
            ? 'https://log-manager-api-prod.thelink.ai'
            : 'https://thelinkapi.knyapps.com/'; 
            // Adjusted according to the staging environment. This should be updated to match the correct API endpoints for each environment. 

        const exchangeResponse = await axios.post(
          `${baseURL}/support/api/exchange-impersonation-token/`,
          { exchange_token: exchangeToken }
        );

        if (!exchangeResponse.data || !exchangeResponse.data.access || !exchangeResponse.data.refresh) {
          throw new Error('Invalid token exchange response');
        }

        const accessToken = exchangeResponse.data.access;
        const refreshToken = exchangeResponse.data.refresh;

        localStorage.setItem('token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('jwt', accessToken);
        localStorage.setItem('isImpersonating', 'true');

        // Fetch user data with the new token
        const userResponse = await getCurrentUserData();

        if (userResponse && userResponse.data) {
          // Store additional user data
          localStorage.setItem('userId', userResponse.data.id);
          localStorage.setItem('fullName', userResponse.data.get_display_name);
          localStorage.setItem('role', userResponse.data.role);

          if (userResponse.data.team_roles) {
            localStorage.setItem('userTeamRoles', JSON.stringify(userResponse.data.team_roles));
          }

          // Update AuthContext with user details
          setUserDetails({
            access: accessToken,
            refresh: refreshToken,
            user: userResponse.data
          });

          // Use the same navigation logic as regular login
          await getHomeUrl(null, true, userResponse.data, getUserTeams, navigate);
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Impersonation error:', error);

        const errorMessage = error.response?.data?.error || error.message || 'Failed to complete impersonation';
        setError(errorMessage);

        // Clear any partially set data
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('jwt');
        localStorage.removeItem('isImpersonating');
        // Redirect to login after a brief delay
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleImpersonation();
  }, [navigate, setUserDetails]);

  return (
    <div className="impersonate-handler">
      {error ? (
        <>
          <h2 className="impersonate-handler__title impersonate-handler__title--error">
            Impersonation Failed
          </h2>
          <p className="impersonate-handler__message">{error}</p>
          <p className="impersonate-handler__redirect-text">Redirecting to login...</p>
        </>
      ) : (
        <>
          <h2 className="impersonate-handler__title">Setting up impersonation...</h2>
          <p className="impersonate-handler__message">Please wait while we log you in.</p>
          <div className="impersonate-handler__spinner" />
        </>
      )}
    </div>
  );
};
