import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { ReactComponent as ReactLogo } from '../../assets/images/logo.svg';
import Signin from './Signin';
import SignUp from './Signup';
import Forgotpwd from './Forgotpwd';
import Checkemail from './Checkemail';
import Resetpwd from './Resetpwd';
import Resetsuccess from './Resetsuccess';

const Authentication = () => {
  return (
    <Router>
      <section className="authentication-content-wrapper">
        <div className="ac-left">
          <a href="#" className="company-branding">
            <ReactLogo />
          </a>
        </div>
        <div className="ac-right">
          <Switch>
            <Route path="/login" component={Signin} />
            <Route path="/sign-up" component={SignUp} />
            <Route path="/forgot-password" component={Forgotpwd} />
            <Route path="/reset-password" component={Resetpwd} />
            <Route path="/reset-success" component={Resetsuccess} />
            <Route path="/check-email" component={Checkemail} />
            <Route
              exact
              path="/"
              render={(props) => {
                return <Redirect to="/login" />;
              }}
            />
          </Switch>
        </div>
      </section>
    </Router>
  );
};

export default Authentication;
