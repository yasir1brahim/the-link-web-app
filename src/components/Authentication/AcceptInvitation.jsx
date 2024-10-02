import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as User } from '../../assets/images/user.svg';
import { ReactComponent as Mail } from '../../assets/images/mail.svg';
import { ReactComponent as Eyeshow } from '../../assets/images/eye-show.svg';
import { ReactComponent as Eyehide } from '../../assets/images/eye-hide.svg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactComponent as ReactLogo } from '../../assets/images/logo-dark-v7.svg';
import { login, getUserTeams, register, acceptInvitation } from '../../api/Authentication/api'
import { AuthContext } from '../../auth/authcontext';
import { getInvitation } from '../../api/Authentication/api'
import handleError from '../../config/errorHandler';



const AcceptInvitation = (props) => {
  const { setUserDetails, isAuthenticated } = useContext(AuthContext);
  const search = window.location.search;
  const queryParams = new URLSearchParams(search);
  const teamId = queryParams.get('team_id');
  const invitationId = queryParams.get('invitation_id');

  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [teamName, setTeamName] = useState('');
  const [invitedBy, setInvitedBy] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const toggleType = () => setShowPwd(!showPwd);
  const history = useNavigate();

  const validate = () => {
    let error = false;
    if (password1.value === '') {
      setPassword1({ ...password1, errors: 'Password is required.' });
      error = true;
    }
    if (password2.value === '') {
      setPassword2({ ...password2, errors: 'Password is required.' });
      error = true;
    }
    return error;
  };

  useEffect(() => {
    console.log(teamId, invitationId);
    const fetchInvitation = async () => {
      const response = await getInvitation(teamId, invitationId).catch((error) => {
        console.log("error", error);
        toast.error("Invalid invitation link");
      });
      console.log("response",response);
      setEmail(response.data.email);
      setInvitedBy(response.data.invited_by);
    }
    if (teamId && invitationId) {
      fetchInvitation();
    } else {
      toast.error("Invalid invitation link");
    }
    if (isAuthenticated) {
        console.log("isAuthenticated, accepting invitation");
        acceptInvitationAndRedirect();
    }
  }, [teamId, invitationId]);

  const acceptInvitationAndRedirect = async () => {
    const invitationResponse = await acceptInvitation(teamId, invitationId);
    console.log("accept invitation response", invitationResponse);
    // show success toast
    toast.success("Registration successful");
    // redirect to login page
    return history({ pathname: `/project-list/${teamId}` });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = validate();
    console.log("errors", errors);
    if (!errors) {
      const response = await register(email, password1, password2).catch((error) => {
        console.log("error", error);
        toast.error("Registration failed");
      });
      console.log("register response", response);
      setUserDetails(response.data);
      acceptInvitationAndRedirect();
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
        <form className="signup-form">
          <h1 className="form-heading">Sign Up</h1>
          <p className="form-info">
            Welcome to The Link Submittal Log Manager. You've been invited by {invitedBy || 'a user'} to join {teamName || 'their team'}.
          </p>

          <div className="form-group">
            <label className="text-label">Email Address</label>
            <input
              type="text"
              className="form-control"
              id="email"
              aria-describedby="email"
              placeholder="Email Address"
              readOnly
              value={email}
            />
            <i className="iconinput inputuser">
              <Mail />
            </i>
          </div>
          <div className="form-group">
            <label className="text-label">First Name</label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              aria-describedby="firstName"
              placeholder="First Name"
              required
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
            />
            <i className="iconinput inputuser">
              <User />
            </i>
          </div>
          <div className="form-group">
            <label className="text-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              aria-describedby="lastName"
              placeholder="Last Name"
              required
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
              }}
            />
            <i className="iconinput inputuser">
              <User />
            </i>
          </div>
          <div className="form-group">
            <label className="text-label">Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-control"
              id="password"
              aria-describedby="password"
              placeholder="Password"
              required
              value={password1}
              onChange={(e) => {
                setPassword1(e.target.value);
              }}
            />
            <div className="iconinput inputpwd" onClick={toggleType}>
              {showPwd ? <Eyeshow /> : <Eyehide />}
            </div>
          </div>
          <div className="form-group">
            <label className="text-label">Confirm Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-control"
              id="confirmPassword"
              aria-describedby="confirmPassword"
              placeholder="Confirm Password"
              required
              value={password2}
              onChange={(e) => {
                setPassword2(e.target.value);
              }}
            />
            <div className="iconinput inputpwd" onClick={toggleType}>
              {showPwd ? <Eyeshow /> : <Eyehide />}
            </div>
          </div>
          <div className="form-group form-btn">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={handleSubmit}
            >
              Sign Up
            </button>
          </div>
          <div className="form-helping-text">
            <p>
              Already have an account? <a href="/login">Login</a>
            </p>
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

export default AcceptInvitation;
