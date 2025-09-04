import React from 'react';
import { useNavigate } from 'react-router-dom';

const SessionExpired = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="not-found-container">
      <h1 className="not-found-title">We’ve logged you out for security</h1>
      <p className="not-found-message">
        Your session has expired due to inactivity. Please log back in to continue.
      </p>
      <button className="back-home-button" onClick={handleGoToLogin}>
        Log back in
      </button>
    </div>
  );
};

export default SessionExpired; 