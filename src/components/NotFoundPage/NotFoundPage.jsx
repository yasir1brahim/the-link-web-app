import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-message">
        Oops! The page you're looking for doesn't exist.
      </p>
      <button className="back-home-button" onClick={handleBackToHome}>
        BACK to Home PAGE
      </button>
    </div>
  );
};

export default NotFoundPage;
