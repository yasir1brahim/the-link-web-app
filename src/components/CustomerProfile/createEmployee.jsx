import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';
import { ReactComponent as AddUser } from '../../assets/images/circle-add.svg';
import axiosInstance from '../../config/axios';
import { toast } from 'react-toastify';

const CreateEmployee = ({ modal, toggleModal, customer }) => {
  const [email, setEmail] = useState({ value: '', errors: '' });
  const [firstName, setFirstName] = useState({ value: '', errors: '' });
  const [lastName, setLastName] = useState({ value: '', errors: '' });
  const [contactNumber, setContactNumber] = useState({ value: '', errors: '' });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setEmail({ value: '', errors: '' });
    const fetchData = async () => {
      const response = await axiosInstance({
        method: 'get',
        url: `/projects/${customer.customer_id}`,
      });
      setProjects(response.data.message);
    };

    fetchData().catch(console.error);
  }, []);

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
        const response = await axiosInstance({
          method: 'post',
          url: '/createEmployee',
          data: {
            email_address: email.value,
            full_name: `${firstName.value}  ${lastName.value}`,
            projects: projects,
            contact_number: contactNumber.value,
            customer_id: customer.customer_id,
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
      className="new-user modal-lg"
    >
      <ModalHeader toggle={toggleModal}>Add User/Employee</ModalHeader>
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
                        value: e.target.value,
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
                        value: e.target.value,
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
                        value: e.target.value,
                      });
                    }}
                  />
                  <label className="text-label" htmlFor="userEmailAddress">
                    Email Address
                  </label>
                </div>
              </div>
              <div className="col-4">
                <div className="form-group">
                  <input
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
                  />
                  <label className="text-label" htmlFor="userPhone">
                    Phone
                  </label>
                </div>
              </div>
              <div className="col-4">
                <div className="form-group">
                  <SelectDropdown
                    label={'Projects Associated'}
                    labelKey="name"
                    options={projects.map((project) => {
                      return {
                        value: project.project_id,
                        label: project.project_name,
                      };
                    })}
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
              Create
            </Button>{' '}
          </ModalFooter>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default CreateEmployee;
