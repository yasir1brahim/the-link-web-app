import React, { useState } from 'react';
import { ReactComponent as User } from '../../assets/images/user.svg';
import { ReactComponent as Keys } from '../../assets/images/keys.svg';
import { ReactComponent as ArrowLeft } from '../../assets/images/arrow-left.svg';
import 'react-toastify/dist/ReactToastify.css';
import { ReactComponent as ReactLogo } from '../../assets/images/logo-dark-v7.svg';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axios';
import { toast, ToastContainer } from 'react-toastify';

const Forgotpwd = (props) => {
  const [email, setEmail] = useState({ value: '', errors: '' });
  const navigate = useNavigate();
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
          url: '/forgot_password',
          data: {
            email: email.value
          }
        });
        if (response.data) {
          console.log(response.data);
        }
        navigate('/check-email');
      } catch (error) {
        toast.error('Incorrect Email.', {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
      }
    }
  };
  return (
    <section className="authentication-content-wrapper">
      <div className="ac-left">
        <a href="/" className="company-branding">
          <ReactLogo />
        </a>
      </div>
      <div className="ac-right">
        <form className="forgot-form">
          <span className="iconheading">
            <Keys />
          </span>
          <h1 className="form-heading heading-two">Forgot Password?</h1>
          <p className="form-info">
            No worries, we’ll send you reset instructions.
          </p>
          <div className="form-group">
            <label className="text-label" htmlFor="loginEmail">
              Email
            </label>
            <input
              type="text"
              className="form-control"
              id="loginEmail"
              aria-describedby="loginEmail"
              placeholder="Enter your email or username"
              required
              onChange={(e) => {
                setEmail({ ...email, value: e.target.value });
              }}
            />
            <i className="iconinput inputuser">
              <User />
            </i>
            {email.errors && (
              <small className="form-error">{email.errors}</small>
            )}
          </div>
          <div className="form-group form-btn">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={handleSubmit}
            >
              Reset password
            </button>
          </div>
          <div className="form-helping-text">
            <a
              className="d-flex align-items-center justify-content-center"
              href="/login"
            >
              <ArrowLeft />
              Back to log in
            </a>
          </div>
        </form>
      </div>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </section>
  );
};

export default Forgotpwd;
