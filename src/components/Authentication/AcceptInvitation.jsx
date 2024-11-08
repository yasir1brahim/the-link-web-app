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
  const [newPassword, setNewPassword] = useState({ value: '', errors: '' });
  const [confirmPassword, setConfirmPassword] = useState({ value: '', errors: '' });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const toggleType = () => setShowPwd(!showPwd);
  const history = useNavigate();

  const validate = () => {
    let error = false;
    if (newPassword.value === '') {
      setNewPassword({ ...newPassword, errors: 'Password is required.' });
      error = true;
    }
    if (confirmPassword.value === '') {
      setConfirmPassword({ ...confirmPassword, errors: 'Password is required.' });
      error = true;
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
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
        try {
          const invitationResponse = await acceptInvitation(teamId, invitationId);
          console.log("accept invitation response", invitationResponse);
          toast.success("Registration successful");
          history({ pathname: `/project-list/${teamId}` });
        } catch (error) {
          console.log("error", error);
          toast.error("Failed to accept invitation.");
        }
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
          try {
            const response = await register(email, newPassword, confirmPassword);
            setUserDetails(response.data);
            acceptInvitationAndRedirect();
          } catch (error) {
            console.log("error", error);
            toast.error(error.response?.data?.message || "Registration failed");
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
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
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
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
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
