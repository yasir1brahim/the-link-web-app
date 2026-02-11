import React, { useCallback, useState, useEffect } from "react";
import { ReactComponent as Upload } from "../../../assets/images/upload.svg";
import { ReactComponent as FileDocument } from "../../../assets/images/file-document.svg";
import { ReactComponent as Close } from "../../../assets/images/close.svg";
import { ReactComponent as Error } from "../../../assets/images/error.svg";
import { ReactComponent as Success } from "../../../assets/images/circle-success.svg";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import Loader from "../Loader/Loader";


export const FileUploadModal = ({
    // Modal control
    isOpen,
    toggle,

    // Customization
    title = "Upload Document",
    acceptedFileTypes = "application/pdf",
    uploadButtonText = "Upload",

    // Guidelines
    guidelines = [
        "All specifications must be a native PDF (i.e., not a flat, scanned file)",
        "For best results, specifications should be in standard CSI SectionFormat",
        "Maximum individual file size is 150 MB",
        "Maximum number of files in one upload is 250"
    ],

    // File management
    files = [],
    onFilesChange,

    // Upload handling
    onUpload,
    isUploading = false,

    // Error handling
    uploadError = null,
    onErrorClose,

    // Success handling
    uploadSuccess = false,
    onSuccessClose,
    successMessage = "Your files have been successfully uploaded and are being processed.",
    successSubMessage = "This may take up to 10 minutes to complete.",
    alreadyExistingFiles = [],

    // Duplicate handling (optional)
    duplicateFiles = [],
    onDuplicateSkip,
    onDuplicateConfirm,
    showDuplicateModal = false,
}) => {
    const [dragOver, setDragOver] = useState(false);

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
        if (onFilesChange) {
            const existingFiles = Array.from(files);
            const newFiles = [
                ...existingFiles,
                ...validFiles.filter(file =>
                    !existingFiles.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)
                )
            ];
            console.log('Updated file list:', newFiles);
            onFilesChange(newFiles);
        }
    }, [files, onFilesChange]);

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
        const selectedFiles = Array.from(e.target.files);
        if (onFilesChange) {
            const existingFiles = Array.from(files);
            const newFiles = [...existingFiles, ...selectedFiles.filter(file => !existingFiles.some(existingFile => existingFile.name === file.name))];
            onFilesChange(newFiles);
        }
    };

    const removeFile = (fileName) => {
        if (onFilesChange) {
            console.log('Removing file:', fileName);
            onFilesChange(Array.from(files).filter(file => file.name !== fileName));
        }
    };

    const handleUploadClick = () => {
        if (onUpload && files.length > 0) {
            onUpload();
        }
    };

    const isPdfFileEmpty = files.length === 0;

    return (
        <>
            {/* Main Upload Modal */}
            <Modal
                isOpen={isOpen && !uploadError && !uploadSuccess && !showDuplicateModal}
                fade={false}
                toggle={toggle}
                className="upload-doc-popup modal-lg"
                style={{ position: 'relative' }}
            >
                <ModalHeader toggle={toggle}>{title}</ModalHeader>
                <ModalBody style={{ position: 'relative' }}>
                    <form
                        className={`upload-document-form ${dragOver ? 'drag-over' : ''}`}
                        onDrop={!isUploading ? handleFileDrop : undefined}
                        onDragOver={!isUploading ? handleDragOver : undefined}
                        onDragLeave={!isUploading ? handleDragLeave : undefined}
                    >
                        <div className="upload-document-content">
                            <div className="select-File">
                                <input
                                    className="d-none"
                                    type="file"
                                    id="uploadDocs"
                                    accept={acceptedFileTypes}
                                    multiple
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                                <label htmlFor="uploadDocs">
                                    <div className="upload-text d-flex align-items-center justify-content-center">
                                        <Upload />
                                        <small>Select a File</small>
                                        {guidelines && guidelines.length > 0 && (
                                            <ul className="uploader-notify">
                                                {guidelines.map((guideline, index) => (
                                                    <li key={index}>{guideline}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </label>
                            </div>
                            {files.length > 0 && (
                                <div className="uploaded-file-list">
                                    {files.map((file) => (
                                        <div key={file.name} className="uploaded-file d-flex align-items-center justify-content-center">
                                            <FileDocument />
                                            <div className="file-name ml-3 d-flex align-items-start flex-column justify-content-center">
                                                <span>{file.name}</span>
                                                <small>{`${(file.size / 1000).toFixed(2)} KB`}</small>
                                            </div>
                                            <div className="ml-auto">
                                                <Close
                                                    onClick={() => !isUploading && removeFile(file.name)}
                                                    style={{
                                                        cursor: isUploading ? 'not-allowed' : 'pointer',
                                                        opacity: isUploading ? 0.5 : 1
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <ModalFooter className="mt-3 float-right">
                            <Button color="secondary" onClick={toggle} disabled={isUploading}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onClick={isPdfFileEmpty ? null : handleUploadClick}
                                className={`submit-accent ${isPdfFileEmpty ? 'disabled-button' : ''}`}
                                disabled={isPdfFileEmpty || isUploading}
                            >
                                {uploadButtonText}
                            </Button>
                        </ModalFooter>
                    </form>

                </ModalBody>
                {isUploading && (
                    <div className="upload-modal-loader-overlay">
                        <Loader showComponentLoader={true} showProcessing={true} componentScoped={true} />
                    </div>
                )}
            </Modal>

            {/* Error Modal */}
            <Modal
                isOpen={!!uploadError}
                fade={false}
                toggle={onErrorClose}
                className="upload-doc-popup modal-lg"
            >
                <ModalHeader toggle={onErrorClose}>{title}</ModalHeader>
                <ModalBody>
                    <div className="error-upload text-center">
                        <Error />
                        <h5>Error</h5>
                        <p>{uploadError || "There was some error uploading this file."}</p>
                        <button
                            type="button"
                            className="d-inline-block btn btn-primary"
                            onClick={onErrorClose}
                        >
                            Go back to Upload
                        </button>
                    </div>
                </ModalBody>
            </Modal>

            {/* Success Modal */}
            <Modal
                isOpen={uploadSuccess}
                fade={false}
                toggle={onSuccessClose}
                className="upload-doc-popup modal-lg"
            >
                <ModalHeader toggle={onSuccessClose}>
                    {title}
                </ModalHeader>
                <ModalBody>
                    <div className="success-upload text-center">
                        <Success />
                        <h5>Success</h5>
                        <p>{successMessage}</p>
                        {successSubMessage && <p>{successSubMessage}</p>}
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
                                onClick={onSuccessClose}
                                className="d-inline-block btn btn-secondary mr-3"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </ModalBody>
            </Modal>

            {/* Duplicate Files Confirmation Modal (if provided) */}
            {showDuplicateModal && duplicateFiles.length > 0 && (
                <Modal
                    isOpen={showDuplicateModal}
                    fade={false}
                    toggle={onDuplicateSkip}
                    className="upload-doc-popup modal-lg"
                >
                    <ModalHeader toggle={onDuplicateSkip}>Duplicate Files Detected</ModalHeader>
                    <ModalBody>
                        <div className="text-center">
                            <p>The following files already exist in this project. Would you like to reprocess them?</p>
                            <ul className="doc-content-table">
                                {duplicateFiles.map((file, index) => (
                                    <li key={index} className="doc-content-list">{file.filename || file.name}</li>
                                ))}
                            </ul>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={onDuplicateSkip}>
                            Skip All
                        </Button>
                        <Button color="primary" onClick={onDuplicateConfirm}>
                            Reprocess All
                        </Button>
                    </ModalFooter>
                </Modal>
            )}
        </>
    );
};

export default FileUploadModal;
