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

const register = async (email, password1, password2) => {
    return await axiosInstance({
        method: 'post',
        url: '/api/auth/register/',
        data: {
            email: email,
            password1: password1,
            password2: password2
        }
    });
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

const sendInvitation = async (email, teamId, role = 'member') => {
    return await axiosInstance({
        method: 'post',
        url: `/a/${teamId}/team/api/invitations/`,
        data: {
            email: email,
            team: teamId,
            role: role
        }
    });
}

const getInvitation = async (teamId, invitationId) => {
    return await axiosInstance({
        method: 'get',
        url: `/a/${teamId}/team/api/invitations/${invitationId}/`,
    });
}

const acceptInvitation = async (teamId, invitationId) => {
    return await axiosInstance({
        method: 'post',
        url: `/a/${teamId}/team/api/invitations/${invitationId}/accept/`,
    });
}

export {
    login, 
    getAuthTokenFromRefreshToken, 
    getCurrentUserData, 
    getUsersByTeam, 
    getUserTeams, 
    sendInvitation, 
    getInvitation, 
    acceptInvitation,
    register,
}