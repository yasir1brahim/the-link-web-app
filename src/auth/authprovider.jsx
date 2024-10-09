import {useState, useEffect, ReactNode} from 'react';
import {AuthContext} from "./authcontext";
import {getCurrentUserData, getAuthTokenFromRefreshToken} from "../api/Authentication/api";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const validateTokenAndSetUser = async () => {
        let userBack;
        try {
          userBack = await getCurrentUserData();
          console.log('userBack', userBack);
          // token was still good. we have a valid user session
          setToken(storedToken);
          setIsAuthenticated(true);
          setUser(userBack.data);
        } catch (error) {
          // token didn't work. Invalidate it and try to use a refresh token to get a new one.
          localStorage.removeItem('token');
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const refreshData = await getAuthTokenFromRefreshToken(refreshToken);
              // that worked. save it and proceed.
              localStorage.setItem('token', refreshData.data.access);
              setToken(refreshData.data.access);
              userBack = await getCurrentUserData();
              setIsAuthenticated(true);
              setUser(userBack.data);
            } catch (error) {
              // Refresh token also failed. The user will have to login again.
              localStorage.removeItem('refresh_token');
              setIsAuthenticated(false);
            }
          } else {
            // no refresh token
            setIsAuthenticated(false);
          }
        } finally {
          setIsLoading(false);
        }
      };
      validateTokenAndSetUser();
    } else {
      setToken(null);
      setIsLoading(false);
      setIsAuthenticated(false);
    }
  }, []);

  const handleSetUserDetails = (jwtResponseData) => {
    window.heap.identify(jwtResponseData.user.email);
    localStorage.setItem('token', jwtResponseData.access);
    localStorage.setItem('refresh_token', jwtResponseData.refresh);
    localStorage.setItem('userId', jwtResponseData.user.id);
    localStorage.setItem('fullName', jwtResponseData.user.get_display_name);
    localStorage.setItem('role', jwtResponseData.user.role);
    setToken(jwtResponseData.access);
    setUser(jwtResponseData.user)
    setIsLoading(false);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
  };

  const contextValue = {
    token,
    user,
    isAuthenticated,
    isLoading,
    setUserDetails: handleSetUserDetails,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
