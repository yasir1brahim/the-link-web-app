import React from "react";
import "./ProcessingBanner.css";

const ProcessingBanner = ({ message = "Still processing..." }) => {
  return (
    <div className="processing-banner" role="alert">
      {message}
    </div>
  );
};

export default ProcessingBanner;