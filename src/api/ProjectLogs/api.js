import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";

const getSavedLogs = async (listId) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/get_saved_logs/${listId}`,
        });
    } catch (error) {
        handleError(error);
    }
}

export {getSavedLogs}
