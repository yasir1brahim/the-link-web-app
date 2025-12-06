import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";
import moment from "moment";
const listProjects = async (teamId) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/projects/`,
            params: {
                team_id: teamId
            }
        });
    } catch (error) {
        handleError(error);
    }
}

const getProjectDetails = async (projectId, projectVersionId = null) => {
    try {
        const params = {};
        if (projectVersionId) {
            params.project_version_id = projectVersionId;
        }
        
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/projects/${projectId}/`,
            params: params
        });
    } catch (error) {
        handleError(error);
    }
}

const updateProject = async (projectId, projectName, projectNumber, projectType, listOfMemberUserIds, listOfAdminUserIds, startDate, endDate) => {
    const payload = {}
    if (projectName) {
        payload.name = projectName
    }
    if (projectNumber) {
        payload.project_number = projectNumber
    }
    if (projectType) {
        payload.project_type = projectType
    }
    if (listOfMemberUserIds) {
        payload.members = listOfMemberUserIds.map((emp_id) => {
            return {
                user_id: emp_id,
                role: "project_member"
            }
        })
    }
    if (listOfAdminUserIds) {
        payload.members = payload.members.concat(listOfAdminUserIds.map((emp_id) => {
            return {
                user_id: emp_id,
                role: "project_admin"
            }
        }))
    }
    if (startDate) {
        payload.start_date = moment(startDate).format("YYYY-MM-DD")
    }
    if (endDate) {
        payload.end_date = moment(endDate).format("YYYY-MM-DD")
    }
    console.log("project update payload", payload)
    try {
        return await axiosInstance({
            method: 'patch',
            url: `/api/deliverables/projects/${projectId}/`,
            data: payload,
        });
    } catch (error) {
        handleError(error);
    }
}

const addUsersToProject = async (projectId, listOfMemberUserIds) => {
    const payload = {}
    payload.user_ids = listOfMemberUserIds
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/projects/${projectId}/members-add/`,
            data: payload,
        });
    } catch (error) {
        handleError(error);
    }
}

const createProject = async (projectName, projectNumber, projectType, teamId, listOfMemberUserIds, listOfAdminUserIds, startDate, endDate) => {
    const payload = {}
    payload.name = projectName
    payload.project_number = projectNumber
    if (projectType) {
        payload.project_type = projectType
    }
    payload.team = teamId
    if (listOfMemberUserIds) {
        payload.members = listOfMemberUserIds.map((emp_id) => {
            return {
                user_id: emp_id,
                role: "project_member"
            }
        })
    }
    if (listOfAdminUserIds) {
        payload.members = payload.members.concat(listOfAdminUserIds.map((emp_id) => {
            return {
                user_id: emp_id,
                role: "project_admin"
            }
        }))
    }
    if (startDate) {
        payload.start_date = moment(startDate).format("YYYY-MM-DD")
    }
    if (endDate) {
        payload.end_date = moment(endDate).format("YYYY-MM-DD")
    }
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/projects/`,
            data: payload,
        });
    } catch (error) {
        handleError(error);
    }
}

const createProjectVersion = async (projectId, versionName) => {
    return await axiosInstance({
        method: 'post',
        url: `/api/deliverables/${projectId}/project-versions/`,
        data: { version_name: versionName },
    });
}

const updateProjectVersion = async (projectId, versionId, versionName) => {
    return await axiosInstance({
        method: 'patch',
        url: `/api/deliverables/${projectId}/project-versions/${versionId}/`,
        data: { version_name: versionName },
    });
}

const getArchivedVersions = async (projectId) => {
    try {
        const response = await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/project-versions/archived/`,
        });
        return response;
    } catch (error) {
        console.error('Error details:', error.response?.status, error.response?.data);
        handleError(error);
    }
};

const archiveProjectVersion = async (projectId, versionId, action) => {
    try {
        if (!['archive', 'restore'].includes(action)) {
            throw new Error(`Invalid action: ${action}. Allowed values are 'archive' or 'restore'.`);
        }

        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/${projectId}/project-versions/${versionId}/archive/`,
            data: { action }
        });
    } catch (error) {
        handleError(error);
    }
};


const restoreProjectVersion = async (projectId, versionId) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/${projectId}/project-versions/${versionId}/restore/`,
            data: { action: 'restore' }
        });
    } catch (error) {
        handleError(error);
    }
}

const toggleProjectStatus = async (projectId, action = 'archive', teamId) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/projects/${projectId}/archive/`,
            data: { action, team: teamId }
        });
    } catch (error) {
        handleError(error);
    }
};


const getUserRoleInAllProjects = async (userId, teamId) => {
    const projects = await listProjects(teamId);
    const userIdInt = parseInt(userId);

    const allRoles = projects.data.results.flatMap((project) => 
        project.members
            .filter((member) => member.user_id === userIdInt)
            .map((member) => ({
                projectId: project.id,
                role: member.role
            }))
    );

    return allRoles.length > 0 ? allRoles : null;
};

export {
    listProjects, 
    updateProject, 
    createProject, 
    getProjectDetails, 
    toggleProjectStatus, 
    getUserRoleInAllProjects,
    addUsersToProject,
    createProjectVersion,
    updateProjectVersion,
    archiveProjectVersion,
    restoreProjectVersion,
    getArchivedVersions
}