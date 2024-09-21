import{ createContext } from 'react';


export const AuthContext = createContext({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUserDetails: (jwtResponseData) => {},
  logout: () => {},
});
