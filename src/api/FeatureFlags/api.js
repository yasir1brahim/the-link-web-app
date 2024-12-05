import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";

const listFeatureFlags = async () => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/waffle/waffle_status`,
        });
    } catch (error) {
        handleError(error);
    }
}


export {listFeatureFlags}