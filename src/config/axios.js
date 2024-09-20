import axios from 'axios';

const baseURL = window.location.href.includes('https://app.thelink.ai') 
? 'https://log-manager-api-prod.thelink.ai'
: 'http://localhost:8000'

const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${baseURL}/api/auth/token/refresh/`, { refresh: refreshToken });
    const { access } = response.data;
    localStorage.setItem('token', access);
    return access;
  } catch (error) {
    console.error('Unable to refresh token', error);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    window.location = '/';
    throw error;
  }
};

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
    if (error?.response?.status === 401) {
      if (error?.response?.data?.message !== 'Incorrect email or password') {
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await refreshToken();
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            window.location = '/';
          }
        }
      }
    }
    throw error;
  }
);

export default axiosInstance;
