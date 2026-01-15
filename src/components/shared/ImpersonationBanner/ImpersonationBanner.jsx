import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ImpersonationBanner.scss';

const ImpersonationBanner = ({ userName }) => {
  const navigate = useNavigate();

  const handleStopImpersonation = () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('jwt');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    localStorage.removeItem('role');
    localStorage.removeItem('userTeamRoles');
    localStorage.removeItem('isImpersonating');

    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="impersonation-banner">
      <div className="impersonation-banner__content">
        <span className="impersonation-banner__icon">👤</span>
        <span className="impersonation-banner__text">
          You are impersonating <strong>{userName || 'a user'}</strong>
        </span>
      </div>
      <button
        className="impersonation-banner__button"
        onClick={handleStopImpersonation}
      >
        Stop Impersonation
      </button>
    </div>
  );
};

export default ImpersonationBanner;
