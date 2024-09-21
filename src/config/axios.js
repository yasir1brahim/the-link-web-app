import axios from 'axios';

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

export default axiosInstance;
