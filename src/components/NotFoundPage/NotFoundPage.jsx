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
      <h1 className="not-found-title">Page Not Found</h1>
      <p className="not-found-message">
        Unfortunately, the page you are trying to find is either no longer available or has moved.
      </p>
      <button className="back-home-button" onClick={handleBackToHome}>
        Back to Home Page
      </button>
    </div>
  );
};

export default NotFoundPage;
