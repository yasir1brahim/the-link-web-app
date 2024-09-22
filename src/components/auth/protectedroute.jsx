import {ReactNode, useContext, useEffect} from 'react';
import {AuthContext} from "../../auth/authcontext.jsx";
import {useNavigate} from "react-router-dom";


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // not loading and not authenticated. we need to re-auth.
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isAuthenticated) {
    return children;
  }
  else if (isLoading) {
    return (
      <div>Loading...</div>
    );
  } else {
    // just return null or a fragment, navigation will be handled by useEffect
    return null;
  }
};

export default ProtectedRoute;
