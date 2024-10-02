import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axiosInstance from '../../config/axios';
import { toast } from 'react-toastify';
// import { Typeahead } from 'react-bootstrap-typeahead';
import { MaskedInput } from '../shared/MaskedInput/maskedInput';
import { sendInvitation } from '../../api/Authentication/api';
import handleError from "../../config/errorHandler";

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
  const [contactNumber, setContactNumber] = useState({ value: '', errors: '' });
  // const [projects, setProjects] = useState([]);
  // const [asscProject, setAsscProject] = useState([]);

  // useEffect(() => {
  //   setEmail({ value: '', errors: '' });
  //   const fetchData = async () => {
  //     const response = await axiosInstance({
  //       method: 'get',
  //       url: `/projects/${customer.customer_id}`,
  //     });
  //     setProjects(response.data.message);
  //   };
  //   fetchData().catch(console.error);
  // }, [customer]);
  useEffect(() => {
    if (!modal) {
      setEmail({ value: '', errors: '' });
      setFirstName({ value: '', errors: '' });
      setLastName({ value: '', errors: '' });
      setContactNumber({ value: '', errors: '' });
    }
  }, [modal]);

  const validate = () => {
    let error = false;
    if (email.value === '') {
      setEmail({ ...email, errors: 'Email is required.' });
      error = true;
    }
    if (
      contactNumber.value.replace(/[^0-9]/g, '').length !== 0 &&
      contactNumber.value.replace(/[^0-9]/g, '').length < 10
    ) {
      setContactNumber({
        ...contactNumber,
        errors: 'Contact Number should be 10 digits long.'
      });
      error = true;
    } else if (contactNumber.value.replace(/[^0-9]/g, '').length === 10) {
      setContactNumber({
        ...contactNumber,
        errors: ''
      });
      error = false;
    }
    return error;
  };

  const handleContactNumberChange = (e) => {
    let value = contactNumber.value.replace(/[^0-9]/g, '');
    let regex = /^[0-9]*$/;
    if (regex.test(value)) {
      setContactNumber({
        ...contactNumber,
        value: e.target.value
      });
    }
  };

  const handleSubmit = async () => {
    let errors = validate();
    if (!errors) {
      try {
        const response = await sendInvitation(
          email.value,
          customerID,
          'member'
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
    <Modal
      isOpen={modal}
      fade={false}
      toggle={toggleModal}
      className="new-user modal-lg"
    >
      <ModalHeader toggle={toggleModal}>Add Employee</ModalHeader>
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
                  <MaskedInput
                    value={contactNumber.value}
                    onChange={(e) => handleContactNumberChange(e)}
                    name="contactNumber"
                    error={contactNumber.errors}
                    mask={[
                      '(',
                      /[1-9]/,
                      /\d/,
                      /\d/,
                      ')',
                      ' ',
                      /\d/,
                      /\d/,
                      /\d/,
                      '-',
                      /\d/,
                      /\d/,
                      /\d/,
                      /\d/
                    ]}
                    labelClass={'text-label'}
                    label={'Phone'}
                  />
                </div>
              </div>
              {/* <div className="col-4">
                <div className="form-group">
                  <Typeahead
                    multiple
                    value={asscProject}
                    selected={asscProject}
                    onChange={setAsscProject}
                    options={projects.map((project) => {
                      return {
                        value: project.project_id,
                        label: project.project_name,
                      };
                    })}
                    placeholder="Projects Associated"
                  />
                </div>
              </div> */}
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

export default CreateEmployee;
