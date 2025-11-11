import { getQAOptionsWithLabels } from '../qaUtils';

describe('qaUtils', () => {
    it('returns QA options sorted alphabetically by label', () => {
        const options = getQAOptionsWithLabels();
        const labels = options.map((option) => option.label);
        const sortedLabels = [...labels].sort((a, b) => a.localeCompare(b));

        expect(labels).toEqual(sortedLabels);
    });
});

