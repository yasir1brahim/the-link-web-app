import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";

/**
 * Trigger a new spec comparison for a project version
 */
export const triggerSpecComparison = async (projectId, projectVersionId) => {
  try {
    return await axiosInstance({
      method: "post",
      url: `/api/deliverables/projects/${projectId}/trigger-spec-comparison/`,
      data: { project_version_id: projectVersionId },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * Get list of comparisons for a project (for polling status)
 */
export const getSpecComparisons = async (projectId, { projectVersionId, page = 1, limit = 50 } = {}) => {
  try {
    return await axiosInstance({
      method: "get",
      url: `/api/deliverables/projects/${projectId}/spec-comparisons/`,
      params: {
        project_version_id: projectVersionId,
        page,
        limit,
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * Get spec conflicts with filtering, sorting, and pagination
 */
export const getSpecConflicts = async (
  projectId,
  {
    projectVersionId,
    comparisonId,
    page = 1,
    limit = 25,
    sortColumn,
    sortDirection,
    search,
    sheetNumber,
    specMasterformatNumber,
    reason,
  } = {}
) => {
  try {
    return await axiosInstance({
      method: "get",
      url: `/api/deliverables/projects/${projectId}/spec-conflicts/`,
      params: {
        project_version_id: projectVersionId,
        comparison_id: comparisonId,
        page,
        limit,
        sort_column: sortColumn,
        sort_direction: sortDirection,
        search,
        sheet_number: sheetNumber,
        spec_masterformat_number: specMasterformatNumber,
        reason,
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * Export spec conflicts to Excel
 */
export const exportSpecConflictsToExcel = async (
  projectId,
  {
    projectVersionId,
    search,
    sheetNumber,
    specMasterformatNumber,
    reason,
    sortColumn,
    sortDirection,
  } = {}
) => {
  try {
    return await axiosInstance({
      method: "get",
      url: `/api/deliverables/projects/${projectId}/spec-conflicts/export/`,
      params: {
        project_version_id: projectVersionId,
        search,
        sheet_number: sheetNumber,
        spec_masterformat_number: specMasterformatNumber,
        reason,
        sort_column: sortColumn,
        sort_direction: sortDirection,
      },
      responseType: 'blob',
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};
