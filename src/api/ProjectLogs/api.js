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

const getProjectLists = async (projectId, projectVersionId) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/submittal-lists/`,
            params: {
                ...(projectVersionId && { project_version_id: projectVersionId }),
            }
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

const createSubmittalList = async (projectId, listName, userId, submittalIds, projectVersionId=null) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/${projectId}/submittal-lists/`,
            data: {
                name: listName,
                description: "",
                project: projectId,
                created_by: userId,
                submittals: submittalIds,
                ...(projectVersionId && { project_version: projectVersionId })
            },
        });
    } catch (error) {
        handleError(error);
    }
}

const addSubmittalItem = async (
    projectId, 
    specSection, 
    paraNo, 
    paraContext, 
    submittalHeading, 
    submittalType,
    addedUnderSubmittalId=null,
    projectVersionId=null
) => {
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
                added_under_submittal_id: addedUnderSubmittalId,
                ...(projectVersionId && { project_version: projectVersionId })
            },
        });
    } catch (error) {
        handleError(error);
    }
}

const updateSubmittalItem = async (projectId, submittalId, specSection, paraNo, paraContext, submittalHeading, submittalType, projectVersionId=null) => {
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
                ...(projectVersionId && { project_version: projectVersionId })
            },
        });
    } catch (error) {
        handleError(error);
    }
}

const deleteSubmittalItems = async (projectId, submittalIds) => {
    try {
        return await axiosInstance({
            method: 'delete',
            url: `/api/deliverables/${projectId}/submittal-items/${submittalIds[0]}/`,
            data: {
                ids: submittalIds
            },
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
    list_id,
    projectVersionId = null,
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
            url: `/api/deliverables/${projectId}/submittal-items/`,
            params: {
                ...(projectVersionId && { project_version_id: projectVersionId }),
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


const getExportExcelData = async (
    projectId,
    records,
    filters_object,
    projectVersionId = null,
) => {
    const nonEmptyFilters = Object.keys(filters_object).filter(key => filters_object[key].length > 0);
    var filtersObject = {}
    nonEmptyFilters.forEach(key => {
        filtersObject[`filters[${key}]`] = filters_object[key].join(',')
    })
    console.log("records", records);
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/submittal-items/export/`,
            responseType: 'arraybuffer',
            params: {
                ...(projectVersionId && { project_version_id: projectVersionId }),
                ...filtersObject,
                ...(records && { records })
            }
        });
    } catch (error) {
        handleError(error);
    }
}


const getExportJetBuildData = async (
    projectId,
    records,
    filters_object,
    projectVersionId = null,
) => {
    const nonEmptyFilters = Object.keys(filters_object).filter(key => filters_object[key].length > 0);
    var filtersObject = {}
    nonEmptyFilters.forEach(key => {
        filtersObject[`filters[${key}]`] = filters_object[key].join(',')
    })
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/submittal-items/export-jet-build/`,
            responseType: 'arraybuffer',
            params: {
                ...(projectVersionId && { project_version_id: projectVersionId }),
                ...filtersObject,
                ...(records && { records })
            }
        });
    } catch (error) {
        handleError(error);
    }
}


const uploadFiles = async (data) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/upload-file/`,
            data: data
        });
    } catch (error) {
        handleError(error);
    }
}


const getExcelExportHeader = async () => {
    try {
        return await axiosInstance({
            method: 'get',
            url: 'api/deliverables/excel-export-header/'
        });
    } catch (error) {
        handleError(error);
    }
}


const upsertExcelExportHeader = async (items) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: 'api/deliverables/excel-export-header/upsert/',
            data: {
                options: items
            }
        });
    } catch (error) {
        handleError(error);
    }
}


const combineRows = async (data) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: 'api/deliverables/combine-rows/',
            data: data
        });
    } catch (error) {
        handleError(error);
    }
}


const getProjectIdBySubmittalId = async (submittalId) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: 'api/deliverables/projects/project-id-by-submittal-id/',
            params: {
                'submittal_id': submittalId
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
    deleteSubmittalItems,
    uploadFiles,
    getExportExcelData,
    getExportJetBuildData,
    getExcelExportHeader,
    upsertExcelExportHeader,
    combineRows,
    getProjectIdBySubmittalId
}