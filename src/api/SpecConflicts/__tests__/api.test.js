import axiosInstance from "../../../config/axios";
import {
  triggerSpecComparison,
  getSpecComparisons,
  getSpecConflicts,
  exportSpecConflictsToExcel,
} from "../api";

jest.mock("../../../config/axios");
jest.mock("../../../config/errorHandler", () => jest.fn());

describe("SpecConflicts API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("triggerSpecComparison", () => {
    it("should POST to trigger-spec-comparison endpoint", async () => {
      const mockResponse = { data: { id: 1, status: "PROCESSING" } };
      axiosInstance.mockResolvedValue(mockResponse);

      const result = await triggerSpecComparison(123, 456);

      expect(axiosInstance).toHaveBeenCalledWith({
        method: "post",
        url: "/api/deliverables/projects/123/trigger-spec-comparison/",
        data: { project_version_id: 456 },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getSpecComparisons", () => {
    it("should GET comparisons with project_version_id", async () => {
      const mockResponse = { data: { results: [] } };
      axiosInstance.mockResolvedValue(mockResponse);

      await getSpecComparisons(123, { projectVersionId: 456 });

      expect(axiosInstance).toHaveBeenCalledWith({
        method: "get",
        url: "/api/deliverables/projects/123/spec-comparisons/",
        params: {
          project_version_id: 456,
          page: 1,
          limit: 50,
        },
      });
    });
  });

  describe("getSpecConflicts", () => {
    it("should GET conflicts with all filter params", async () => {
      const mockResponse = { data: { results: [], count: 0 } };
      axiosInstance.mockResolvedValue(mockResponse);

      await getSpecConflicts(123, {
        projectVersionId: 456,
        page: 2,
        limit: 50,
        sortColumn: "sheet_number",
        sortDirection: "desc",
        search: "valve",
        sheetNumber: "P-201",
      });

      expect(axiosInstance).toHaveBeenCalledWith({
        method: "get",
        url: "/api/deliverables/projects/123/spec-conflicts/",
        params: expect.objectContaining({
          project_version_id: 456,
          page: 2,
          limit: 50,
          sort_column: "sheet_number",
          sort_direction: "desc",
          search: "valve",
          sheet_number: "P-201",
        }),
      });
    });
  });

  describe("exportSpecConflictsToExcel", () => {
    it("should GET export with responseType blob", async () => {
      const mockBlob = new Blob();
      axiosInstance.mockResolvedValue({ data: mockBlob });

      await exportSpecConflictsToExcel(123, { projectVersionId: 456 });

      expect(axiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "get",
          url: "/api/deliverables/projects/123/spec-conflicts/export/",
          responseType: "blob",
        })
      );
    });
  });
});
