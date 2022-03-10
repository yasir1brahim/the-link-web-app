import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  // headers: { 'X-Access-Token': localStorage.getItem('token') },
});

export default axiosInstance;
