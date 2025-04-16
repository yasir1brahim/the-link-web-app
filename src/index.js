import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import './App.scss';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './auth/authprovider';
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
    element: <Signin />,
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
    element: <AcceptInvitation />,
  },
  {
    path: "/forgot-password",
    element: <Forgotpwd />,
  },
  {
    path: "/password-reset/confirm/:uidb64/:token",
    element: <Resetpwd />,
  },
  {
    path: "/reset-success",
    element: <Resetsuccess />,
  },
  {
    path: "/check-email",
    element: <Checkemail />,
  },
  {
    path: "/pdf-view",
    element: <ProtectedRoute><PdfWrapper /></ProtectedRoute>,
  },
  { 
    path: "/submittal-mappings",
    element: <ProtectedRoute><SubmittalMappings /></ProtectedRoute>,
  },
  {
    path: "/collaboration-hub",
    element: <ProtectedRoute><CollaborationHub /></ProtectedRoute>,
  },
  {
    path: "/project-list/:teamId",
    element: <ProtectedRoute><ProjectsPage /></ProtectedRoute>,
  },
  {
    path: "/companies",
    element: <ProtectedRoute><Companies /></ProtectedRoute>,
  },
  {
    path: "/project-logs",
    element: <ProtectedRoute><ProjectLogs /></ProtectedRoute>,
  },
  {
    path: "/notices",
    element: <ProtectedRoute><NoticesPage /></ProtectedRoute>,
  },
  {
    path: "/full-spec",
    element: <ProtectedRoute><FullSpecPage /></ProtectedRoute>,
  },
  {
    path: "/admin-landing",
    element: <ProtectedRoute><AdminLanding /></ProtectedRoute>,
  },
  {
    path: "/company-profile",
    element: <ProtectedRoute><CustomerProfile /></ProtectedRoute>,
  }
])


ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
