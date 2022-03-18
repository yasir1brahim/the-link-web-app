import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ReactComponent as ReactLogo } from '../../assets/images/logo.svg';
import Signin from './Signin';
import SignUp from './Signup';
import Forgotpwd from './Forgotpwd';
import Checkemail from './Checkemail';
import Resetpwd from './Resetpwd';
import Resetsuccess from './Resetsuccess';

const Authentication = () => {
  return (
    <section className="authentication-content-wrapper">
      <div className="ac-left">
        <a href="/" className="company-branding">
          <ReactLogo />
        </a>
      </div>
      <div className="ac-right">
        <Routes>
          <Route path="/login" element={<Signin />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<Forgotpwd />} />
          <Route path="/reset-password" element={<Resetpwd />} />
          <Route path="/reset-success" element={<Resetsuccess />} />
          <Route path="/check-email" element={<Checkemail />} />
          <Route
            exact
            path="/"
            render={(props) => {
              return <Navigate to="/login" />;
            }}
          />
        </Routes>
      </div>
    </section>
  );
};

export default Authentication;
