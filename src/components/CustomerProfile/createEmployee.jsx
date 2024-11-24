import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axiosInstance from '../../config/axios';
import { toast } from 'react-toastify';
// import { Typeahead } from 'react-bootstrap-typeahead';
import { MaskedInput } from '../shared/MaskedInput/maskedInput';
import { sendInvitation } from '../../api/Authentication/api';
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

  const validate = () => {
    let error = false;
    if (email.value === '') {
      setEmail({ ...email, errors: 'Email is required.' });
      error = true;
    }
    return error;
  };

  const handleSubmit = async () => {
    let errors = validate();
    if (!errors) {
      try {
        console.log("selected role", role);
        const response = await sendInvitation(
          email.value,
          customerID,
          role[0].value
        );
        if (response?.data) {
          console.log(response?.data);
          setPageRefresh(!pageRefresh);
          toggleModal();
          toast.success('Invite sent', {
            position: 'bottom-center'
          });
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
      role={role}
      setRole={setRole}
    />
  );
};

export default CreateEmployee;
