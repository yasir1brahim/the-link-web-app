import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { MaskedInput } from '../shared/MaskedInput/maskedInput';
import SelectDropdownNoFilter from '../shared/SelectDropdown/SelectDropdownNoFilter';

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
    role,
    setRole,
    readOnlyEmail=false,
}) => {
    return (
        <Modal
          isOpen={modal}
          fade={false}
          toggle={toggleModal}
          className="new-user modal-lg"
        >
          <ModalHeader toggle={toggleModal}>{formTitle}</ModalHeader>
          <ModalBody className="employee-form-body">
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
                            value: e.target.value,
                            errors:''
                          });
                        }}
                      />
                      <label className="text-label" htmlFor="userFirstName">
                        First Name
                      </label>
                      {firstName.errors && (
                        <small className="form-error" style={{ color: 'red' }}>
                          {firstName.errors}
                        </small>
                      )}
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
                            value: e.target.value,
                            errors:''
                          });
                        }}
                      />
                      <label className="text-label" htmlFor="userLastName">
                        Last Name
                      </label>
                      {lastName.errors && (
                        <small className="form-error" style={{ color: 'red' }}>
                          {lastName.errors}
                        </small>
                      )}
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
                        readOnly={readOnlyEmail}
                        value={email.value}
                        onChange={(e) => {
                          setEmail({
                            ...email,
                            value: e.target.value,
                            errors:''
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
                      <SelectDropdownNoFilter
                        label={'Role'}
                        setSelected={setRole}
                        selected={role}
                        options={['member', 'admin'].map((role) => {
                            return {
                                value: role,
                                label: role === 'member' ? 'Member' : 'Admin',
                            };
                        })}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <ModalFooter>
                <Button color="secondary" onClick={toggleModal}>
                  Cancel
                </Button>
                <Button color="primary" onClick={handleSubmit}>
                  Save
                </Button>{' '}
              </ModalFooter>
            </form>
          </ModalBody>
        </Modal>
    );   
}

export default BaseEmployeeForm;