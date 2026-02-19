import React from "react";
import ProcessingBanner from "../shared/ProcessingBanner/ProcessingBanner";

const DrawingsProcessingIndicator = ({ processingStatus }) => {
  if (!processingStatus) return null;

  const { is_processing, files_processing, files_completed, files_failed } =
    processingStatus;

  if (!is_processing && files_failed === 0) return null;

  const totalFiles = files_processing + files_completed + files_failed;

  if (files_failed > 0 && !is_processing) {
    return (
      <div className="drawings-processing-indicator error">
        <span>
          {files_failed} file{files_failed > 1 ? "s" : ""} failed extraction.
          {processingStatus.files?.length > 0 && (
            <> Failed: {processingStatus.files.filter(f => f.status === "FAILED").map(f => f.name).join(", ")}</>
          )}
        </span>
      </div>
    );
  }

  return <ProcessingBanner message="Still processing..." />;
};

export default DrawingsProcessingIndicator;
