import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";


const getNotices = async (
    projectId,
) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/notices`,
        });
    } catch (error) {
        handleError(error);
    }
}

export { getNotices } 