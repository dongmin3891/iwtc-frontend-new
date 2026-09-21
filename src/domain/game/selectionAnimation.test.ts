import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    createGameSelectionAnimationTargets,
    GAME_SELECTION_ANIMATION_DURATION,
} from './selectionAnimation';

describe('createGameSelectionAnimationTargets', () => {
    it('moves a selected left candidate toward the center and dismisses the right candidate', () => {
        const targets = createGameSelectionAnimationTargets(0, false);

        assert.equal(targets.duration, GAME_SELECTION_ANIMATION_DURATION);
        assert.deepEqual(targets.left, { x: 32, opacity: 1, scale: 1.02 });
        assert.deepEqual(targets.right, { x: 120, opacity: 0, scale: 0.98 });
    });

    it('preserves the existing visual direction when the right candidate is selected', () => {
        const targets = createGameSelectionAnimationTargets(1, false);

        assert.deepEqual(targets.left, { x: -120, opacity: 0, scale: 0.98 });
        assert.deepEqual(targets.right, { x: -32, opacity: 1, scale: 1.02 });
    });

    it('removes movement and delay when reduced motion is requested', () => {
        const targets = createGameSelectionAnimationTargets(0, true);

        assert.equal(targets.duration, 0);
        assert.deepEqual(targets.left, { x: 0, opacity: 1, scale: 1 });
        assert.deepEqual(targets.right, { x: 0, opacity: 1, scale: 1 });
    });
});
