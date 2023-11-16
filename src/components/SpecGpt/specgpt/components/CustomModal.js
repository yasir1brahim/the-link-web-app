import React from 'react';
import { Modal } from 'reactstrap';

const CustomModal = ({showModal, setShowModal, title, body, button1Click}) => {

    return (
            <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            backdrop="static"
            keyboard={false}
            centered
        >
            
            <Modal.Body>
                <div style={{textAlign: 'center', marginTop: '5%'}}>
                    <div style={{marginTop: '5%', marginLeft: '5%', marginRight: '5%'}}>{body}</div>
                </div>
                <div style={{textAlign: 'center', marginTop: '5%'}}>
                    <button className="btn btn-white-blue" onClick={() => setShowModal(false)}>Ok</button>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default CustomModal;
