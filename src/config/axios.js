import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: process.env.REACT_APP_BASE_URL,
  baseURL: 'https://log-manager-api-prod.thelink.ai',
  // headers: {
  //   Authorization: `Bearer ${localStorage.getItem('token')}`,
  // },
});

axiosInstance.interceptors.request.use(function (config) {
  // Do something before request is sent
  let token = localStorage.getItem('token');
  config.headers['Authorization'] = 'Bearer ' + token;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // return error.response
    if (error?.response?.status === 401 || error.message === 'Network Error') {
      window.location = '/';
    }
    throw error;
  }
);

export default axiosInstance;
