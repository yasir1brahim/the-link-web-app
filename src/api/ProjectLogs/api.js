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

const getProjectLists = async (projectId) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/submittal-lists/`,
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

const createSubmittalList = async (projectId, listName, userId, submittalIds) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/${projectId}/submittal-lists/`,
            data: {
                name: listName,
                description: "",
                project: projectId,
                created_by: userId,
                submittals: submittalIds
            },
        });
    } catch (error) {
        handleError(error);
    }
}

const addSubmittalItem = async (projectId, specSection, paraNo, paraContext, submittalHeading, submittalType) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/${projectId}/submittal-items/`,
            data: {
                spec_section: specSection,
                para_no: paraNo,
                para_context: paraContext,
                item_desc: submittalHeading,
                type: submittalType,
            },
        });
    } catch (error) {
        handleError(error);
    }
}

const updateSubmittalItem = async (projectId, submittalId, specSection, paraNo, paraContext, submittalHeading, submittalType) => {
    try {
        return await axiosInstance({
            method: 'put',
            url: `/api/deliverables/${projectId}/submittal-items/${submittalId}/`,
            data: {
                spec_section: specSection,
                para_no: paraNo,
                para_context: paraContext,
                item_desc: submittalHeading,
                type: submittalType,
            },
        });
    } catch (error) {
        handleError(error);
    }
}

const deleteSubmittalItem = async (projectId, submittalId) => {
    try {
        return await axiosInstance({
            method: 'delete',
            url: `/api/deliverables/${projectId}/${submittalId}/`,
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
                ...(list_id && { list_id }),
            }
        });
    } catch (error) {
        handleError(error);
    }
}

export {
    getSavedLogs,
    getSubmittalItemById,
    getSubmittalItems,
    getProjectLists,
    createSubmittalList,
    addSubmittalItem,
    updateSubmittalItem,
    deleteSubmittalItem
}