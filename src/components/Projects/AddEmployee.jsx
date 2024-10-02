import React, { useState } from "react";
import { Button, ModalFooter } from "reactstrap";
import axiosInstance from "../../config/axios";
import { toast } from "react-toastify";
import Loader from "../shared/Loader/Loader";
import { sendInvitation } from "../../api/Authentication/api";

export const AddEmployee = (props) => {
  const [email, setEmail] = useState({ value: "", errors: "" });
  const [firstName, setFirstName] = useState({ value: "", errors: "" });
  const [lastName, setLastName] = useState({ value: "", errors: "" });
  const [isLoading, setIsLoading] = useState(false);
  const validate = () => {
    let error = false;
    if (email.value === "") {
      setEmail({ ...email, errors: "Email is required." });
      error = true;
    }
    return error;
  };

  const handleSubmit = async () => {
    let errors = validate();
    if (!errors) {
      try {
        setIsLoading(true);
        const response = await sendInvitation(email.value, props.customerID || localStorage.getItem("currentTeamId"));
        if (response.data) {
          console.log(response.data);
          const employee_id = response.data.data.user_id;
          //   setPageRefresh(!pageRefresh);
          //   toggleModal();
          setIsLoading(false);
          setEmail({ value: "", errors: "" });
          setFirstName({ value: "", errors: "" });
          setLastName({ value: "", errors: "" });
          props.setSelectedEmployeeList([...props.selectedEmployeeList, {label: `${firstName.value}  ${lastName.value}`, value: employee_id}])
          props.openEmpForm(false);
          props.setRefetchEmp(true);
          toast.success("Added a new employee.");
        }
      } catch (error) {
        setIsLoading(false);
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
        // toggleModal();
      }
    }
  };
  return (
    <div className="new-employee-table">
      {/* <div className="col-4">
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
      </div> */}
      <div className="content-delete">
        <p className="content">New Employee</p>
        <svg
          onClick={() => {
            props.openEmpForm(false);
            setEmail({ value: "", errors: "" });
            setFirstName({ value: "", errors: "" });
            setLastName({ value: "", errors: "" });
          }}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.125 5.55556L15.3661 16.3489C15.3007 17.2792 14.5387 18 13.6205 18H6.37946C5.46134 18 4.69932 17.2792 4.63391 16.3489L3.875 5.55556M8.25 9.11111V14.4444M11.75 9.11111V14.4444M12.625 5.55556V2.88889C12.625 2.39797 12.2332 2 11.75 2H8.25C7.76675 2 7.375 2.39797 7.375 2.88889V5.55556M3 5.55556H17"
            stroke="#0E2332"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <form>

      <div style={{ gap: "20px" }} className="d-flex create-project-form create-project-content">
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
          <label htmlFor="userFirstName">
            First Name
          </label>
        </div>
      </div>
      <div>
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
      <Button color="primary" onClick={handleSubmit}>
        Create
      </Button>{" "}
      </form>
      {isLoading && <Loader showComponentLoader={true} />}
    </div>
  );
};
