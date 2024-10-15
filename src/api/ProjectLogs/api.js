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
    var filtersObject = {}
    nonEmptyFilters.forEach(key => {
        filtersObject[`filters[${key}]`] = filters_object[key].join(',')
    })
    console.log("filtersObject", filtersObject);
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/submittal-items`,
            params: {
                ...(search && { search }),
                ...filtersObject,
                ...(order_col && { order_col }),
                ...(order && { order }),
                ...(page_number && { page_number }),
                ...(limit && { limit }),
            }
        });
    } catch (error) {
        handleError(error);
    }
}

export {getSavedLogs, getSubmittalItemById, getSubmittalItems}