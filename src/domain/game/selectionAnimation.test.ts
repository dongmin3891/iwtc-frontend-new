import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    createCandidateSwapAnimationTargets,
    createGameSelectionAnimationTargets,
    GAME_CANDIDATE_ENTER_DURATION,
    GAME_REDUCED_MOTION_FEEDBACK_DURATION,
    GAME_SELECTION_ANIMATION_DURATION,
    getCandidateSelectionState,
} from './selectionAnimation';

describe('getCandidateSelectionState', () => {
    it('keeps both candidates idle before a selection', () => {
        assert.equal(getCandidateSelectionState(null, 0), 'idle');
        assert.equal(getCandidateSelectionState(null, 1), 'idle');
    });

    it('distinguishes the selected and dismissed candidates', () => {
        assert.equal(getCandidateSelectionState(0, 0), 'selected');
        assert.equal(getCandidateSelectionState(0, 1), 'dismissed');
        assert.equal(getCandidateSelectionState(1, 0), 'dismissed');
        assert.equal(getCandidateSelectionState(1, 1), 'selected');
    });
});

describe('createGameSelectionAnimationTargets', () => {
    it('moves a selected left candidate toward the center and dismisses the right candidate', () => {
        const targets = createGameSelectionAnimationTargets(0, false);

        assert.equal(targets.duration, GAME_SELECTION_ANIMATION_DURATION);
        assert.equal(targets.feedbackDuration, GAME_SELECTION_ANIMATION_DURATION);
        assert.deepEqual(targets.left, { x: 32, opacity: 1, scale: 1.02 });
        assert.deepEqual(targets.right, { x: 120, opacity: 0, scale: 0.98 });
    });

    it('preserves the existing visual direction when the right candidate is selected', () => {
        const targets = createGameSelectionAnimationTargets(1, false);

        assert.deepEqual(targets.left, { x: -120, opacity: 0, scale: 0.98 });
        assert.deepEqual(targets.right, { x: -32, opacity: 1, scale: 1.02 });
    });

    it('uses a fade and scale transition without horizontal movement for stacked candidates', () => {
        const targets = createGameSelectionAnimationTargets(0, false, 'stacked');

        assert.equal(targets.duration, GAME_SELECTION_ANIMATION_DURATION);
        assert.deepEqual(targets.left, { x: 0, opacity: 1, scale: 1.015 });
        assert.deepEqual(targets.right, { x: 0, opacity: 0, scale: 0.96 });
    });

    it('removes movement but keeps non-motion feedback visible when reduced motion is requested', () => {
        const targets = createGameSelectionAnimationTargets(0, true);

        assert.equal(targets.duration, 0);
        assert.equal(targets.feedbackDuration, GAME_REDUCED_MOTION_FEEDBACK_DURATION);
        assert.deepEqual(targets.left, { x: 0, opacity: 1, scale: 1 });
        assert.deepEqual(targets.right, { x: 0, opacity: 1, scale: 1 });
    });
});

describe('createCandidateSwapAnimationTargets', () => {
    it('keeps new candidates hidden until their enter animation starts', () => {
        const targets = createCandidateSwapAnimationTargets(false);

        assert.equal(targets.duration, GAME_CANDIDATE_ENTER_DURATION);
        assert.deepEqual(targets.hidden, { x: 0, opacity: 0, scale: 0.985 });
        assert.deepEqual(targets.visible, { x: 0, opacity: 1, scale: 1 });
    });

    it('swaps candidates immediately when reduced motion is requested', () => {
        const targets = createCandidateSwapAnimationTargets(true);

        assert.equal(targets.duration, 0);
        assert.deepEqual(targets.hidden, { x: 0, opacity: 1, scale: 1 });
        assert.deepEqual(targets.visible, { x: 0, opacity: 1, scale: 1 });
    });
});
