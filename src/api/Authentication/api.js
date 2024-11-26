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
        return Promise.reject(error);
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

const forgotPassword = async (email) => {
    return await axiosInstance({
        method: 'post',
        url: '/api/auth/password/reset/',
        data: {
            email: email
        }
    });
}

const resetPassword = async (uid, token, new_password1, new_password2) => {
    return await axiosInstance({
        method: 'post',
        url: '/api/auth/password/reset/confirm/',
        data: {
            uid: uid,
            token: token,
            new_password1: new_password1,
            new_password2: new_password2
        }
    });
}

const handleUserInvitation = async (email, firstName, lastName, teamId, role = "member") => {
    return await axiosInstance({
        method: 'post',
        url: '/teams/api/invited-user/',
        data: {
            email: email,
            first_name: firstName,
            last_name: lastName,
            team_id: teamId,
            role: role
        }
    });
};

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

const updateTeamDetails = async (teamId, data) => {
    return await axiosInstance({
        method: 'put',
        url: `/teams/api/teams/${teamId}/`,
        data
    });
}

const uploadTeamLogo = async (teamId, formData) => {
    return await axiosInstance({
        method: 'post',
        url: `/teams/api/teams/${teamId}/upload-logo/`,
        data: formData
    });
}

const updateUserStatus = async (userId, isActive) => {
    try {
        const response = await axiosInstance({
            method: 'patch',
            url: `/api/auth/user/update-status/`,
            data: {
                user_id: userId,
                is_active: isActive,
            }
        });
        return response.data; // Return the response data for further use
    } catch (error) {
        console.error("Error updating user status", error);
        throw error; // Optionally, throw the error to handle it in the calling component
    }
};

export {
    login, 
    getAuthTokenFromRefreshToken, 
    getCurrentUserData,
    getUserRoleInTeam,
    getTeamDetails,
    updateTeamDetails, 
    getUserTeams, 
    updateUserTeamMembership,
    sendInvitation, 
    getInvitation, 
    acceptInvitation,
    register,
    forgotPassword,
    resetPassword,
    uploadTeamLogo,
    updateUserStatus,
    handleUserInvitation,
}
