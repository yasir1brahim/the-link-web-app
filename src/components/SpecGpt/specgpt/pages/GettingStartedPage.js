 import React, {useEffect, useState, useMemo} from 'react';
 import { CSS_VARS } from '../utils/enums';
 import Header from '../components/Header';
 import Uploady,
 {
    useItemFinishListener,
    UPLOADER_EVENTS,
 } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadDropZone from "@rpldy/upload-drop-zone";
import { BASE_URL } from '../utils/config';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { icon, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useNavigate, Link } from 'react-router-dom';
import LoadingModal from '../components/LoadingModal';
import CustomModal from '../components/CustomModal';
import useLogout from '../utils/useLogout';

// const MyComponent = ({callback}) => {    
//     useItemFinishListener((item) => {
//         callback(item.uploadResponse);
//         console.log(`item ${item.id} finished uploading, response was: `, item.uploadResponse, item.uploadStatus);  
//     });

// };


 const GettingStartedPage = ({token}) => {
    const navigate = useNavigate();
    const {checkIfLoggedOut} = useLogout();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [docCount, setDocCount] = useState(0);
    const [showUploadingModal, setShowUploading] = useState(false);
    const [textUploadingFiles, setTextUploadingFiles] = useState('Uploading Files.');
    const [totalFilesToUpload, setTotalFilesToUpload] = useState(0);
    const [filesUploaded, setFilesUploaded] = useState(0);
    const [showUploadMaxError, setShowUploadMaxError] = useState(false);
    const [showUploadCompleteModal, setShowUploadCompleteModal] = useState(false);
    const [uploadErrors, setUploadErrors] = useState([]);    

    const uploadCompleteCallback = (item) => {        
        loadDocCount();
        console.log('upload call back ', item);
        if (item.data.reachedUploadLimit) {
            setShowUploadMaxError(true);
            return;
        } else if (!item.data.success) {
            if (item.data.error != '') {
                setUploadErrors([...uploadErrors, item.data.error]);
            }
        }
        updateUploadText(filesUploaded, totalFilesToUpload);
        let newUploadedFiles = [...uploadedFiles, ...item.data.filenames];
        // sort newUploadedFiles
        newUploadedFiles.sort((a, b) => {
            if (a.filename < b.filename) {
                return -1;
            }
            if (a.filename > b.filename) {
                return 1;
            }
            return 0;
        });
        console.log('newUploadedFiles: ', newUploadedFiles);        
        setUploadedFiles([...newUploadedFiles]);
    }

    const loadDocCount = async () => {
        const url = `${BASE_URL}/api/doc-count`;
        try {
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token,
                }
            });
            checkIfLoggedOut(response);
            const data = await response.json();
            if (data.success) {
                console.log(data);
                setDocCount(data.count)
            }            
        } catch (error) {
            console.log('error: ', error);
        }
    }

    useEffect(() => {
        loadDocCount();
    }, []);

    const updateUploadText = (filesUploaded2, totalFilesToUpload2) => {
        setFilesUploaded(filesUploaded2 + 1); 
        setTotalFilesToUpload(totalFilesToUpload2);
        const percent = (filesUploaded2 / totalFilesToUpload2) * 100;
        const text = `Uploading Files. ${filesUploaded2} of ${totalFilesToUpload2} uploaded. ${percent.toFixed(0)}% complete.`;
        setTextUploadingFiles(text);
    }

    const listeners = useMemo(() => ({
        [UPLOADER_EVENTS.BATCH_START]: (batch) => {
            
            updateUploadText(filesUploaded, batch.items.length);
            setShowUploading(true);
            //console.log(`Batch Start - ${batch.id} - item count = ${batch.items.length}`);
        },
        [UPLOADER_EVENTS.BATCH_FINISH]: (batch) => {
            setShowUploading(false);
            setShowUploadCompleteModal(true);
            //console.log(`Batch Finish - ${batch.id} - item count = ${batch.items.length}`);
        },
        [UPLOADER_EVENTS.ITEM_START]: (item) => {
            //console.log(`Item Start - ${item.id} : ${item.file.name}`);
        },
        [UPLOADER_EVENTS.ITEM_FINISH]: (item) => {
            //console.log(`Item Finish - ${item.id} : ${item.file.name}`);
        },

    }), []);

    return (
        <>
        <div className="container">
            <div className="row">
                <div className="col-12 mt-3 mb-5">
                    {/* <Header 
                        isLoggedIn={true}
                    /> */}
                </div>

                <div className="col-6">
                    <div className="example-question-title">Getting Started</div>
                    <div className="getting-started-step">Step 1</div>
                    <div className="getting-started-item">Click “Select files,” or “Select Folders” to upload specification documents.</div>
                    <div className="getting-started-item">Please note this beta has a file upload limit of 300 files.</div>
                    <div className="getting-started-step">Step 2</div>
                    <div className="getting-started-item">Wait for 2-5 minutes while the system processes your documents.</div>
                    <div className="getting-started-step">Step 3</div>
                    <div className="getting-started-item">Ask questions like you might in a real project</div>
                    <div>
                        <ul>
                            <li className="getting-started-item">You can just ask in English</li>
                            <li className="getting-started-item">If the system cannot answer the first time, try restating the question</li>
                        </ul>
                    </div>
                    <div className="getting-started-step">Step 4</div>
                    <div className="getting-started-item">Press "delete" and all your uploaded files will be deleted (we will delete all uploaded files weekly).</div>

                    <div className="mt-5">For help email <a href="mailto:support@thelink.ai" target="_blank">support@thelink.ai</a></div>
                </div>

                <div className="col-6">
                    <div className="row">
                        <div className="col-12">
                            <div className="example-question-title">Upload box</div>
                        </div>
                        <div className="col-12 mb-3">
                            <Uploady
                                listeners={listeners}
                                destination={{url: `${BASE_URL}/api/upload`,
                                        headers: {
                                        "Authorization": "Bearer " + token,
                                    },
                                }}>
                                <UploadDropZone
                                    onDragOverClassName="drag-over"
                                >
                                    <div 
                                        className="d-flex flex-row justify-content-center align-items-center bg-gray"
                                        style={{height: '300px', width: '100%', border: '1px solid #c4c4c4', borderRadius: '20px', color: '#949090'}}>
                                            <div className="d-flex flex-column justify-content-center align-items-center">
                                                <div className="flex-column drag-drop-text">
                                                    Drag & Drop File(s) or Folders here
                                                </div>
                                                <div className="flex-column drag-drop-text mt-1">
                                                    Or click below
                                                </div>
                                            </div>
                                    </div>
                                </UploadDropZone>
                                {/* <MyComponent 
                                        callback={uploadCompleteCallback}
                                     /> */}
                            </Uploady>
                        </div>
                        <div className="col-4">
                            <Uploady
                                listeners={listeners}
                                accept='application/pdf'
                                destination={{url: `${BASE_URL}/api/upload`,
                                    headers: {
                                        "Authorization": "Bearer " + token,
                                    },
                                }}
                            >
                                    <UploadButton
                                        text="Click to select Files"
                                        className="btn btn-primary mr-3 btn-small"
                                     />
                                     {/* <MyComponent 
                                        callback={uploadCompleteCallback}
                                     /> */}
                            </Uploady>
                        </div>
                        <div className="col-4">
                            <Uploady
                                listeners={listeners}
                                webkitdirectory
                                destination={{url: `${BASE_URL}/api/upload`,
                                    headers: {
                                        "Authorization": "Bearer " + token,
                                    }
                                }}
                            >
                                    <UploadButton 
                                        className="btn btn-primary mr-3 btn-small"
                                        text="Click to select Folders"
                                    />
                                    {/* <MyComponent 
                                        callback={uploadCompleteCallback}
                                     /> */}
                            </Uploady>
                        </div>

                        <div className="col-4">
                            <button 
                                // disabled={uploadedFiles.length === 0 && docCount === 0}
                                className="btn btn-primary mr-3 btn-small"
                                onClick={() => {
                                    navigate('/chat');
                                }}
                            >
                                Go To Chat Page
                            </button>
                        </div>

                        {/* <div className="col-12 mt-5">
                            {uploadedFiles.length > 0 && (<div className="example-question-title">Uploaded Files</div>)}
                            {uploadErrors.length > 0 && (
                                <div style={{color: 'red'}}>
                                    {uploadErrors.map((error, index) => {
                                        return (
                                            <p key={index}>
                                                <FontAwesomeIcon icon={solid("exclamation-triangle")} size="lg" style={{color: "#e22828",}} />
                                                {' '} {error}
                                            </p>
                                        )
                                    })}
                                </div>
                            )}
                            {showUploadMaxError && (
                                <div style={{color: 'red'}}>
                                    You have reached the maximum number of files allowed. Please delete some files and try again.
                                </div>
                            )}
                            {uploadedFiles.map((file, index) => {                        
                                return (
                                    <p key={index}>
                                        <FontAwesomeIcon icon={solid("check")} size="lg" style={{color: "#5fe228",}} />
                                        {' '} {file.filename}
                                    </p>
                                )}
                            )} 
                        </div> */}
                    </div>                
                </div>
            </div>
        </div>
        <LoadingModal
            showModal={showUploadingModal}
            setShowModal={setShowUploading}
            text={textUploadingFiles}
        />
        <CustomModal
            showModal={showUploadCompleteModal}
            setShowModal={setShowUploadCompleteModal}            
            body="Your files have been uploaded. You can now go to the chat page and ask questions."
        />
        </>
    )
 }

 export default GettingStartedPage;