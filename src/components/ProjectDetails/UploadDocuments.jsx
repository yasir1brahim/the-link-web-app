import React from 'react'
import { ReactComponent as Upload } from '../../assets/images/upload.svg';
import { ReactComponent as FileDocument } from '../../assets/images/file-document.svg';
import { ReactComponent as Close } from '../../assets/images/close.svg';
import { ReactComponent as Error } from '../../assets/images/error.svg';
import { ReactComponent as Success } from '../../assets/images/circle-success.svg';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import Loader from '../shared/Loader/Loader';

export const UploadDocuments = (props) => {
    const {
        modal,
        toggleModal,
        setPdfFile,
        pdfFile,
        handleSubmit,
        isUploadLoading,
        errorModal,
        toggleErrorModal,
        backToUpload,
        successModal,
        toggleSuccessModal,
        fileData
    } = props
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
                                            {/* Formats: Excel, csv, xml. */}
                                            : PDF.
                                            <br />
                                            Maximum Individual File size: 100 MB
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
                                                                    (pdf) => pdf.name !== file.name
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
                        <ModalFooter>
                            <Button color="secondary" onClick={toggleModal}>
                                Cancel
                            </Button>
                            <Button color="primary" onClick={handleSubmit}>
                                Get Log
                            </Button>{' '}
                        </ModalFooter>
                    </form>
                    {/* Upload form code */}

                    {/* Error Upload code */}
                    {isUploadLoading && <Loader showComponentLoader={true} showProcessing={true} />}
                </ModalBody>
            </Modal>
            <Modal
                isOpen={errorModal}
                fade={false}
                toggle={toggleErrorModal}
                className="upload-doc-popup modal-lg"
            >
                <ModalHeader toggle={toggleErrorModal}>Upload Document</ModalHeader>
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
                        <p>Your file has been succesfully parsed.</p>
                        <ul className="doc-content-table">
                            <li className="doc-content-heading">
                                <span>Type</span>
                                <span>Total Logs</span>
                            </li>
                            <li className="doc-content-list">
                                <span>Submittals</span>
                                <span>{fileData?.submittal}</span>
                            </li>
                            <li className="doc-content-list">
                                <span>Testings</span>
                                <span>{fileData?.testing}</span>
                            </li>
                            <li className="doc-content-list">
                                <span>Meetings</span>
                                <span>{fileData?.meeting}</span>
                            </li>
                            <li className="doc-content-list">
                                <span>Closeouts</span>
                                <span>{fileData?.closeout}</span>
                            </li>
                        </ul>
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => toggleSuccessModal(false)}
                                className="d-inline-block btn btn-secondary mr-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleSuccessModal(false)}
                                className="d-inline-block btn btn-primary"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </>
    )
}
