import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { CSS_VARS } from '../utils/enums';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Modal from 'react-bootstrap/Modal';
import { BASE_URL } from '../utils/config';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icon, solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import useLogout from '../utils/useLogout';


const leftPanelStyle2 = {
    backgroundColor: 'rgb(31, 42, 67)',
    width: '15vw',
    minWidth: '200px',
    padding: '1%',
    color: '#FFFFFF',
    height: '100vh',
}

const UploadedFilesPage = ({token, removeToken}) => {
    const navigate = useNavigate();
    const {checkIfLoggedOut} = useLogout();

    const [userDocs, setUserDocs] = useState([]);
    const [showPurgeFilesModal, setShowPurgeFilesModal] = useState(false);
    const [showPurgingSpinnerModal, setShowPurgingSpinnerModal] = useState(false);

    const loadUserDocs = async () => {
        const url =`${BASE_URL}/api/docs`;
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
                setUserDocs(data.docs);
            }            
        } catch (error) {
            console.log('error: ', error);
        }
    }
    
    useEffect(() => {
        loadUserDocs();
    }, []);

    const purgeFiles = async () => {
        const url = `${BASE_URL}/api/purge-files`;
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
                loadUserDocs();
                setShowPurgingSpinnerModal(false);
                navigate('/getting-started');
            }
        } catch (error) {
            console.log('Error: ', error);
        }
    }


    const purgingSpinnerModal = () => {
        return (
            <Modal
                show={showPurgingSpinnerModal}
                onHide={() => setShowPurgingSpinnerModal(true)}
                backdrop="static"
                keyboard={false}
                centered
                >
                <Modal.Body>
                    <div style={{textAlign: 'center'}}>
                        <Spinner animation="border" variant="primary" />
                        <div style={{marginTop: '5%'}}>Purging files...</div>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }

    const purgeFilesConfirmModal = () => {
        return (
            <Modal
                show={showPurgeFilesModal}
                onHide={() => setShowPurgeFilesModal(false)}
                backdrop="static"
                keyboard={false}
                centered
            >
                
                <Modal.Body>
                    <div style={{textAlign: 'center', marginTop: '5%'}}>
                        <div style={{marginTop: '5%'}}>Are you sure you want to delete all your docs?</div>
                    </div>
                    <div style={{textAlign: 'center', marginTop: '5%'}}>
                        <button className="btn btn-danger" onClick={() => setShowPurgeFilesModal(false)}>Cancel</button>
                        <button style={{marginLeft: '5%'}} className="btn btn-primary" onClick={() => 
                            {   
                                setShowPurgingSpinnerModal(true);
                                setShowPurgeFilesModal(false)
                                purgeFiles();
                        }}>Delete</button>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }


    return (
        <>
        <div className="container-fluid">
            <div className="row">

                <div className="col-3" style={leftPanelStyle2}>
                    <div className="mb-3 mt-2 text-center">
                        <img src={'./images/The_Link_White_cropped.png'} height="50px" width="50px" />
                    </div>
                    <div className="text-center">
                        <button
                            onClick={() => {
                                navigate('/getting-started');
                            }}
                            className="btn"
                            style={{backgroundColor: CSS_VARS.LIGHT_YELLOW, color: CSS_VARS.DARK_BLUE}}
                            >+ Add Documents
                        </button>
                    </div>
                    <div className="mt-3 text-center">
                        <button
                            onClick={() => {
                                navigate('/chat');
                            }}
                            className="btn"
                            style={{backgroundColor: CSS_VARS.TEXT_GRAY, color: CSS_VARS.LIGHT_YELLOW}}
                            >
                        Go to Chat
                        </button>
                    </div>
                    
                    <div className="text-center mt-2">
                        <button
                            onClick={setShowPurgeFilesModal}
                            className="btn btn-danger mt-2"
                            >
                                Delete all Data
                        </button>
                    </div>
                </div>

                <div className="col-8">
                    <div className="text-center specgpt-logo-title">
                        SpecGPT
                    </div>
                    <div className="beta-v1-text">
                        Beta V1                        
                    </div>
                    <div className="row">
                        <div className="col-12" style={{marginLeft: '5%'}}>
                            <div className="example-question-title">
                                Uploaded Files
                                <span
                                    style={{fontSize: '1rem', fontWeight: 'normal'}}
                                 className="color-dark-blue font-weight-normal"
                                >
                                    &nbsp;&nbsp;
                                    (Please note this beta has a file upload limit of 300 files.)
                                </span>
                            </div>
                            <div className="table-response-sm">
                                <table className="table table-sm table-bordered" style={{borderRadius: '25px'}}>
                                    <thead >
                                        <tr className="d-flex">
                                            <th 
                                                className="col-7"
                                                style={{backgroundColor: CSS_VARS.LIGHT_YELLOW, color: CSS_VARS.DARK_BLUE}}>File Name</th>
                                            <th 
                                                scope="col"
                                                className="col-5"
                                                style={{backgroundColor: CSS_VARS.LIGHT_YELLOW, color: CSS_VARS.DARK_BLUE}}
                                            >Uploaded</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userDocs.map((doc, index) => {
                                            return (
                                                <tr className="d-flex" key={index}>
                                                    <td 
                                                        className="col-7"
                                                        scope="row">{doc.filename}</td>
                                                    <td
                                                        className="col-5"
                                                        >{doc.uploaded}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {purgeFilesConfirmModal()}
        {purgingSpinnerModal()}
        </>
    );


    
}

export default UploadedFilesPage;