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


const getTeamDetails = async (teamId) => {
    return await axiosInstance({
        method: 'get',
        url: `/teams/api/teams/${teamId}`,
    });
}

const getUserRoleInTeam = async (userId, teamId) => {
    const team = await getTeamDetails(teamId);
    const members = team.data.members;
    const member = members.find((member) => member.user_id === parseInt(userId));
    return member.role;
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

const updateUserTeamMembership = async (membershipId, role) => {
    return await axiosInstance({
        method: 'patch',
        url: `/teams/api/memberships/${membershipId}/`,
        data: {
            role: role
        }
    });
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
    getUserRoleInTeam,
    getTeamDetails, 
    getUserTeams, 
    updateUserTeamMembership,
    sendInvitation, 
    getInvitation, 
    acceptInvitation,
    register,
}