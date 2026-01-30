import axiosInstance from '../../../config/axios';
import { getDrawingNotes, exportDrawingNotesToExcel } from '../api';

jest.mock('../../../config/axios');

describe('Drawing Notes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axiosInstance.mockResolvedValue({ data: { results: [] } });
  });

  describe('getDrawingNotes', () => {
    it('sends disciplines filter as disciplines param', async () => {
      await getDrawingNotes(1, 2, { disciplines: 'electrical' });

      expect(axiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            disciplines: 'electrical',
          }),
        })
      );
    });
  });

  describe('exportDrawingNotesToExcel', () => {
    beforeEach(() => {
      axiosInstance.mockResolvedValue({ data: new ArrayBuffer(8) });
    });

    it('sends disciplines filter as disciplines param', async () => {
      await exportDrawingNotesToExcel(1, 2, { disciplines: 'electrical' });

      expect(axiosInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            disciplines: 'electrical',
          }),
        })
      );
    });
  });
});
