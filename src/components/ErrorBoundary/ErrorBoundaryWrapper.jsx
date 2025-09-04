import React from 'react';
import ErrorBoundary from './ErrorBoundary';

const ErrorBoundaryWrapper = ({ children }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default ErrorBoundaryWrapper; 