import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // return error.response
    if (error?.response?.status === 401 || error.message === 'Network Error') {
      window.location = '/';
      // localStorage.setItem('token', 'logOut');
      // localStorage.removeItem('userId');
    }
    throw error;
  }
);

export default axiosInstance;
