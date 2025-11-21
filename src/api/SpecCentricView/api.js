import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";

/**
 * Get all spec sections for a project
 * @param {number} projectId - The project ID
 * @param {number} projectVersionId - Optional project version ID
 * @returns {Promise} API response
 */
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
        throw error;
    }
};

/**
 * Get detailed content for a specific spec section
 * @param {number} projectId - The project ID
 * @param {number} sectionId - The spec section ID
 * @param {number} projectVersionId - Optional project version ID
 * @returns {Promise} API response
 */
const getSpecSectionContent = async (projectId, sectionId, projectVersionId = null) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/spec-sections/${sectionId}/`,
            params: {
                ...(projectVersionId && { project_version_id: projectVersionId }),
            }
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * Get submittal highlights for a specific spec section
 * @param {number} projectId - The project ID
 * @param {number} sectionId - The spec section ID
 * @param {number} projectVersionId - Optional project version ID
 * @returns {Promise} API response
 */
const getSubmittalHighlights = async (projectId, sectionId, projectVersionId = null) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/spec-sections/${sectionId}/submittal-highlights/`,
            params: {
                ...(projectVersionId && { project_version_id: projectVersionId }),
            }
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * Get comprehensive spec centric view data
 * @param {number} projectId - The project ID
 * @param {number} projectVersionId - Optional project version ID
 * @returns {Promise} API response
 */
const getSpecCentricData = async (projectId, projectVersionId = null) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/spec-sections/spec-centric-data/`,
            params: {
                ...(projectVersionId && { project_version_id: projectVersionId }),
            }
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * Get spec section submittals
 * @param {number} projectId - The project ID
 * @param {number} sectionId - The spec section ID
 * @param {number} projectVersionId - Optional project version ID
 * @returns {Promise} API response
 */
const getSpecSectionSubmittals = async (projectId, sectionId, projectVersionId = null) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/${projectId}/spec-sections/${sectionId}/submittal-highlights/`,
            params: {
                ...(projectVersionId && { project_version_id: projectVersionId }),
            }
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * Create a manual highlight (ExtractedData) entry
 * @param {number} projectId - The project ID
 * @param {object} payload - Highlight payload matching ExtractedDataCreateSerializer
 * @returns {Promise} API response
 */
const createManualHighlight = async (projectId, payload) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/${projectId}/extracted-data/`,
            data: payload,
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// Custom item type helpers
const getCustomItemTypes = async (projectId) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/projects/${projectId}/custom-item-types/`,
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

const createCustomItemType = async (projectId, payload) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/projects/${projectId}/custom-item-types/`,
            data: payload,
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

const updateCustomItemType = async (projectId, typeId, payload) => {
    try {
        return await axiosInstance({
            method: 'patch',
            url: `/api/deliverables/projects/${projectId}/custom-item-types/${typeId}/`,
            data: payload,
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

const deleteCustomItemType = async (projectId, typeId) => {
    try {
        return await axiosInstance({
            method: 'delete',
            url: `/api/deliverables/projects/${projectId}/custom-item-types/${typeId}/`,
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

const getCustomTypeColorPalette = async (projectId) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/projects/${projectId}/custom-item-types/color-palette/`,
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

// User highlight preference helpers
const getUserHighlightPreference = async (projectId) => {
    try {
        return await axiosInstance({
            method: 'get',
            url: `/api/deliverables/projects/${projectId}/highlight-preference/`,
        });
    } catch (error) {
        // Return null if no preference exists (404)
        if (error.response && error.response.status === 404) {
            return null;
        }
        handleError(error);
        throw error;
    }
};

const setUserHighlightPreference = async (projectId, payload) => {
    try {
        return await axiosInstance({
            method: 'post',
            url: `/api/deliverables/projects/${projectId}/highlight-preference/`,
            data: payload,
        });
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export {
    getSpecSections,
    getSpecSectionContent,
    getSubmittalHighlights,
    getSpecCentricData,
    getSpecSectionSubmittals,
    createManualHighlight,
    getCustomItemTypes,
    createCustomItemType,
    updateCustomItemType,
    deleteCustomItemType,
    getCustomTypeColorPalette,
    getUserHighlightPreference,
    setUserHighlightPreference
};
