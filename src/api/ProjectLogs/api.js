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

const getSubmittalItemById = async (projectId, submittalId) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/${submittalId}`,
        });
    } catch (error) {
        handleError(error);
    }
}

const getSubmittalItems = async (
    projectId,
    search,
    filters_object,
    order_col,
    order,
    page_number,
    limit,
    list_id
) => {
    const nonEmptyFilters = Object.keys(filters_object).filter(key => filters_object[key].length > 0);
    const filtersString = nonEmptyFilters.map(key => `filters[${key}]=${filters_object[key].join(',')}`).join('&');
    console.log("filtersString", filtersString);
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/submittal-items`,
        });
    } catch (error) {
        handleError(error);
    }
}

export {getSavedLogs, getSubmittalItemById, getSubmittalItems}