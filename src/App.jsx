import './App.scss';
import { Route, Routes, Navigate } from 'react-router-dom';
import Authentication from './components/Authentication/Authentication';
import AdminLanding from './components/AdminLanding/AdminLanding';
import CustomerProfile from './components/CustomerProfile/CustomerProfile';
// import CustomerProjects from './components/CustomerProjects/CustomerProjects';
import Signin from './components/Authentication/Signin';
import SignUp from './components/Authentication/Signup';
import Forgotpwd from './components/Authentication/Forgotpwd';
import Resetpwd from './components/Authentication/Resetpwd';
import Resetsuccess from './components/Authentication/Resetsuccess';
import Checkemail from './components/Authentication/Checkemail';
// import ProjectsDetails from './components/ProjectDetails/ProjectDetails';
import ProjectLogs from './components/ProjectLogs/ProjectLogs';
import PdfWrapper from './pdfWrapper';
import AdminUser from './components/AdminUser/AdminUser';
import SubmittalMappings from './components/ProjectLogs/submittalMappings';
// import PersonalProject from './components/PersonalProject/PersonalProject';
import Projects from './components/PersonalProject/projects';
import CollaborationHub from './components/CollaborationHub';
import { SpecGpt } from './components/SpecGpt';

function App() {
  return (
    <div className="the-link">
      <Routes>
        <Route element={<Authentication />} />
        <Route path="/admin-landing" element={<AdminLanding />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/project-list" element={<Projects />} />
        <Route path="/project-logs" element={<ProjectLogs />} />
        {/*<Route path="/project-details" element={<ProjectsDetails />} />*/}
        <Route path="/login" element={<Signin />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<Forgotpwd />} />
        <Route path="/reset-password" element={<Resetpwd />} />
        <Route path="/reset-success" element={<Resetsuccess />} />
        <Route path="/check-email" element={<Checkemail />} />
        <Route path="/pdf-view" element={<PdfWrapper />} />
        <Route path="/admin-user" element={<AdminUser />} />
        <Route path="/submital-mappings" element={<SubmittalMappings />} />
        <Route path="/collaboration-hub" element={<CollaborationHub />} />
        <Route path="/spec-gpt" element={<SpecGpt />} />
        {/* <Route path="/personal-project" element={<PersonalProject />} /> */}

        <Route exact path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
