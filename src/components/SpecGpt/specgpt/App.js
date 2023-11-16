import logo from './logo.svg';
import './App.css';
import Chat from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import useToken from './utils/useToken';
//import SourcesPage from './pages/SourcesPage';
import ViewPDFPage from './pages/ViewPDFPage';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import GettingStartedPage from './pages/GettingStartedPage';
import UploadedFilesPage from './pages/UploadedFilesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';


function App() {

  const {token, removeToken, setToken} = useToken();
  //  <LoginPage setToken={setToken}   />
  return (
    <Routes>
      {!token && token !== "" && token !== undefined ?
        (
          <Route path="/" element={<LoginPage setToken={setToken} />} />
        )
        : (   
          <>
            <Route path="/" element={<LoginPage setToken={setToken} />} />
            <Route exact path="/chat" element={<Chat token={token} setToken={setToken} />}>                
            </Route>
            <Route exact path="/upload" element={<UploadPage token={token} setToken={setToken} />}>
            </Route>
            <Route exact path="/source" element={<ViewPDFPage token={token} setToken={setToken} />}>              
            </Route>
            <Route exact path="/getting-started" element={<GettingStartedPage token={token} setToken={setToken} />}>
            </Route>
            <Route exact path="/uploaded-files" element={<UploadedFilesPage token={token} setToken={setToken} removeToken={removeToken} />}>
            </Route>
            <Route exact path="/admin-dashboard" element={<AdminDashboardPage token={token} setToken={setToken} />} >
            </Route>
          </>
        )
      }
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  )
}


/****
function App2() {
  return (
    <>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/sources" element={<SourcesPage />} />

      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
    </>
  );
} ***/

export default App;
