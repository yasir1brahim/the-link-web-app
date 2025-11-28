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
    projectVersionId=null,
    specSectionTitle=null
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
                ...(projectVersionId && { project_version: projectVersionId }),
                ...(specSectionTitle && { spec_section_title: specSectionTitle })
            },
        });
    } catch (error) {
        handleError(error);
    }
}

const addSubmittalItemFromHighlight = async (
    projectId,
    specSectionId,
    paraNo,
    paraContext,
    submittalHeading,
    submittalType,
    textLocation,
    additionalTextLocations,
    projectVersionId=null,
    addedUnderSubmittalId=null
) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/${projectId}/submittal-items/from-highlight/`,
            data: {
                spec_section_id: specSectionId,
                para_no: paraNo,
                para_context: paraContext,
                item_desc: submittalHeading,
                type: submittalType,
                ...(textLocation && { text_location: textLocation }),
                ...(additionalTextLocations && additionalTextLocations.length > 0 && { additional_text_locations: additionalTextLocations }),
                ...(projectVersionId && { project_version: projectVersionId }),
                ...(addedUnderSubmittalId && { added_under_submittal_id: addedUnderSubmittalId }),
            },
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
}

const updateSubmittalItem = async (
    projectId, 
    submittalId, 
    specSection, 
    paraNo, 
    paraContext, 
    submittalHeading, 
    submittalType, 
    projectVersionId=null, 
    specSectionTitle=null
) => {
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
                ...(projectVersionId && { project_version: projectVersionId }),
                ...(specSectionTitle && { spec_section_title: specSectionTitle })
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


const uploadFiles = async (data, errorCallback) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/upload-file/`,
            data: data
        });
    } catch (error) {
        console.log("error in uploadFiles", error);
        if (errorCallback) {
            errorCallback(error);
        } else {
            handleError(error);
        }
    }
}

const reprocessDocument = async (documentId) => {
    try {
        const payload = {
            document_id: documentId
        };
        
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/reprocess-document/`,
            data: payload
        });
    } catch (error) {
        console.log("error in reprocessDocument", error);
        handleError(error);
    }
}

const downloadDocument = async (documentId) => {
    try {
        const response = await axiosInstance({
            method: 'get',
            url: `/api/deliverables/download-document/`,
            params: {
                document_id: documentId
            }
        });
        
        if (response.data.download_url) {
            const downloadUrl = response.data.download_url;
            const fileName = response.data.document_name;
            
            try {
                const fileResponse = await fetch(downloadUrl);
                
                if (!fileResponse.ok) {
                    throw new Error(`Download failed: HTTP ${fileResponse.status}`);
                }
                
                const blob = await fileResponse.blob();
                
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up blob URL to prevent memory leaks
                window.URL.revokeObjectURL(blobUrl);
                
            } catch (downloadError) {
                console.warn('Blob download failed, opening in new tab:', downloadError);
                
                // Fallback: Open in new tab if blob download fails
                const newWindow = window.open(downloadUrl, '_blank');
                
                if (!newWindow) {
                    throw new Error('Download failed and popup was blocked. Please allow popups and try again.');
                }
            }
        }
        
        return response;
    } catch (error) {
        console.log("error in downloadDocument", error);
        handleError(error);
        throw error;
    }
}

const deleteDocument = async (documentId) => {
    try {
        const payload = {
            document_id: documentId
        };
        
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/delete-document/`,
            data: payload
        });
    } catch (error) {
        console.log("error in deleteDocument", error);
        handleError(error);
        throw error;
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


const getVersionComparison = async (oldVersionId, newVersionId, masterformatNumber) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: 'api/deliverables/version-comparison/',
            params: {
                'old_version': oldVersionId,
                'new_version': newVersionId,
                'masterformat_number': masterformatNumber
            }
        });
    } catch (error) {
        handleError(error);
    }
}

const getFilteredVersionComparison = async (oldVersionId, newVersionId, differencesOnly, searchTerm) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: 'api/deliverables/filtered-version-comparison/',
            params: {
                'old_version': oldVersionId,
                'new_version': newVersionId,
                'only_differences': differencesOnly,
                'keyword': searchTerm
            }
        });
    } catch (error) {
        handleError(error);
    }
}

const getSemanticallyProcessedSpecItems = async (projectId, search, page_number, limit) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/semantically-processed-spec-items/`,
            params: {
                ...(search && { search }),
                ...(page_number && { page_number }),
                ...(limit && { limit })
            }
        });
    } catch (error) {
        handleError(error);
    }
}

const getSpecSections = async (projectId, projectVersionId = null) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/spec-sections/`,
            params: {
                ...(projectVersionId && { project_version_id: projectVersionId }),
            }
        });
    } catch (error) {
        handleError(error);
    }
}

