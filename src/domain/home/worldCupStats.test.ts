import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatCount, getPlayableRoundLabel } from './worldCupStats';

describe('world cup card statistics', () => {
    it('uses the largest supported round that fits the candidate count', () => {
        assert.equal(getPlayableRoundLabel(2), '결승');
        assert.equal(getPlayableRoundLabel(10), '8강');
        assert.equal(getPlayableRoundLabel(16), '16강');
    });

    it('hides the round when the count is unavailable or too small', () => {
        assert.equal(getPlayableRoundLabel(), undefined);
        assert.equal(getPlayableRoundLabel(1), undefined);
    });

    it('formats engagement counts for Korean readers', () => {
        assert.equal(formatCount(1284), '1,284');
    });
});
