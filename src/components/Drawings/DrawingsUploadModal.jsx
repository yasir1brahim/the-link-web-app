import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { uploadDrawingFiles } from "../../api/Drawings/api";

const DrawingsUploadModal = ({
  isOpen,
  toggle,
  projectId,
  projectVersionId,
  onSuccess,
}) => {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf" && f.size > 0
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
    setError(null);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      (f) => f.type === "application/pdf" && f.size > 0
    );
    setFiles((prev) => [...prev, ...selectedFiles]);
    setError(null);
    e.target.value = ""; // Reset input
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one PDF file to upload.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("project_id", projectId);
      formData.append("project_version_id", projectVersionId);
      formData.append("file_type", "drawing");
      files.forEach((file) => formData.append("files", file));

      await uploadDrawingFiles(formData);
      setFiles([]);
      onSuccess();
    } catch (err) {
      setError("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      setError(null);
      toggle();
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg">
      <ModalHeader toggle={handleClose}>Upload Drawing Files</ModalHeader>
      <ModalBody>
        <div
          className={`drawings-upload-dropzone ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>Drag and drop PDF files here, or click to select</p>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileInput}
            style={{ display: "none" }}
            id="drawings-file-input"
          />
          <label htmlFor="drawings-file-input" className="btn btn-secondary">
            Select Files
          </label>
        </div>

        {files.length > 0 && (
          <div className="drawings-upload-file-list">
            <h4>Selected Files ({files.length})</h4>
            <ul>
              {files.map((file, index) => (
                <li key={index}>
                  <span>{file.name}</span>
                  <button
                    className="drawings-upload-remove-btn"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <div className="drawings-upload-error">{error}</div>}
      </ModalBody>
      <ModalFooter>
        <button
          className="btn btn-secondary"
          onClick={handleClose}
          disabled={uploading}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default DrawingsUploadModal;
