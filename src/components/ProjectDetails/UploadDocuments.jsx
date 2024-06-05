import React from "react";
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
    fileData,
    logScreenUrl,
    project,
  } = props;
  const navigate = useNavigate();

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
          {/* Upload form code */}
          <form className="upload-document-form">
            <div className="upload-document-content">
              <div className="select-File">
                <input
                  className="d-none"
                  type="file"
                  // name="files[]"
                  id="uploadDocs"
                  accept="application/pdf"
                  multiple
                  // disabled={Object.keys(pdfFile).length !== 0}
                  onChange={(e) => setPdfFile(e.target.files)}
                />
                <label htmlFor="uploadDocs">
                  <div className="upload-text d-flex align-items-center justify-content-center">
                    <Upload />
                    <small>Select a File</small>
                    <span className="text-center">
                      Click to browse or drop here to upload. Supported Format
                      {/* Formats: Excel, csv, xml. */}: <b>PDF</b>.
                      <br />
                      Maximum Individual File size: <b>100 MB</b>.
                      <br />A maximum of <b>200</b> files can be uploaded at a
                      time, processing time may be up to <b>10</b> minutes.
                    </span>
                  </div>
                </label>
              </div>
              {Object.values(pdfFile).length ? (
                <div className="uploaded-file-list">
                  {Object.values(pdfFile).map((file) => {
                    return (
                      <div className="uploaded-file d-flex align-items-center justify-content-center">
                        <FileDocument />
                        <div className="file-name ml-3 d-flex align-items-start flex-column justify-content-center">
                          <span>{file.name}</span>
                          <small>{`${file.size * 0.001}KB `}</small>
                        </div>
                        <div className="ml-auto">
                          <Close
                            onClick={() =>
                              setPdfFile({
                                ...Object.values(pdfFile).filter(
                                  (pdf) => pdf.name !== file.name,
                                ),
                              })
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {/* <button
                  type="button"
                  className="btn btn-secondary btn-sm mb-4 ml-auto"
                  onClick={handleSubmit}
                  //   disabled={Object.keys(pdfFile).length === 0}
                >
                  Upload
                </button> */}
            </div>
            <ModalFooter className="mt-3 float-right">
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={handleSubmit}
                className="submit-accent"
              >
                Get Log
              </Button>{" "}
            </ModalFooter>
          </form>
          {/* Upload form code */}

          {/* Error Upload code */}
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
          {/* Error Upload code */}
          <div className="error-upload text-center">
            <Error />
            <h5>Error</h5>
            <p>There was some error uploading this file.</p>
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
          {/* Success Upload code */}
          <div className="success-upload text-center">
            <Success />
            <h5>Success</h5>
            <p>Your files have been succesfully uploaded and are being processed.</p>
            <p>This may take up to 10 minutes to complete.</p>
            <div className="text-right">
              <button
                type="button"
                onClick={() => toggleSuccessModal(false)}
                className="d-inline-block btn btn-secondary mr-3"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleSuccessModal(false);
                  navigate(logScreenUrl, {
                    state: { project, projectName: project?.project_name },
                  });
                }}
                className="d-inline-block btn btn-primary"
              >
                Go to Project Details
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};
