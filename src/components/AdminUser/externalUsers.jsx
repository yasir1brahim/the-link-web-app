import React, { useEffect, useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import axiosInstance from "../../config/axios";
import { toast } from "react-toastify";
import SelectDropdown from '../shared/SelectDropdown/SelectDropdown';

export const ExternalUsers = ({
  customer,
  pageRefresh,
  setPageRefresh,
  externalUserData,
  toggleUpdateList,
  setModalData,
  setSelectedEmployeeList,
}) => {
  const [email, setEmail] = useState({ value: "", errors: "" });
  const [firstName, setFirstName] = useState({ value: "", errors: "" });
  const [lastName, setLastName] = useState({ value: "", errors: "" });
  const [extUser, setExtUser] = useState([]);
  const [extError, setExtError] = useState({});
  const [modal, setModal] = useState(false);
  const toggleModal = () => {
    setModal(!modal);
  };
  const extUserValues = [
    // { value: "owner", label: "Owner" },
    { value: "architect", label: "Architect" },
    { value: "subcontractor", label: "Sub Contractor" },
    // { value: "other", label: "Other" },
  ];
  useEffect(() => {
    if (!modal) {
      setFirstName({ value: "", errors: "" });
      setLastName({ value: "", errors: "" });
      setExtUser([]);
    }
  }, [modal]);
  const validate = () => {
    let error = false;
    if (!extUser.length) {
      setExtError({ ...extError, errors: "Type is required." });
      error = true;
    }
    if (!email.value) {
      setEmail({ ...email, errors: "Email is required." });
      error = true;
    }
    // if (
    //   contactNumber.value.replace(/[^0-9]/g, '').length !== 0 &&
    //   contactNumber.value.replace(/[^0-9]/g, '').length < 10
    // ) {
    //   setContactNumber({
    //     ...contactNumber,
    //     errors: 'Contact Number should be of 10 digits.',
    //   });
    //   error = true;
    // } else if (contactNumber.value.replace(/[^0-9]/g, '').length === 10) {
    //   setContactNumber({
    //     ...contactNumber,
    //     errors: '',
    //   });
    //   error = false;
    // }
    return error;
  };
  const handleSubmit = async () => {
    let errors = validate();
    if (!errors) {
      try {
        const response = await axiosInstance({
          method: "post",
          url: "/admin/external_users",
          data: {
            email_address: email.value,
            full_name: `${firstName.value}  ${lastName.value}`,
            // projects: asscProject.map((project) => project.value),
            // projects: [],
            type: extUser[0]?.value,
            // contact_number: contactNumber.value.replace(/[^0-9]/g, ''),
            customer_id:
              Number(customer?.id) || Number(localStorage.getItem("userId")),
          },
        });
        if (response.data) {
          setPageRefresh(!pageRefresh);
          console.log(response.data);
          toggleModal();
        }
      } catch (error) {
        console.log(error.message);
        toast.error(error.response.data.message, {
          position: "bottom-center",
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
    <>
      <div>
        <Button
          color="primary"
          onClick={() => setModal(true)}
          style={{ float: "right", marginBottom: "10px" }}
        >
          Add External User
        </Button>
      </div>
      <Modal
        isOpen={modal}
        fade={false}
        toggle={toggleModal}
        className="new-user modal-lg"
      >
        <ModalHeader toggle={toggleModal}>Add External User</ModalHeader>
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
                    {email.errors && (
                      <small className="form-error" style={{ color: "red" }}>
                        {email.errors}
                      </small>
                    )}
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <SelectDropdown
                        label={'Set User Type'}
                        setSelected={setExtUser}
                        value={extUser.label}
                        selected={extUser.label}
                        options={extUserValues}
                      />
                    {extError.errors && (
                      <small className="form-error" style={{ color: "red" }}>
                        {extError.errors}
                      </small>
                    )}
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
              </Button>{" "}
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
      <div className="admin-user-content">
        {/* <div className="table-top-content">
                    <label className="table-entries">
                      Showing entries
                      <span className="showing-strong"> 3 </span>
                      of{' '}
                      <span className="showing-strong"> 10</span>.
                    </label>
                  </div> */}
        <div className="l-table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <span>
                    Name <i className=""></i>
                  </span>
                </th>
                <th>
                  <span>
                    Status <i className="sort-d"></i>
                  </span>
                </th>
                <th>
                  <span>
                    Associated Projects <i className="sort-i"></i>
                  </span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {externalUserData?.map((employee) => {
                return (
                  <tr>
                    <td>
                      {/* <a
                        href={() => false}
                        onClick={() => toggleDetailInfo(employee)}
                      > */}
                      {employee.full_name}
                      {/* </a> */}
                    </td>
                    <td>
                      <span className="item-status item-status-active">{`${employee.status.toUpperCase()}`}</span>
                    </td>
                    <td>
                      <div className="tags-wrapper">
                        {employee?.projects?.map((project) => {
                          return (
                            <span className="item-tag">
                              {project?.name ? project?.name : project[1]}
                              {/* <a className="icon-close"></a>  */}
                            </span>
                          );
                        })}
                        {/* {employee?.projects}  */}
                      </div>
                    </td>
                    <td>
                      <div className="action-wrapper">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            toggleUpdateList();
                            setModalData(employee);
                            setSelectedEmployeeList(
                              employee.projects?.length
                                ? employee.projects?.map((project) =>
                                    Number(project.id)
                                  )
                                : []
                            );
                          }}
                        >
                          Add Projects
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>{" "}
      </div>
    </>
  );
};
