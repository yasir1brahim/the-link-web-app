import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Toast service class for static methods
class ToastService {
  static defaultConfig = {
    position: 'bottom-center',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined
  };

  static success(message, customConfig = {}) {
    toast.success(message, { ...this.defaultConfig, ...customConfig });
  }

  static error(message, customConfig = {}) {
    toast.error(message, { ...this.defaultConfig, ...customConfig });
  }

  static info(message, customConfig = {}) {
    return toast.info(message, { ...this.defaultConfig, ...customConfig });
  }

  static warning(message, customConfig = {}) {
    toast.warning(message, { ...this.defaultConfig, ...customConfig });
  }

  static show(message, type = 'success', customConfig = {}) {
    switch (type.toLowerCase()) {
      case 'error':
        this.error(message, customConfig);
        break;
      case 'info':
        this.info(message, customConfig);
        break;
      case 'warning':
        this.warning(message, customConfig);
        break;
      case 'success':
      default:
        this.success(message, customConfig);
        break;
    }
  }

  static dismiss(toastId) {
    toast.dismiss(toastId);
  }
}

// Toast container component
const Toast = () => {
  return (
    <ToastContainer
      position="bottom-center"
      autoClose={5000}
      hideProgressBar
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
};

export { ToastService };
export default Toast;
