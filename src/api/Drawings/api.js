import axiosInstance from "../../config/axios";
import handleError from "../../config/errorHandler";

/**
 * Fetch drawing notes with pagination and filters
 * @param {number} projectId - Project ID
 * @param {number} projectVersionId - Project version ID
 * @param {Object} options - Query options
 * @param {string} options.category - Category filter
 * @param {number} options.drawingFileId - Drawing file ID filter
 * @param {string} options.search - Search text
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.limit - Items per page
 * @returns {Promise} API response
 */
export const getDrawingNotes = async (
  projectId,
  projectVersionId,
  { category, drawingFileId, search, page = 1, limit = 25 } = {}
) => {
  try {
    return await axiosInstance({
      method: "get",
      url: `/api/deliverables/projects/${projectId}/drawing-notes/`,
      params: {
        project_version_id: projectVersionId,
        ...(category && { category }),
        ...(drawingFileId && { drawing_file_id: drawingFileId }),
        ...(search && { search }),
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
