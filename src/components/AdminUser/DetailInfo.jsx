import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "reactstrap";
import React from "react";
import ProfilePhoto from '../../assets/images/dummy-profile.svg';

const DetailInfo = (props) => {
    return (
        <Modal
            isOpen={props.detailInfoModal}
            fade={false}
            toggle={props.toggleDetailInfo}
            className="detailinfo-admin modal-md"
        >
            <ModalHeader toggle={props.toggleDetailInfo}>User Details</ModalHeader>
            <ModalBody>
                <div className="detail-info">
                    <div className="customer-profile-details d-flex align-items-start justify-content-start flex-wrap">
                        <div className="customer-dp-container">
                            <img src={ProfilePhoto} className='uploaded-image' alt="Company Logo" />
                        </div>
                        <div className="customer-profile">
                            <div className="row">
                                <div className="col-12">
                                    <div className="text-label-value">
                                        <div className="text-label">First Name: </div>
                                        <div className="text-value">
                                            Stephen
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="text-label-value">
                                        <div className="text-label">Last Name: </div>
                                        <div className="text-value">
                                            Poppe
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="text-label-value">
                                        <div className="text-label">Email ID: </div>
                                        <div className="text-value">
                                            stephen_poppe81@gmail.com
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="text-label-value">
                                        <div className="text-label">Phone: </div>
                                        <div className="text-value">
                                            +(425) 555 0100, +(732) 622 4888
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="text-label-value">
                                        <div className="text-label">Address: </div>
                                        <div className="text-value">
                                            Ms Alice Smith Apartment 1c 213 Derrick Street, Boston, MA 02130 USA
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ModalFooter>
                        <Button color="secondary" onClick={props.toggleDetailInfo}>
                            Cancel
                        </Button>
                        <Button color="primary" type="button" onClick={props.toggleDetailInfo}>
                            Save
                        </Button>{" "}
                    </ModalFooter>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default DetailInfo;