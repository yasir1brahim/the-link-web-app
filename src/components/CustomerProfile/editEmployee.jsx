import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BaseEmployeeForm from './BaseEmployeeForm';
import { updateUserTeamMembership } from '../../api/Authentication/api';

const EditEmployee = ({
  modal,
  toggleModal,
  customerID,
  employee,
  pageRefresh,
  setPageRefresh,
  empData
}) => {
  const [email, setEmail] = useState({
    value: employee?.email || "",
    errors: ''
  });
  const [firstName, setFirstName] = useState({ value: employee?.first_name || '', errors: '' });
  const [lastName, setLastName] = useState({ value: employee?.last_name || '', errors: '' });

  useEffect(() => {
    setEmail({ value: employee?.email || '', errors: '' });
    setFirstName({ value: employee?.first_name || '', errors: '' });
    setLastName({ value: employee?.last_name || '', errors: '' });
  }, [modal, employee]);

  const validate = () => {
    let error = false;
    if (email?.value === '') {
      setEmail({ ...email, errors: 'Email is required.' });
      error = true;
    } else if (empData?.find((item) => item?.email === email?.value)) {
      setEmail({ ...email, errors: 'Email already exists' });
      error = true;
    } else {
      setEmail({ ...email, errors: '' });
      error = false;
    }
    return error;
  };

  const handleSubmit = async () => {
    let errors = validate();
    if (!errors) {
      try {
        const response = await updateUserTeamMembership(employee?.id, 'member');
        if (response.data) {
          console.log(response.data);
          setPageRefresh(!pageRefresh);
          toggleModal();
          toast.success('Employee edited successfully!', {
            position: 'bottom-center',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined
          });
        }
      } catch (error) {
        console.log(error.message);
        toast.error(error.response.data.message, {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
        toggleModal();
      }
    }
  };
  return (
    <BaseEmployeeForm
      formTitle="Edit Employee"
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

export default EditEmployee;
