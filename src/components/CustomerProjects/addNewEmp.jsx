import React, { useState } from 'react';
import { Button, ModalFooter } from 'reactstrap';
import axiosInstance from '../../config/axios';
import { toast } from 'react-toastify';
import Loader from '../shared/Loader/Loader';

export const AddNewEmp = (props) => {
  const [email, setEmail] = useState({ value: '', errors: '' });
  const [firstName, setFirstName] = useState({ value: '', errors: '' });
  const [lastName, setLastName] = useState({ value: '', errors: '' });
  const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);
        const response = await axiosInstance({
          method: 'post',
          url: '/createEmployee',
          data: {
            email_address: email.value,
            full_name: `${firstName.value}  ${lastName.value}`,
            // projects: asscProject.map((project) => project.value),
            projects: [],
            // contact_number: contactNumber.value.replace(/[^0-9]/g, ''),
            customer_id:
              props.customer?.customer_id || localStorage.getItem('userId')
          }
        });
        if (response.data) {
          console.log(response.data);
          //   setPageRefresh(!pageRefresh);
          //   toggleModal();
          setIsLoading(false);
          setEmail({ value: '', errors: '' });
          setFirstName({ value: '', errors: '' });
          setLastName({ value: '', errors: '' });
          props.openEmpForm(false);
          props.setRefetchEmp(true);
          toast.success('Added a new employee.');
        }
      } catch (error) {
        setIsLoading(false);
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
        // toggleModal();
      }
    }
  };
  return (
    <>
      <div className="col-12">
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => {
              props.openEmpForm(false);
              setEmail({ value: '', errors: '' });
              setFirstName({ value: '', errors: '' });
              setLastName({ value: '', errors: '' });
            }}
          >
            Close
          </Button>
          <Button color="primary" onClick={handleSubmit}>
            Create Employee
          </Button>{' '}
        </ModalFooter>
      </div>
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
      {isLoading && <Loader showComponentLoader={true} />}
    </>
  );
};
