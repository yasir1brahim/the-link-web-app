import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";

const login = async (email,password) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: '/login',
            data: {
                email_address: email,
                password: password
            }
        });
    } catch (error) {
        handleError(error);
    }
}

export {login}
