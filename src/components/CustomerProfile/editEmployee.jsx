import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axiosInstance from '../../config/axios';
import { toast } from 'react-toastify';
// import { Typeahead } from 'react-bootstrap-typeahead';
import { MaskedInput } from '../shared/MaskedInput/maskedInput';

const EditEmployee = ({
  modal,
  toggleModal,
  customer,
  employee,
  pageRefresh,
  setPageRefresh,
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

  // const validate = () => {
  //   let error = false;
  //   if (email.value === '') {
  //     setEmail({ ...email, errors: 'Email is required.' });
  //     error = true;
  //   }
  //   return error;
  // };
  const handleContactNumberChange = (e) => {
    let value = contactNumber.value.replace(/[^0-9]/g, '');
    let regex = /^[0-9]*$/;
    if (regex.test(value)) {
      setContactNumber({
        ...contactNumber,
        value: e.target.value,
      });
    }
  };

  const handleSubmit = async () => {
    // let errors = validate();
    // if (!errors) {
    try {
      const response = await axiosInstance({
        method: 'put',
        url: '/updateEmployee',
        data: {
          email_address: email.value || employee?.emp_email,
          full_name: `${firstName.value || employee?.name.split(/(\s+)/)[0]}  ${
            lastName.value || employee?.name.split(/(\s+)/)[0]
          }`,
          // projects: asscProject.map((project) => project.value),
          projects: [],
          contact_number: contactNumber.value.replace(/[^0-9]/g, ''),
          customer_id: customer.customer_id,
          employee_id: employee?.emp_id,
        },
      });
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
          progress: undefined,
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
        progress: undefined,
      });
      toggleModal();
    }
    // }
  };
  return (
    <Modal
      isOpen={modal}
      fade={false}
      toggle={toggleModal}
      className="new-user modal-lg"
    >
      <ModalHeader toggle={toggleModal}>Edit Employee</ModalHeader>
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
                    defaultValue={
                      employee?.name ? employee?.name.split(/(\s+)/)[0] : ''
                    }
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
                    defaultValue={
                      employee?.name ? employee?.name.split(/(\s+)/)[2] : ''
                    }
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
                    defaultValue={employee.emp_email}
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
                  {/* <input
                    type="text"
                    className="form-control"
                    id="userPhone"
                    aria-describedby="userPhone"
                    placeholder="Enter"
                    defaultValue={employee.contact_number}
                    onChange={(e) => {
                      setContactNumber({
                        ...contactNumber,
                        value: e.target.value,
                      });
                    }}
                  />
                  <label className="text-label" htmlFor="userPhone">
                    Phone
                  </label> */}
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
                      /\d/,
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

export default EditEmployee;
