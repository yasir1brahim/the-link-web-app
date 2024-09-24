import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";
import moment from "moment";
const listProjects = async () => {
    try {
        return await axiosInstance({
            method: 'get',
            url: '/api/deliverables/projects/',
        });
    } catch (error) {
        handleError(error);
    }
}

const updateProject = async (projectId, projectName, leadContact, listOfMemberUserIds, listOfAdminUserIds, startDate, endDate) => {
    const payload = {}
    if (projectName) {
        payload.name = projectName
    }
    // if (leadContact) {
    //     payload.owner = leadContact
    // }
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


export {listProjects, updateProject}