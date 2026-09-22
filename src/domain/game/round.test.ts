import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRoundLabels, getGameProgressPercentage, getRoundProgressIncrement } from './round';

describe('game round progress', () => {
    it('calculates the progress increment from the initial round', () => {
        assert.equal(getRoundProgressIncrement(4), 100 / 3);
        assert.equal(getRoundProgressIncrement(8), 100 / 7);
        assert.equal(getRoundProgressIncrement(16), 100 / 15);
    });

    it('starts at zero and advances only for completed matches', () => {
        assert.equal(getGameProgressPercentage(4, 0), 0);
        assert.equal(getGameProgressPercentage(4, 1), 100 / 3);
        assert.equal(getGameProgressPercentage(4, 2), (100 / 3) * 2);
        assert.equal(getGameProgressPercentage(4, 3), 100);
    });

    it('caps completed-match progress at one hundred percent', () => {
        assert.equal(getGameProgressPercentage(8, 8), 100);
        assert.equal(getGameProgressPercentage(0, 1), 0);
    });

    it('creates labels for a four-player tournament', () => {
        assert.deepEqual(createRoundLabels(4), {
            '4강': 0,
            결승: (100 / 3) * 2,
        });
    });

    it('creates labels for an eight-player tournament', () => {
        assert.deepEqual(createRoundLabels(8), {
            '8강': 0,
            '4강': (100 / 7) * 4,
            결승: (100 / 7) * 6,
        });
    });

    it('creates labels for a sixteen-player tournament', () => {
        assert.deepEqual(createRoundLabels(16), {
            '16강': 0,
            '8강': (100 / 15) * 8,
            '4강': (100 / 15) * 12,
            결승: (100 / 15) * 14,
        });
    });
});
