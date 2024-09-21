import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";

const login = async (email,password) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: '/api/auth/login/',
            data: {
                email: email,
                password: password
            }
        });
    } catch (error) {
        handleError(error);
    }
}

const getAuthTokenFromRefreshToken = async (refreshToken) => {
    return await axiosInstance({
        method: 'post',
        url: '/api/auth/token/refresh/',
        data: {
            refresh: refreshToken
        }
    });
}

const getCurrentUserData = async () => {
    return await axiosInstance({
        method: 'get',
        url: '/api/auth/user/',
    });
}


export {login, getAuthTokenFromRefreshToken, getCurrentUserData}
