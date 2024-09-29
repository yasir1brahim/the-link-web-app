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


const getUsersByTeam = async (teamId) => {
    return await axiosInstance({
        method: 'get',
        url: `/teams/api/teams/${teamId}`,
    });
}

const getUserTeams = async (accessToken) => {
    if (accessToken) {
        return await axiosInstance({
            method: 'get',
            url: '/teams/api/teams/',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
    } else {
        return await axiosInstance({
            method: 'get',
            url: '/teams/api/teams/',
        });
    }
}


export {login, getAuthTokenFromRefreshToken, getCurrentUserData, getUsersByTeam, getUserTeams}