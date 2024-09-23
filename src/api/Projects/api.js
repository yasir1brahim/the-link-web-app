import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";

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

const updateProject = async (projectId, projectName, leadContact, employeeList, startDate, endDate) => {
    try {
        return await axiosInstance({
            method: 'patch',
            url: `/api/deliverables/projects/${projectId}/`,
            data: {
                name: projectName,
                owner: leadContact,
                members: employeeList,
                start_date: startDate,
                end_date: endDate,
            },
        });
    } catch (error) {
        handleError(error);
    }
}


export {listProjects}