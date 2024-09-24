import axios from 'axios';
import { getAuthTokenFromRefreshToken } from '../api/Authentication/api';

const baseURL = window.location.href.includes('https://app.thelink.ai') 
? 'https://log-manager-api-prod.thelink.ai'
: 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: baseURL
});

axiosInstance.interceptors.request.use(function (config) {
  // Do something before request is sent
  let token = !window.location.pathname.includes('reset-password')
    ? localStorage.getItem('token')
    : new URLSearchParams(window.location.search)?.get('token');
  if (token && !window.location.pathname.includes('login')) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  // config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error?.response?.status === 403) {
      if (error?.response?.data?.code === 'token_not_valid') {
        localStorage.removeItem('token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            // token didn't work. Invalidate it and try to use a refresh token to get a new one.
            localStorage.removeItem('token');
            const refreshData = await getAuthTokenFromRefreshToken(refreshToken);
            // that worked. save it and proceed.
            localStorage.setItem('token', refreshData.data.access);
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + refreshData.data.access;
            originalRequest.headers['Authorization'] = 'Bearer ' + refreshData.data.access;
            return axiosInstance(originalRequest);
          } catch (error) {
            // Refresh token also failed. The user will have to login again.
            localStorage.removeItem('refresh_token');
            window.location = '/';
          }
        } else {
          // no refresh token
          window.location = '/';
        }
      }
    }
    throw error;
  }
);

export default axiosInstance;
