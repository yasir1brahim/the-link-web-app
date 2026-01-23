import {
  getNextParaNo,
  isManuallyAddedParaNo,
  incrementSuffix
} from '../paraNoUtils';

describe('paraNoUtils', () => {
  describe('isManuallyAddedParaNo', () => {
    it('returns true for single lowercase letter suffix', () => {
      expect(isManuallyAddedParaNo('1.04-a')).toBe(true);
      expect(isManuallyAddedParaNo('1.04-z')).toBe(true);
    });

    it('returns true for multi-character lowercase suffix', () => {
      // After 'z', we expect 'aa', 'ab', etc.
      expect(isManuallyAddedParaNo('1.04-aa')).toBe(true);
      expect(isManuallyAddedParaNo('1.04-az')).toBe(true);
      expect(isManuallyAddedParaNo('1.04-ba')).toBe(true);
    });

    it('returns true for complex hierarchies with manual suffix', () => {
      expect(isManuallyAddedParaNo('1.04-A-1-a')).toBe(true);
      expect(isManuallyAddedParaNo('1.04-A-1-aa')).toBe(true);
    });

    it('returns false for original rows without manual suffix', () => {
      expect(isManuallyAddedParaNo('1.04')).toBe(false);
      expect(isManuallyAddedParaNo('1.04-A')).toBe(false);
      expect(isManuallyAddedParaNo('1.04-A-1')).toBe(false);
    });

    it('returns false for uppercase suffix (original hierarchy)', () => {
      expect(isManuallyAddedParaNo('1.04-A')).toBe(false);
      expect(isManuallyAddedParaNo('1.04-B-2')).toBe(false);
    });

    it('returns false for numeric suffix', () => {
      expect(isManuallyAddedParaNo('1.04-1')).toBe(false);
      expect(isManuallyAddedParaNo('1.04-A-1')).toBe(false);
    });
  });

  describe('incrementSuffix', () => {
    it('increments single letters a-y', () => {
      expect(incrementSuffix('a')).toBe('b');
      expect(incrementSuffix('m')).toBe('n');
      expect(incrementSuffix('y')).toBe('z');
    });

    it('wraps z to aa', () => {
      expect(incrementSuffix('z')).toBe('aa');
    });

    it('increments multi-character suffixes', () => {
      expect(incrementSuffix('aa')).toBe('ab');
      expect(incrementSuffix('ay')).toBe('az');
    });

    it('wraps az to ba', () => {
      expect(incrementSuffix('az')).toBe('ba');
    });

    it('wraps zz to aaa', () => {
      expect(incrementSuffix('zz')).toBe('aaa');
    });

    it('handles longer sequences', () => {
      expect(incrementSuffix('abc')).toBe('abd');
      expect(incrementSuffix('azz')).toBe('baa');
      expect(incrementSuffix('zzz')).toBe('aaaa');
    });

    it('returns "a" when no suffix provided', () => {
      expect(incrementSuffix('')).toBe('a');
      expect(incrementSuffix(undefined)).toBe('a');
      expect(incrementSuffix(null)).toBe('a');
    });
  });

  describe('getNextParaNo', () => {
    describe('adding child rows to original rows', () => {
      it('adds first child with -a suffix to original row', () => {
        const existingParaNos = ['1.04'];
        const result = getNextParaNo('1.04', existingParaNos);
        expect(result).toBe('1.04-a');
      });

      it('adds child to complex hierarchy original row', () => {
        const existingParaNos = ['1.04-A-1'];
        const result = getNextParaNo('1.04-A-1', existingParaNos);
        expect(result).toBe('1.04-A-1-a');
      });

      it('finds next available child suffix', () => {
        const existingParaNos = ['1.04', '1.04-a', '1.04-b'];
        const result = getNextParaNo('1.04', existingParaNos);
        expect(result).toBe('1.04-c');
      });

      it('skips gaps in existing children', () => {
        const existingParaNos = ['1.04', '1.04-a', '1.04-c'];
        const result = getNextParaNo('1.04', existingParaNos);
        // Should find max and increment, not fill gap
        expect(result).toBe('1.04-d');
      });
    });

    describe('adding sibling rows to manually-added rows', () => {
      it('adds sibling to manually-added row', () => {
        const existingParaNos = ['1.04', '1.04-a'];
        const result = getNextParaNo('1.04-a', existingParaNos);
        expect(result).toBe('1.04-b');
      });

      it('adds sibling with correct increment when multiple exist', () => {
        const existingParaNos = ['1.04', '1.04-a', '1.04-b', '1.04-c'];
        const result = getNextParaNo('1.04-c', existingParaNos);
        expect(result).toBe('1.04-d');
      });

      it('adds sibling to complex hierarchy manually-added row', () => {
        const existingParaNos = ['1.04-A-1', '1.04-A-1-a', '1.04-A-1-b'];
        const result = getNextParaNo('1.04-A-1-b', existingParaNos);
        expect(result).toBe('1.04-A-1-c');
      });
    });

    describe('edge case: reaching z and beyond', () => {
      it('adds aa after z', () => {
        // Build array with all single letters a-z
        const existingParaNos = ['1.04'];
        for (let i = 0; i < 26; i++) {
          existingParaNos.push(`1.04-${String.fromCharCode(97 + i)}`);
        }
        const result = getNextParaNo('1.04', existingParaNos);
        expect(result).toBe('1.04-aa');
      });

      it('adds sibling after z (from z row)', () => {
        const existingParaNos = ['1.04'];
        for (let i = 0; i < 26; i++) {
          existingParaNos.push(`1.04-${String.fromCharCode(97 + i)}`);
        }
        const result = getNextParaNo('1.04-z', existingParaNos);
        expect(result).toBe('1.04-aa');
      });

      it('increments multi-character suffixes correctly', () => {
        const existingParaNos = ['1.04', '1.04-aa', '1.04-ab', '1.04-ac'];
        const result = getNextParaNo('1.04', existingParaNos);
        expect(result).toBe('1.04-ad');
      });

      it('wraps az to ba', () => {
        // Build array with a-z, then aa-az
        const existingParaNos = ['1.04'];
        for (let i = 0; i < 26; i++) {
          existingParaNos.push(`1.04-${String.fromCharCode(97 + i)}`);
        }
        for (let i = 0; i < 26; i++) {
          existingParaNos.push(`1.04-a${String.fromCharCode(97 + i)}`);
        }
        const result = getNextParaNo('1.04', existingParaNos);
        expect(result).toBe('1.04-ba');
      });
    });

    describe('edge cases', () => {
      it('handles empty existing para_nos array', () => {
        const result = getNextParaNo('1.04', []);
        expect(result).toBe('1.04-a');
      });

      it('handles null/undefined existing para_nos', () => {
        expect(getNextParaNo('1.04', null)).toBe('1.04-a');
        expect(getNextParaNo('1.04', undefined)).toBe('1.04-a');
      });

      it('only considers children/siblings with matching prefix', () => {
        const existingParaNos = ['1.04', '1.04-a', '1.05-a', '2.04-a'];
        const result = getNextParaNo('1.04', existingParaNos);
        expect(result).toBe('1.04-b');
      });

      it('handles deeply nested hierarchies', () => {
        const existingParaNos = ['1.04-A-1-B-2', '1.04-A-1-B-2-a', '1.04-A-1-B-2-b'];
        const result = getNextParaNo('1.04-A-1-B-2', existingParaNos);
        expect(result).toBe('1.04-A-1-B-2-c');
      });
    });
  });
});
