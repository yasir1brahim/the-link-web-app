import { isLogEligibleForChildEntry } from '../projectLogsUtils';

describe('projectLogsUtils', () => {
  describe('isLogEligibleForChildEntry', () => {
    it('returns false when log is null', () => {
      expect(isLogEligibleForChildEntry(null)).toBe(false);
    });

    it('returns false when para_no is missing', () => {
      expect(
        isLogEligibleForChildEntry({
          id: 42,
          spec_section: '01 23 00',
          para_no: '',
        })
      ).toBe(false);
    });

    it('returns true when required fields are present', () => {
      expect(
        isLogEligibleForChildEntry({
          id: 42,
          spec_section: '01 23 00',
          para_no: '1.04',
        })
      ).toBe(true);
    });
  });
});

