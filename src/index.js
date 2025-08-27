import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import './App.scss';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './auth/authprovider';
import { FeatureFlagsProvider } from './contexts/FeatureFlagsContext';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './components/ErrorPage';
import Signin from './components/Authentication/Signin';
import SignUp from './components/Authentication/Signup';
import Forgotpwd from './components/Authentication/Forgotpwd';
import Resetpwd from './components/Authentication/Resetpwd';
import Resetsuccess from './components/Authentication/Resetsuccess';
import Checkemail from './components/Authentication/Checkemail';
import PdfWrapper from './pdfWrapper';
import SubmittalMappings from './components/ProjectLogs/submittalMappings';
import ProjectsPage from './components/Projects/ProjectsPage';
import CollaborationHub from './components/CollaborationHub';
import AdminLanding from './components/AdminLanding/AdminLanding';
import CustomerProfile from './components/CustomerProfile/CustomerProfile';
import ProjectLogs from './components/ProjectLogs/ProjectLogs';
import ProtectedRoute from './components/auth/protectedroute';
import Companies from './components/Companies/Companies';
import AcceptInvitation from './components/Authentication/AcceptInvitation';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import NoticesPage from './components/Notices/NoticesPage';
import LoadingPage from './components/LoadingPage';
import FullSpecPage from './components/FullSpecProcessing/FullSpecPage';
import TheLinkMicrosoftLoginCallback from './components/Authentication/TheLinkMicrosoftLoginCallback';
import EllisDonMicrosoftLoginCallback from './components/Authentication/EllisDonMicrosoftLoginCallback';
import SSODisambiguationPage from './components/Authentication/SSODisambiguationPage';
import ChatPage from './components/SpecGpt/containers/ChatPage';
import ViewPDFPage from './components/SpecGpt/containers/ViewPDFPage';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LoadingPage/>
    ),
    errorElement: <NotFoundPage />,
  },
  {
    path: "/login",
    element: <ErrorBoundary><Signin /></ErrorBoundary>,
  },
  {
    path: "/login/sso",
    element: <ErrorBoundary><SSODisambiguationPage /></ErrorBoundary>,
  },
  {
    path: "/the_link/microsoft/login/callback",
    element: <ErrorBoundary><TheLinkMicrosoftLoginCallback /></ErrorBoundary>,
  },
  {
    path: "/ellisdon/microsoft/login/callback",
    element: <ErrorBoundary><EllisDonMicrosoftLoginCallback /></ErrorBoundary>,
  },
  {
    path: "/not-found",
    element: <NotFoundPage />,
  },
  // {
  //   path: "/sign-up",
  //   element: <SignUp />,
  // },
  {
    path: "/accept-invitation",
    element: <ErrorBoundary><AcceptInvitation /></ErrorBoundary>,
  },
  {
    path: "/forgot-password",
    element: <ErrorBoundary><Forgotpwd /></ErrorBoundary>,
  },
  {
    path: "/password-reset/confirm/:uidb64/:token",
    element: <ErrorBoundary><Resetpwd /></ErrorBoundary>,
  },
  {
    path: "/reset-success",
    element: <ErrorBoundary><Resetsuccess /></ErrorBoundary>,
  },
  {
    path: "/check-email",
    element: <ErrorBoundary><Checkemail /></ErrorBoundary>,
  },
  {
    path: "/pdf-view",
    element: <ErrorBoundary><ProtectedRoute><PdfWrapper /></ProtectedRoute></ErrorBoundary>,
  },
  { 
    path: "/submittal-mappings",
    element: <ErrorBoundary><ProtectedRoute><SubmittalMappings /></ProtectedRoute></ErrorBoundary>,
  },
  {
    path: "/collaboration-hub",
    element: <ErrorBoundary><ProtectedRoute><CollaborationHub /></ProtectedRoute></ErrorBoundary>,
  },
  {
    path: "/project-list/:teamId",
    element: <ErrorBoundary><ProtectedRoute><ProjectsPage /></ProtectedRoute></ErrorBoundary>,
  },
  {
    path: "/companies",
    element: <ErrorBoundary><ProtectedRoute><Companies /></ProtectedRoute></ErrorBoundary>,
  },
  {
    path: "/project-logs",
    element: <ErrorBoundary><ProtectedRoute><ProjectLogs /></ProtectedRoute></ErrorBoundary>,
  },
  {
    path: "/notices",
    element: <ErrorBoundary><ProtectedRoute><NoticesPage /></ProtectedRoute></ErrorBoundary>,
  },
  {
    path: "/full-spec",
    element: <ErrorBoundary><ProtectedRoute><FullSpecPage /></ProtectedRoute></ErrorBoundary>,
  },
  {
    path: "/admin-landing",
    element: <ErrorBoundary><ProtectedRoute><AdminLanding /></ProtectedRoute></ErrorBoundary>,
  },
  {
    path: "/company-profile",
    element: <ErrorBoundary><ProtectedRoute><CustomerProfile /></ProtectedRoute></ErrorBoundary>,
  },
  {
    path: "/view-pdf",
    element: <ErrorBoundary><ProtectedRoute><ViewPDFPage /></ProtectedRoute></ErrorBoundary>,
  },
])


ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <FeatureFlagsProvider>
          <RouterProvider router={router} />
        </FeatureFlagsProvider>
      </AuthProvider>
    </ErrorBoundary>
   </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
