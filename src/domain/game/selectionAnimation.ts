export type CandidateAnimationTarget = {
    x: number;
    opacity: number;
    scale: number;
};

export type GameSelectionAnimationTargets = {
    duration: number;
    left: CandidateAnimationTarget;
    right: CandidateAnimationTarget;
};

export const GAME_SELECTION_ANIMATION_DURATION = 320;

const RESTING_TARGET: CandidateAnimationTarget = {
    x: 0,
    opacity: 1,
    scale: 1,
};

export const createGameSelectionAnimationTargets = (
    selectedIndex: 0 | 1,
    reducedMotion: boolean
): GameSelectionAnimationTargets => {
    if (reducedMotion) {
        return {
            duration: 0,
            left: RESTING_TARGET,
            right: RESTING_TARGET,
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
        left: selectedIndex === 0 ? selectedTarget : dismissedTarget,
        right: selectedIndex === 0 ? dismissedTarget : selectedTarget,
    };
};
