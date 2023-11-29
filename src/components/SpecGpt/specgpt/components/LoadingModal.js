import React from 'react';
import { Modal } from 'reactstrap';
import Loader from '../../../shared/Loader/Loader';


const LoadingModal = ({showModal, setModalShow, text}) => {
    return (
        <Modal
            show={showModal}
            onHide={() => setModalShow(false)}
            backdrop="static"
            keyboard={false}
            centered
            >
            <Modal.Body>
                <div style={{textAlign: 'center'}}>
                    <Loader/>
                    <div style={{marginTop: '5%'}}>{text}</div>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default LoadingModal;