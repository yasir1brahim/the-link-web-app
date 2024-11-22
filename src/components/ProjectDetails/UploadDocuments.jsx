import React, { useCallback, useState } from "react";
import { ReactComponent as Upload } from "../../assets/images/upload.svg";
import { ReactComponent as FileDocument } from "../../assets/images/file-document.svg";
import { ReactComponent as Close } from "../../assets/images/close.svg";
import { ReactComponent as Error } from "../../assets/images/error.svg";
import { ReactComponent as Success } from "../../assets/images/circle-success.svg";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import Loader from "../shared/Loader/Loader";
import { useNavigate } from "react-router";

export const UploadDocuments = (props) => {
  const {
    modal,
    toggleModal,
    setPdfFile,
    pdfFile,
    handleSubmit,
    isUploadLoading,
    errorModal,
    backToUpload,
    successModal,
    toggleSuccessModal,
    alreadyExistingFiles,
    logScreenUrl,
    project,
  } = props;

  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  
    // Get dropped files
    const droppedFiles = Array.from(e.dataTransfer.files);
    console.log('Dropped files:', droppedFiles);
  
    // Check if files array is empty
    if (droppedFiles.length === 0) {
      console.log('No files were dropped.');
      return;
    }
  
    // Filter out empty files and avoid adding duplicates
    const validFiles = droppedFiles.filter(file => file.size > 0);
    console.log('Valid files:', validFiles);
  
    // Update state with new files
    try {
      setPdfFile(prevFiles => {
        const existingFiles = Array.from(prevFiles);
        const newFiles = [
          ...existingFiles,
          ...validFiles.filter(file => 
            !existingFiles.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)
          )
        ];
        console.log('Updated file list:', newFiles);
        return newFiles;
      });
    } catch (error) {
      setErrorMessage("Failed to process dropped files.");
      console.error(error);
    }
  }, [setPdfFile]);
  

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleFileChange = (e) => {
    try {
      const selectedFiles = Array.from(e.target.files);
      setPdfFile(prevFiles => {
        const existingFiles = Array.from(prevFiles);
        const newFiles = [...existingFiles, ...selectedFiles.filter(file => !existingFiles.some(existingFile => existingFile.name === file.name))];
        return newFiles;
      });
    } catch (error) {
      setErrorMessage("Failed to process selected files.");
      console.error(error);
    }
  };

  const removeFile = (fileName) => {
    setPdfFile(prevFiles => {
      console.log('Removing file:', fileName);
      return Array.from(prevFiles).filter(file => file.name !== fileName);
    });
  };

  const isPdfFileEmpty = Object.keys(pdfFile).length === 0;

  return (
    <>
      <Modal
        isOpen={modal}
        fade={false}
        toggle={toggleModal}
        className="upload-doc-popup modal-lg"
      >
        <ModalHeader toggle={toggleModal}>Upload Document</ModalHeader>
        <ModalBody>
          <form
            className={`upload-document-form ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="upload-document-content">
              <div className="select-File">
                <input
                  className="d-none"
                  type="file"
                  id="uploadDocs"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileChange}
                />
                <label htmlFor="uploadDocs">
                  <div className="upload-text d-flex align-items-center justify-content-center">
                    <Upload />
                    <small>Select a File</small>
                    <ul className="uploader-notify">
                      <li>All specifications must be a native PDF (i.e., not a flat, scanned file)</li>
                      <li>For best results, specifications should be in standard CSI SectionFormat</li>
                      <li>Maximum individual file size is 150 MB</li>
                      <li>Maximum number of files in one upload is 250</li>
                    </ul>
                  </div>
                </label>
              </div>
              {pdfFile.length ? (
                <div className="uploaded-file-list">
                  {pdfFile.map((file) => (
                    <div key={file.name} className="uploaded-file d-flex align-items-center justify-content-center">
                      <FileDocument />
                      <div className="file-name ml-3 d-flex align-items-start flex-column justify-content-center">
                        <span>{file.name}</span>
                        <small>{`${(file.size / 1000).toFixed(2)} KB`}</small>
                      </div>
                      <div className="ml-auto">
                        <Close onClick={() => removeFile(file.name)} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <ModalFooter className="mt-3 float-right">
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={isPdfFileEmpty ? null : handleSubmit} 
                className={`submit-accent ${isPdfFileEmpty ? 'disabled-button' : ''}`} 
                disabled={isPdfFileEmpty} 
              >
                Create Log
              </Button>
            </ModalFooter>
          </form>

          {isUploadLoading && (
            <Loader showComponentLoader={true} showProcessing={true} />
          )}
        </ModalBody>
      </Modal>

      <Modal
        isOpen={errorModal}
        fade={false}
        toggle={toggleModal}
        className="upload-doc-popup modal-lg"
      >
        <ModalHeader toggle={toggleModal}>Upload Document</ModalHeader>
        <ModalBody>
          <div className="error-upload text-center">
            <Error />
            <h5>Error</h5>
            <p>{errorMessage || "There was some error uploading this file."}</p>
            <button
              type="button"
              className="d-inline-block btn btn-primary"
              onClick={backToUpload}
            >
              Go back to Upload
            </button>
          </div>
        </ModalBody>
      </Modal>

      <Modal
        isOpen={successModal}
        fade={false}
        toggle={() => toggleSuccessModal(!successModal)}
        className="upload-doc-popup modal-lg"
      >
        <ModalHeader toggle={() => toggleSuccessModal(!successModal)}>
          Upload Document
        </ModalHeader>
        <ModalBody>
          <div className="success-upload text-center">
            <Success />
            <h5>Success</h5>
            <p>Your files have been successfully uploaded and are being processed.</p>
            <p>This may take up to 10 minutes to complete.</p>
            {alreadyExistingFiles?.length > 0 && (
              <>
                <p><b>Note:</b> The following files had the same title and content as other files you already uploaded for this project. They will not be re-processed.</p>
                <ul className="doc-content-table">
                  {alreadyExistingFiles.map((filename) => (
                    <li key={filename} className="doc-content-list">{filename}</li>
                  ))}
                </ul>
              </>
            )}
            <div className="text-right">
              <button
                type="button"
                onClick={() => toggleSuccessModal(false)}
                className="d-inline-block btn btn-secondary mr-3"
              >
                Close
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};
