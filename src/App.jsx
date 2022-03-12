import './App.scss';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Authentication from './components/Authentication/Authentication';
import AdminLanding from './components/AdminLanding/AdminLanding';
import { createBrowserHistory } from 'history';
import CustomerProfile from './components/CustomerProfile/CustomerProfile';
import CustomerProjects from './components/CustomerProjects/CustomerProjects';

function App() {
  const history = createBrowserHistory();
  return (
    <div className="the-link">
      {/* <Authentication /> */}
      {/* <NavbarTop /> */}
      {/* <AdminLanding/> */}
      {/* <CustomerProfile/> */}
      {/* <CustomerProjects /> */}
      <Router history={history}>
        <Switch>
          <Route exact path="/admin-landing" component={AdminLanding} />
          <Route component={Authentication} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
