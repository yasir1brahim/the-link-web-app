import './App.scss';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import Authentication from './components/Authentication/Authentication';
import NavbarTop from './components/shared/NavbarTop/NavbarTop';
import Signin from './components/Authentication/Signin';
import SignUp from './components/Authentication/Signup';
import Forgotpwd from './components/Authentication/Forgotpwd';
import Resetpwd from './components/Authentication/Resetpwd';
import Resetsuccess from './components/Authentication/Resetsuccess';
import Checkemail from './components/Authentication/Checkemail';
import AdminLanding from './components/AdminLanding/AdminLanding';
import CustomerProfile from './components/CustomerProfile/CustomerProfile';
import CustomerProjects from './components/CustomerProjects/CustomerProjects';

function App() {
  return (
    <div className="the-link">
      {/* <Authentication /> */}
      {/* <NavbarTop /> */}
      {/* <AdminLanding/> */}
      {/* <CustomerProfile/> */}
      <CustomerProjects />
      {/* <Router>
        <Switch>
          <Route component={Authentication} />
          <Route path="/admin-landing" component={AdminLanding} />
        </Switch>
      </Router> */}
    </div>
  );
}

export default App;
