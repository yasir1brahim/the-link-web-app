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

export {
    getSpecSections,
    getSpecSectionContent,
    getSubmittalHighlights,
    getSpecCentricData,
    getSpecSectionSubmittals
};
