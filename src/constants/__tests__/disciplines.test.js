import { DISCIPLINE_CODES, getDisciplineDisplayName } from '../disciplines';

describe('disciplines constants', () => {
  describe('DISCIPLINE_CODES', () => {
    it('contains all NCS discipline codes', () => {
      expect(DISCIPLINE_CODES).toContain('general');
      expect(DISCIPLINE_CODES).toContain('mechanical');
      expect(DISCIPLINE_CODES).toContain('electrical');
      expect(DISCIPLINE_CODES).toContain('plumbing');
      expect(DISCIPLINE_CODES).toContain('fire_protection');
      expect(DISCIPLINE_CODES.length).toBe(21);
    });
  });

  describe('getDisciplineDisplayName', () => {
    it('returns display name for known codes', () => {
      expect(getDisciplineDisplayName('mechanical')).toBe('Mechanical');
      expect(getDisciplineDisplayName('fire_protection')).toBe('Fire Protection');
      expect(getDisciplineDisplayName('survey_mapping')).toBe('Survey/Mapping');
    });

    it('returns code as fallback for unknown codes', () => {
      expect(getDisciplineDisplayName('unknown_code')).toBe('unknown_code');
    });
  });
});