const downloadSpecSection = async (sectionId) => {
    try {
        const response = await axiosInstance({
            method: 'get',
            url: `/api/deliverables/spec-sections/${sectionId}/download/`,
        });
        
        if (response.data.download_url) {
            const downloadUrl = response.data.download_url;
            const fileName = response.data.file_name;
            
            try {
                const fileResponse = await fetch(downloadUrl);
                
                if (!fileResponse.ok) {
                    throw new Error(`Download failed: HTTP ${fileResponse.status}`);
                }
                
                const blob = await fileResponse.blob();
                
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up blob URL to prevent memory leaks
                window.URL.revokeObjectURL(blobUrl);
                
            } catch (downloadError) {
                console.warn('Blob download failed, opening in new tab:', downloadError);
                
                // Fallback: Open in new tab if blob download fails
                const newWindow = window.open(downloadUrl, '_blank');
                
                if (!newWindow) {
                    throw new Error('Download failed and popup was blocked. Please allow popups and try again.');
                }
            }
        }
        
        return response;
    } catch (error) {
        console.log("error in downloadSpecSection", error);
        handleError(error);
        throw error;
    }
}

const bulkDownloadSpecSections = async (sectionIds) => {
    try {
        const response = await axiosInstance({
            method: 'get',
            url: `/api/deliverables/spec-sections/download-multiple/`,
            params: {
                section_ids: sectionIds.join(',')
            }
        });
        
        if (response.data.single_file) {
            // Single file download
            const downloadUrl = response.data.download_url;
            const fileName = response.data.file_name;
            
            try {
                const fileResponse = await fetch(downloadUrl);
                
                if (!fileResponse.ok) {
                    throw new Error(`Download failed: HTTP ${fileResponse.status}`);
                }
                
                const blob = await fileResponse.blob();
                
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up blob URL to prevent memory leaks
                window.URL.revokeObjectURL(blobUrl);
                
            } catch (downloadError) {
                console.warn('Blob download failed, opening in new tab:', downloadError);
                
                // Fallback: Open in new tab if blob download fails
                const newWindow = window.open(downloadUrl, '_blank');
                
                if (!newWindow) {
                    throw new Error('Download failed and popup was blocked. Please allow popups and try again.');
                }
            }
        } else {
            // Multiple files download - now handled as single zip file
            const downloadUrl = response.data.download_url;
            const fileName = response.data.file_name;
            
            try {
                const fileResponse = await fetch(downloadUrl);
                
                if (!fileResponse.ok) {
                    throw new Error(`Download failed: HTTP ${fileResponse.status}`);
                }
                
                const blob = await fileResponse.blob();
                
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up blob URL to prevent memory leaks
                window.URL.revokeObjectURL(blobUrl);
                
            } catch (downloadError) {
                console.warn('Blob download failed, opening in new tab:', downloadError);
                
                // Fallback: Open in new tab if blob download fails
                const newWindow = window.open(downloadUrl, '_blank');
                
                if (!newWindow) {
                    throw new Error('Download failed and popup was blocked. Please allow popups and try again.');
                }
            }
        }
        
        return response;
    } catch (error) {
        console.log("error in bulkDownloadSpecSections", error);
        handleError(error);
        throw error;
    }
}

const bulkDownloadDocuments = async (documentIds) => {
    try {
        const response = await axiosInstance({
            method: 'get',
            url: `/api/deliverables/documents/download-multiple/`,
            params: {
                document_ids: documentIds.join(',')
            }
        });
        
        if (response.data.single_file) {
            // Single file download
            const downloadUrl = response.data.download_url;
            const fileName = response.data.file_name;
            
            try {
                const fileResponse = await fetch(downloadUrl);
                
                if (!fileResponse.ok) {
                    throw new Error(`Download failed: HTTP ${fileResponse.status}`);
                }
                
                const blob = await fileResponse.blob();
                
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up blob URL to prevent memory leaks
                window.URL.revokeObjectURL(blobUrl);
                
            } catch (downloadError) {
                console.warn('Blob download failed, opening in new tab:', downloadError);
                
                // Fallback: Open in new tab if blob download fails
                const newWindow = window.open(downloadUrl, '_blank');
                
                if (!newWindow) {
                    throw new Error('Download failed and popup was blocked. Please allow popups and try again.');
                }
            }
        }
        
        return response;
    } catch (error) {
        console.log("error in bulkDownloadDocuments", error);
        handleError(error);
        throw error;
    }
}

const bulkReprocessDocuments = async (documentIds) => {
    try {
        const response = await axiosInstance({
            method: 'post',
            url: `/api/deliverables/documents/reprocess-multiple/`,
            data: {
                document_ids: documentIds
            }
        });
        
        return response;
    } catch (error) {
        console.log("error in bulkReprocessDocuments", error);
        handleError(error);
        throw error;
    }
}

const bulkDeleteDocuments = async (documentIds) => {
    try {
        const response = await axiosInstance({
            method: 'post',
            url: `/api/deliverables/documents/delete-multiple/`,
            data: {
                document_ids: documentIds
            }
        });
        
        return response;
    } catch (error) {
        console.log("error in bulkDeleteDocuments", error);
        handleError(error);
        throw error;
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
    reprocessDocument,
    downloadDocument,
    deleteDocument,
    getExportExcelData,
    getExportJetBuildData,
    getExcelExportHeader,
    upsertExcelExportHeader,
    combineRows,
    getProjectIdBySubmittalId,
    getVersionComparison,
    getFilteredVersionComparison,
    getSemanticallyProcessedSpecItems,
    getSpecSections,
    downloadSpecSection,
    bulkDownloadSpecSections,
    bulkDownloadDocuments,
    bulkReprocessDocuments,
    bulkDeleteDocuments,
    addSubmittalItemFromHighlight,
}