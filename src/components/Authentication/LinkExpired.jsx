import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../NotFoundPage/NotFoundPage.css';

const LinkExpired = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="not-found-container">
      <h1 className="not-found-title">Password Reset Link Expired</h1>
      <p className="not-found-message">
        We're sorry, but this password reset link has expired or has already been used.
      </p>
      <p className="not-found-message">
        Please contact your administrator to request a new password reset link.
      </p>
      <button className="back-home-button" onClick={handleBackToLogin}>
        Back to Login
      </button>
    </div>
  );
};

export default LinkExpired;
