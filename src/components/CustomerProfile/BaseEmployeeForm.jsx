import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { MaskedInput } from '../shared/MaskedInput/maskedInput';


const BaseEmployeeForm = ({
    formTitle,
    toggleModal,
    modal,
    handleSubmit,
    validate,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
}) => {
    return (
        <Modal
          isOpen={modal}
          fade={false}
          toggle={toggleModal}
          className="new-user modal-lg"
        >
          <ModalHeader toggle={toggleModal}>{formTitle}</ModalHeader>
          <ModalBody>
            <form className="create-user-form">
              <div className="create-user-content">
                <div className="row">
                  <div className="col-4">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        id="userFirstName"
                        aria-describedby="userFirstName"
                        placeholder="Enter"
                        required
                        value={firstName.value}
                        onChange={(e) => {
                          setFirstName({
                            ...firstName,
                            value: e.target.value
                          });
                        }}
                      />
                      <label className="text-label" htmlFor="userFirstName">
                        First Name
                      </label>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        id="userLastName"
                        aria-describedby="userLastName"
                        placeholder="Enter"
                        required
                        value={lastName.value}
                        onChange={(e) => {
                          setLastName({
                            ...lastName,
                            value: e.target.value
                          });
                        }}
                      />
                      <label className="text-label" htmlFor="userLastName">
                        Last Name
                      </label>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      <input
                        type="email"
                        className="form-control"
                        id="userEmailAddress"
                        aria-describedby="userEmailAddress"
                        placeholder="Enter"
                        required
                        value={email.value}
                        onChange={(e) => {
                          setEmail({
                            ...email,
                            value: e.target.value
                          });
                        }}
                      />
                      <label className="text-label" htmlFor="userEmailAddress">
                        Email Address
                      </label>
                      {email.errors && (
                        <small className="form-error" style={{ color: 'red' }}>
                          {email.errors}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-group">
                      {/* <input
                        type="text"
                        className="form-control"
                        id="userPhone"
                        aria-describedby="userPhone"
                        placeholder="Enter"
                        required
                        value={contactNumber.value}
                        onChange={(e) => {
                          setContactNumber({
                            ...contactNumber,
                            value: e.target.value,
                          });
                        }}
                      /> */}
                      
                    </div>
                  </div>
                </div>
              </div>
              <ModalFooter>
                <Button color="secondary" onClick={toggleModal}>
                  Cancel
                </Button>
                <Button color="primary" onClick={handleSubmit}>
                  Create
                </Button>{' '}
              </ModalFooter>
            </form>
          </ModalBody>
        </Modal>
    );   
}

export default BaseEmployeeForm;