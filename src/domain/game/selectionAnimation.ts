export type CandidateAnimationTarget = {
    x: number;
    opacity: number;
    scale: number;
};

export type GameSelectionAnimationTargets = {
    duration: number;
    feedbackDuration: number;
    left: CandidateAnimationTarget;
    right: CandidateAnimationTarget;
};

export type CandidateSwapAnimationTargets = {
    duration: number;
    hidden: CandidateAnimationTarget;
    visible: CandidateAnimationTarget;
};

export type CandidateSelectionState = 'idle' | 'selected' | 'dismissed';
export type CandidateLayout = 'side-by-side' | 'stacked';

export const getCandidateSelectionState = (
    selectedIndex: 0 | 1 | null,
    candidateIndex: 0 | 1
): CandidateSelectionState => {
    if (selectedIndex === null) {
        return 'idle';
    }

    return selectedIndex === candidateIndex ? 'selected' : 'dismissed';
};

export const GAME_SELECTION_ANIMATION_DURATION = 320;
export const GAME_REDUCED_MOTION_FEEDBACK_DURATION = 180;
export const GAME_CANDIDATE_ENTER_DURATION = 180;

const RESTING_TARGET: CandidateAnimationTarget = {
    x: 0,
    opacity: 1,
    scale: 1,
};

const HIDDEN_SWAP_TARGET: CandidateAnimationTarget = {
    x: 0,
    opacity: 0,
    scale: 0.985,
};

export const createCandidateSwapAnimationTargets = (reducedMotion: boolean): CandidateSwapAnimationTargets => {
    if (reducedMotion) {
        return {
            duration: 0,
            hidden: RESTING_TARGET,
            visible: RESTING_TARGET,
        };
    }

    return {
        duration: GAME_CANDIDATE_ENTER_DURATION,
        hidden: HIDDEN_SWAP_TARGET,
        visible: RESTING_TARGET,
    };
};

export const createGameSelectionAnimationTargets = (
    selectedIndex: 0 | 1,
    reducedMotion: boolean,
    layout: CandidateLayout = 'side-by-side'
): GameSelectionAnimationTargets => {
    if (reducedMotion) {
        return {
            duration: 0,
            feedbackDuration: GAME_REDUCED_MOTION_FEEDBACK_DURATION,
            left: RESTING_TARGET,
            right: RESTING_TARGET,
        };
    }

    if (layout === 'stacked') {
        const selectedTarget: CandidateAnimationTarget = {
            x: 0,
            opacity: 1,
            scale: 1.015,
        };
        const dismissedTarget: CandidateAnimationTarget = {
            x: 0,
            opacity: 0,
            scale: 0.96,
        };

        return {
            duration: GAME_SELECTION_ANIMATION_DURATION,
            feedbackDuration: GAME_SELECTION_ANIMATION_DURATION,
            left: selectedIndex === 0 ? selectedTarget : dismissedTarget,
            right: selectedIndex === 0 ? dismissedTarget : selectedTarget,
        };
    }

    const selectedTarget: CandidateAnimationTarget = {
        x: selectedIndex === 0 ? 32 : -32,
        opacity: 1,
        scale: 1.02,
    };
    const dismissedTarget: CandidateAnimationTarget = {
        x: selectedIndex === 0 ? 120 : -120,
        opacity: 0,
        scale: 0.98,
    };

    return {
        duration: GAME_SELECTION_ANIMATION_DURATION,
        feedbackDuration: GAME_SELECTION_ANIMATION_DURATION,
        left: selectedIndex === 0 ? selectedTarget : dismissedTarget,
        right: selectedIndex === 0 ? dismissedTarget : selectedTarget,
    };
};
