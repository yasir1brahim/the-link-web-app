import { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authcontext';
import { getCurrentUserData, getUserTeams } from '../api/Authentication/api';
import { getHomeUrl } from '../utils/navigation';

export const ImpersonateHandler = () => {
  const navigate = useNavigate();
  const { setUserDetails } = useContext(AuthContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleImpersonation = async () => {
      try {
        // Extract tokens from URL parameters
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access');
        const refreshToken = params.get('refresh');

        if (accessToken && refreshToken) {
          // Store tokens in localStorage first
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('jwt', accessToken);

          // Clear URL to remove tokens from browser history (security measure)
          window.history.replaceState({}, document.title, '/auth/impersonate');

          // Fetch user data with the new token
          const userResponse = await getCurrentUserData();

          if (userResponse && userResponse.data) {
            // Set a flag to indicate we're in impersonation mode
            localStorage.setItem('isImpersonating', 'true');

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

            console.log('Successfully set up impersonation for:', userResponse.data.get_display_name);

            // Use the same navigation logic as regular login
            await getHomeUrl(null, true, userResponse.data, getUserTeams, navigate);
          } else {
            throw new Error('Failed to fetch user data');
          }
        } else {
          // No tokens found, redirect to login
          console.error('Impersonation failed: No tokens provided');
          navigate('/login');
        }
      } catch (error) {
        console.error('Impersonation error:', error);
        setError('Failed to complete impersonation. Please try again.');
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      {error ? (
        <>
          <h2 style={{ marginBottom: '10px', color: '#d32f2f' }}>Impersonation Failed</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>{error}</p>
          <p style={{ fontSize: '14px', color: '#999' }}>Redirecting to login...</p>
        </>
      ) : (
        <>
          <h2 style={{ marginBottom: '10px', color: '#333' }}>Setting up impersonation...</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>Please wait while we log you in.</p>
          <div style={{
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }} />
        </>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
