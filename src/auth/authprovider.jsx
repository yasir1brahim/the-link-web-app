import {useState, useEffect, ReactNode, useRef} from 'react';
import {AuthContext} from "./authcontext";
import {getCurrentUserData, getAuthTokenFromRefreshToken} from "../api/Authentication/api";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimeoutIdRef = useRef(null);

  // Inactivity timeout: 4 hours
  const SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000;

  const clearInactivityTimer = () => {
    if (inactivityTimeoutIdRef.current) {
      clearTimeout(inactivityTimeoutIdRef.current);
      inactivityTimeoutIdRef.current = null;
    }
  };

  const startInactivityTimer = () => {
    clearInactivityTimer();
    inactivityTimeoutIdRef.current = setTimeout(() => {
      // On timeout, logout and redirect to session expired page
      handleLogout();
      // Use hard redirect to ensure all state is reset
      window.location.href = '/session-expired';
    }, SESSION_TIMEOUT_MS);
  };

  const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

  const attachActivityListeners = () => {
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, startInactivityTimer, { passive: true });
    });
  };

  const detachActivityListeners = () => {
    activityEvents.forEach((eventName) => {
      window.removeEventListener(eventName, startInactivityTimer);
    });
  };

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

  // When authentication status changes, manage inactivity timer and listeners
  useEffect(() => {
    if (isAuthenticated) {
      attachActivityListeners();
      startInactivityTimer();
    } else {
      detachActivityListeners();
      clearInactivityTimer();
    }
    return () => {
      detachActivityListeners();
      clearInactivityTimer();
    };
  }, [isAuthenticated, SESSION_TIMEOUT_MS]);

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
    startInactivityTimer();
  };

  const handleLogout = () => {
    clearInactivityTimer();
    detachActivityListeners();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    localStorage.removeItem('userTeamRoles');
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
