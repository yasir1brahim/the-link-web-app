import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from "reactstrap";
import React from "react";

const UpdateListing = (props) => {
    return (
        <Modal
            isOpen={props.updateListModal}
            fade={false}
            toggle={props.toggleUpdateList}
            className="updatelist-admin modal-md"
        >
            <ModalHeader toggle={props.toggleUpdateList}>Employees</ModalHeader>
            <ModalBody>
                <form className="update-list-form">
                    <div className="row">
                        <div className="col-6">
                            <div className="custom-control custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="updateList"
                                    id="toggleSelect1"
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="toggleSelect1"
                                >
                                    Employee One
                                </label>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="custom-control custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="updateList"
                                    id="toggleSelect2"
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="toggleSelect2"
                                >
                                    Employee Two
                                </label>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="custom-control custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="updateList"
                                    id="toggleSelect3"
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="toggleSelect3"
                                >
                                    Employee Three
                                </label>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="custom-control custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="updateList"
                                    id="toggleSelect4"
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="toggleSelect4"
                                >
                                    Employee Four
                                </label>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="custom-control custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="updateList"
                                    id="toggleSelect5"
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="toggleSelect5"
                                >
                                    Employee Five
                                </label>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="custom-control custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="updateList"
                                    id="toggleSelect6"
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="toggleSelect6"
                                >
                                    Employee Six
                                </label>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="custom-control custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="updateList"
                                    id="toggleSelect7"
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="toggleSelect7"
                                >
                                    Employee Seven
                                </label>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="custom-control custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="updateList"
                                    id="toggleSelect8"
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="toggleSelect8"
                                >
                                    Employee Eight
                                </label>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="custom-control custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="updateList"
                                    id="toggleSelect9"
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="toggleSelect9"
                                >
                                    Employee Nine
                                </label>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="custom-control custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    name="updateList"
                                    id="toggleSelect10"
                                />
                                <label
                                    className="custom-control-label"
                                    htmlFor="toggleSelect10"
                                >
                                    Employee Ten
                                </label>
                            </div>
                        </div>
                    </div>
                    <ModalFooter>
                        <Button color="secondary" onClick={props.toggleUpdateList}>
                            Cancel
                        </Button>
                        <Button color="primary" type="button" onClick={props.toggleUpdateList}>
                            Save
                        </Button>{" "}
                    </ModalFooter>
                </form>
            </ModalBody>
        </Modal>
    )
}

export default UpdateListing;