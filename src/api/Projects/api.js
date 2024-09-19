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

export {listProjects}
