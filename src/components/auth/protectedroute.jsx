import {ReactNode, useContext, useEffect} from 'react';
import {AuthContext} from "../../auth/authcontext.jsx";
import {useNavigate , useLocation} from "react-router-dom";
import Loader from '../shared/Loader/Loader.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // not loading and not authenticated. we need to re-auth.
      localStorage.setItem('postLoginRedirect', location.pathname + location.search);
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate, location]);

  if (isAuthenticated) {
    return children;
  }
  else if (isLoading) {
    return (
        <Loader showComponentLoader={isLoading} />
    );
  } else {
    // just return null or a fragment, navigation will be handled by useEffect
    return null;
  }
};

export default ProtectedRoute;