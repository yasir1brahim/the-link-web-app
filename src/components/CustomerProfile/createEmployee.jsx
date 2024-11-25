import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axiosInstance from '../../config/axios';
import { toast } from 'react-toastify';
// import { Typeahead } from 'react-bootstrap-typeahead';
import { MaskedInput } from '../shared/MaskedInput/maskedInput';
import { handleUserInvitation } from '../../api/Authentication/api';
import handleError from "../../config/errorHandler";
import BaseEmployeeForm from './BaseEmployeeForm';

const CreateEmployee = ({
  modal,
  toggleModal,
  customerID,
  pageRefresh,
  setPageRefresh
}) => {
  const [email, setEmail] = useState({ value: '', errors: '' });
  const [firstName, setFirstName] = useState({ value: '', errors: '' });
  const [lastName, setLastName] = useState({ value: '', errors: '' });

  useEffect(() => {
    if (!modal) {
      setEmail({ value: '', errors: '' });
      setFirstName({ value: '', errors: '' });
      setLastName({ value: '', errors: '' });
    }
  }, [modal]);

  const validate = () => {
    let error = false;
    if (email.value === '') {
      setEmail({ ...email, errors: 'Email is required.' });
      error = true;
    }
    return error;
  };

  const resetForm = () => {
    setEmail({ value: "", errors: "" });
    setFirstName({ value: "", errors: "" });
    setLastName({ value: "", errors: "" });
  };

  const showToast = (message, type = 'success') => {
    const toastConfig = {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };
    if (type === 'success') {
      toast.success(message, toastConfig);
    } else if (type === 'info') {
      toast.info(message, toastConfig);
    } else {
      toast.error(message, toastConfig);
    }
  };
  
  const handleError = (error) => {
    if (error?.response?.data?.message) {
      showToast(error.response.data.message, 'error');
    } else {
      showToast("An unexpected error occurred.", 'error');
    }
  };
  
  const handleSuccess = () => {
    setPageRefresh(!pageRefresh);
    showToast("User created and password reset email sent.");
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (!errors) {
      try {
        const response = await handleUserInvitation(
          email.value,
          firstName.value,
          lastName.value,
          customerID,
          "member"
        );
        if (response?.data) {
          if (response?.data?.message === "User already exists.") {
            showToast("This user has already been invited. A new invitation has been sent.", 'info');
            resetForm();
            toggleModal();
          } else {
            handleSuccess()
            toggleModal();
          }
        }
      } catch (error) {
        handleError(error);
        toggleModal();
      }
    }
  };

  return (
    <BaseEmployeeForm
      formTitle="Add Employee"
      toggleModal={toggleModal}
      modal={modal}
      handleSubmit={handleSubmit}
      validate={validate}
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      email={email}
      setEmail={setEmail}
    />
  );
};

export default CreateEmployee;
