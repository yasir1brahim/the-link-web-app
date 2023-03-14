import { toast } from "react-toastify";

const handleError = (error) => {
  if (error.response) {
    // client received an error response (5xx, 4xx)
    return toast.error(error?.response?.data?.message || error?.message, {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  } else if (error.request) {
    // client never received a response, or request never left
    return toast.error("Please check your network", {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  } else {
    // anything else
    return toast.error("Something went wrong", {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
};

export default handleError;
