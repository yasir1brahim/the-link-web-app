import React, { useState, useEffect } from 'react';
import ProfilePhoto from '../../assets/images/dummy-profile.svg';
import { ReactComponent as Camera } from '../../assets/images/camera.svg';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axiosInstance from '../../config/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateCustomer = ({ modal, toggleModal }) => {
  const [email, setEmail] = useState({ value: '', errors: '' });
  const [password, setPassword] = useState({ value: '', errors: '' });
  const [companyName, setCompanyName] = useState({ value: '', errors: '' });
  const [accountOwner, setAccountOwner] = useState({ value: '', errors: '' });
  const [contactNumber, setContactNumber] = useState({ value: '', errors: '' });
  const [address, setAddress] = useState({ value: '', errors: '' });
  // const [accountId, setAccountId] = useState({ value: '', errors: '' });

  useEffect(() => {
    setEmail({ value: '', errors: '' });
    setPassword({ value: '', errors: '' });
  }, []);

  const validate = () => {
    let error = false;
    if (email.value === '') {
      setEmail({ ...email, errors: 'Email is required.' });
      error = true;
    }
    if (password.value === '') {
      setPassword({ ...password, errors: 'Password is reuired.' });
      error = true;
    }
    return error;
  };

  const handleSubmit = async () => {
    let errors = validate();
    if (!errors) {
      try {
        const response = await axiosInstance({
          method: 'post',
          url: '/createCustomer',
          data: {
            email_address: email.value,
            password: password.value,
            customer_name: companyName.value,
            account_owner: accountOwner.value,
            contact_number: contactNumber.value,
            address: address.value,
            admin_id: Number(localStorage.getItem('userId')),
          },
        });
        if (response.data) {
          console.log(response.data);
          toggleModal();
        }
      } catch (error) {
        console.log(error.message);
        toast.error(error.message, {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        toggleModal();
      }
    }
  };

  return (
    <Modal
      isOpen={modal}
      fade={false}
      toggle={toggleModal}
      className="new-customer modal-xl"
    >
      <ModalHeader toggle={toggleModal}>Create New Customer</ModalHeader>
      <ModalBody>
        <form className="create-customer-form">
          <div className="create-customer-content">
            <div className="cc-left">
              <div className="upload-documents">
                <div className="image-holder">
                  <img
                    src={ProfilePhoto}
                    alt="Profile Photo"
                    className="dummy-image"
                  />
                  {/* <img src={ProfilePhoto} alt="Profile Photo" className='uploaded-image'/> */}
                </div>
                <div className="select-File">
                  <input
                    className="d-none"
                    type="file"
                    name="files[]"
                    id="uploadDocs"
                  />
                  <label htmlFor="uploadDocs">
                    <div className="upload-text d-flex align-items-center justify-content-center">
                      <Camera />
                      <span>Upload Logo</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className="cc-right">
              <div className="row">
                <div className="col-4">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="companyName"
                      aria-describedby="companyName"
                      placeholder="Enter"
                      required
                      value={companyName.value}
                      onChange={(e) => {
                        setCompanyName({
                          ...companyName,
                          value: e.target.value,
                        });
                      }}
                    />
                    <label className="text-label" htmlFor="companyName">
                      Company Name
                    </label>
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="accountId"
                      aria-describedby="accountId"
                      placeholder="Enter"
                      required
                      disabled
                      value={localStorage.getItem('userId')}
                      // onChange={(e) => {
                      //   setAccountId({
                      //     ...accountId,
                      //     value: e.target.value,
                      //   });
                      // }}
                    />
                    <label className="text-label" htmlFor="accountId">
                      Account Id
                    </label>
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="accountOwner"
                      aria-describedby="accountOwner"
                      placeholder="Enter"
                      required
                      value={accountOwner.value}
                      onChange={(e) => {
                        setAccountOwner({
                          ...accountOwner,
                          value: e.target.value,
                        });
                      }}
                    />
                    <label className="text-label" htmlFor="accountOwner">
                      Account Owner
                    </label>
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control"
                      id="accountEmail"
                      aria-describedby="accountEmail"
                      placeholder="Enter"
                      required
                      value={email.value}
                      onChange={(e) => {
                        setEmail({
                          ...email,
                          value: e.target.value,
                        });
                      }}
                    />
                    <label className="text-label" htmlFor="accountEmail">
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
                    <input
                      type="text"
                      className="form-control"
                      id="accountContact"
                      aria-describedby="accountContact"
                      placeholder="Enter"
                      required
                      value={contactNumber.value}
                      onChange={(e) => {
                        setContactNumber({
                          ...contactNumber,
                          value: e.target.value,
                        });
                      }}
                    />
                    <label className="text-label" htmlFor="accountContact">
                      Contact Number
                    </label>
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <input
                      type="password"
                      className="form-control"
                      id="accountPassword"
                      aria-describedby="accountPassword"
                      placeholder="Enter"
                      required
                      value={password.value}
                      onChange={(e) => {
                        setPassword({
                          ...password,
                          value: e.target.value,
                        });
                      }}
                    />
                    <label className="text-label" htmlFor="accountPassword">
                      Set Password
                    </label>
                    {password.errors && (
                      <small className="form-error" style={{ color: 'red' }}>
                        {password.errors}
                      </small>
                    )}
                  </div>
                </div>
                <div className="col-8">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      id="accountAddress"
                      aria-describedby="accountAddress"
                      placeholder="Enter"
                      required
                      value={address.value}
                      onChange={(e) => {
                        setAddress({
                          ...address,
                          value: e.target.value,
                        });
                      }}
                    />
                    <label className="text-label" htmlFor="accountAddress">
                      Address
                    </label>
                  </div>
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
};

export default CreateCustomer;
