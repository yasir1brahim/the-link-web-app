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

const getProjectDetails = async (projectId) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/projects/${projectId}/`,
        });
    } catch (error) {
        handleError(error);
    }
}

const updateProject = async (projectId, projectName, listOfMemberUserIds, listOfAdminUserIds, startDate, endDate) => {
    const payload = {}
    if (projectName) {
        payload.name = projectName
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

const createProject = async (projectName, teamId, listOfMemberUserIds, listOfAdminUserIds, startDate, endDate) => {
    const payload = {}
    payload.name = projectName
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


export {listProjects, updateProject, createProject, getProjectDetails}