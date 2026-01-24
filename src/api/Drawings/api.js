import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";

/**
 * Fetch drawing notes with pagination and filters
 * @param {number} projectId - Project ID
 * @param {number} projectVersionId - Project version ID
 * @param {Object} options - Query options
 * @param {string} options.category - Category filter
 * @param {string} options.sheetNumber - Sheet number filter (exact match)
 * @param {string} options.sheetTitle - Sheet title filter (case-insensitive substring)
 * @param {boolean} options.sheetNumberIsNull - Filter for records with null sheet_number
 * @param {boolean} options.sheetTitleIsNull - Filter for records with null sheet_title
 * @param {string} options.search - Search text
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.limit - Items per page
 * @param {string} options.sortColumn - Column to sort by
 * @param {string} options.sortDirection - Sort direction ('asc' or 'desc')
 * @returns {Promise} API response
 */
export const getDrawingNotes = async (
  projectId,
  projectVersionId,
  { category, sheetNumber, sheetTitle, sheetNumberIsNull, sheetTitleIsNull, search, page = 1, limit = 25, sortColumn, sortDirection } = {}
) => {
  try {
    return await axiosInstance({
      method: "get",
      url: `/api/deliverables/projects/${projectId}/drawing-notes/`,
      params: {
        project_version_id: projectVersionId,
        ...(category && { category }),
        ...(sheetNumber && { sheet_number: sheetNumber }),
        ...(sheetTitle && { sheet_title: sheetTitle }),
        ...(sheetNumberIsNull && { sheet_number_is_null: true }),
        ...(sheetTitleIsNull && { sheet_title_is_null: true }),
        ...(search && { search }),
        page,
        limit,
        ...(sortColumn && { sort_column: sortColumn }),
        ...(sortColumn && sortDirection && { sort_direction: sortDirection }),
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * Export drawing notes to Excel (XLSX)
 * @param {number} projectId - Project ID
 * @param {number} projectVersionId - Project version ID
 * @param {Object} options - Query options (same filters as list endpoint)
 * @param {string} options.category - Category filter
 * @param {string} options.sheetNumber - Sheet number filter (exact match)
 * @param {string} options.sheetTitle - Sheet title filter (case-insensitive substring)
 * @param {boolean} options.sheetNumberIsNull - Filter for records with null sheet_number
 * @param {boolean} options.sheetTitleIsNull - Filter for records with null sheet_title
 * @param {string} options.search - Search text
 * @returns {Promise} API response with arraybuffer data
 */
export const exportDrawingNotesToExcel = async (
  projectId,
  projectVersionId,
  { category, sheetNumber, sheetTitle, sheetNumberIsNull, sheetTitleIsNull, search } = {}
) => {
  try {
    return await axiosInstance({
      method: "get",
      url: `/api/deliverables/projects/${projectId}/drawing-notes/export/`,
      responseType: "arraybuffer",
      params: {
        project_version_id: projectVersionId,
        ...(category && { category }),
        ...(sheetNumber && { sheet_number: sheetNumber }),
        ...(sheetTitle && { sheet_title: sheetTitle }),
        ...(sheetNumberIsNull && { sheet_number_is_null: true }),
        ...(sheetTitleIsNull && { sheet_title_is_null: true }),
        ...(search && { search }),
      },
    });
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * Upload drawing files
 * Reuses existing ProjectLogs upload helper to avoid duplicate wrappers.
 *
 * NOTE: This expects the backend upload endpoint to accept:
 * - `files` (multipart, repeated key)
 * - `project_id`
 * - `project_version_id`
 * - `file_type: "drawing"`
 */
export { uploadFiles as uploadDrawingFiles } from "../ProjectLogs/api";
