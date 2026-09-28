import { useReducedMotion, useSpring } from '@react-spring/web';
import {
    createCandidateSwapAnimationTargets,
    createGameSelectionAnimationTargets,
} from '@/domain/game/selectionAnimation';

const RESTING_STYLE = {
    x: 0,
    opacity: 1,
    scale: 1,
};

const getCandidateLayout = () =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
        ? 'stacked'
        : 'side-by-side';

const wait = (duration: number) => new Promise<void>((resolve) => window.setTimeout(resolve, duration));

export const useGameSelectionAnimation = () => {
    const prefersReducedMotion = useReducedMotion() === true;
    const [leftStyle, leftApi] = useSpring(() => ({
        from: RESTING_STYLE,
        to: RESTING_STYLE,
    }));
    const [rightStyle, rightApi] = useSpring(() => ({
        from: RESTING_STYLE,
        to: RESTING_STYLE,
    }));

    const animateSelection = async (selectedIndex: 0 | 1) => {
        const targets = createGameSelectionAnimationTargets(
            selectedIndex,
            prefersReducedMotion,
            getCandidateLayout()
        );
        const config = { duration: targets.duration };

        await Promise.all([
            ...leftApi.start({ to: targets.left, config, immediate: targets.duration === 0 }),
            ...rightApi.start({ to: targets.right, config, immediate: targets.duration === 0 }),
        ]);

        const remainingFeedbackDuration = targets.feedbackDuration - targets.duration;
        if (remainingFeedbackDuration > 0) {
            await wait(remainingFeedbackDuration);
        }
    };

    const prepareCandidateSwap = async () => {
        const targets = createCandidateSwapAnimationTargets(prefersReducedMotion);

        await Promise.all([
            ...leftApi.start({ to: targets.hidden, immediate: true }),
            ...rightApi.start({ to: targets.hidden, immediate: true }),
        ]);
    };

    const revealCandidates = async () => {
        const targets = createCandidateSwapAnimationTargets(prefersReducedMotion);

        if (targets.duration > 0) {
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            });
        }

        const config = { duration: targets.duration };
        await Promise.all([
            ...leftApi.start({ to: targets.visible, config, immediate: targets.duration === 0 }),
            ...rightApi.start({ to: targets.visible, config, immediate: targets.duration === 0 }),
        ]);
    };

    return {
        leftStyle,
        rightStyle,
        animateSelection,
        prepareCandidateSwap,
        revealCandidates,
    };
};
