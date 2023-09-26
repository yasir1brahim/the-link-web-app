import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: window.location.href.includes('https://app.thelink.ai')
    ? 'https://log-manager-api-prod.thelink.ai'
    : ' https://log-manager-api-dev.thelink.ai/'
  // baseURL: 'https://log-manager-api-prod.thelink.ai',
  // headers: {
  //   Authorization: `Bearer ${localStorage.getItem('token')}`,
  // },
});

axiosInstance.interceptors.request.use(function (config) {
  // Do something before request is sent
  let token = !window.location.pathname.includes('reset-password')
    ? localStorage.getItem('token')
    : new URLSearchParams(window.location.search)?.get('token');
  config.headers['Authorization'] = 'Bearer ' + token;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // return error.response
    if (error?.response?.status === 401) {
      window.location = '/';
    }
    throw error;
  }
);

export default axiosInstance;
