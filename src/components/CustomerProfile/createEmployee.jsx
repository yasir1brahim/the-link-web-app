import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axiosInstance from '../../config/axios';
import { toast } from 'react-toastify';
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
  const [role, setRole] = useState([{ value: 'member', label: 'Member' }]);

  useEffect(() => {
    if (!modal) {
      setEmail({ value: '', errors: '' });
      setFirstName({ value: '', errors: '' });
      setLastName({ value: '', errors: '' });
      setRole([{ value: 'member', label: 'Member' }]);
    }
  }, [modal]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validate = () => {
    let error = false;
    if (email.value === '') {
      setEmail({ ...email, errors: 'Email is required.' });
      error = true;
    } else if (!validateEmail(email.value)) {
      setEmail({ ...email, errors: 'Invalid email format.' });
      error = true;
    }
    if (firstName.value === '') {
      setFirstName({ ...firstName, errors: 'First Name is required.' });
      error = true;
    }
    if (lastName.value === '') {
      setLastName({ ...lastName, errors: 'Last Name is required.' });
      error = true;
    }
    return error;
  };

  const resetForm = () => {
    setEmail({ value: "", errors: "" });
    setFirstName({ value: "", errors: "" });
    setLastName({ value: "", errors: "" });
    setRole([{ value: 'member', label: 'Member' }]);
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
  
  const handleSuccess = (message) => {
    setPageRefresh(!pageRefresh);
    showToast(message || "User created successfully. A password reset email has been sent.");
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
          role[0].value
        );
        console.log("Invitation response:", response?.data);
        if (response?.data) {
          if (response?.data?.message === "User has been added to the company. A notification email has been sent.") {
            showToast("User has been added to the company. A notification email has been sent.", 'success');
            setPageRefresh(!pageRefresh);
            resetForm();
            toggleModal();
          } else if (response?.data?.message === "User created successfully. A password reset email has been sent.") {
            handleSuccess(response.data.message);
            resetForm();
            toggleModal();
          } else {
            // Fallback for any other successful response
            showToast(response.data.message || "User invitation processed successfully.", 'success');
            setPageRefresh(!pageRefresh);
            resetForm();
            toggleModal();
          }
        }
      } catch (error) {
        handleError(error);
        // Don't close modal on error, let user fix the issue
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
      role={role}
      setRole={setRole}
    />
  );
};

export default CreateEmployee;