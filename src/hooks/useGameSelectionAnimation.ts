import { useReducedMotion, useSpring } from '@react-spring/web';
import { createGameSelectionAnimationTargets } from '@/domain/game/selectionAnimation';

const RESTING_STYLE = {
    x: 0,
    opacity: 1,
    scale: 1,
};

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
        const targets = createGameSelectionAnimationTargets(selectedIndex, prefersReducedMotion);
        const config = { duration: targets.duration };

        await Promise.all([
            ...leftApi.start({ to: targets.left, config }),
            ...rightApi.start({ to: targets.right, config }),
        ]);
    };

    const resetSelectionAnimation = async () => {
        await Promise.all([
            ...leftApi.start({ to: RESTING_STYLE, immediate: true }),
            ...rightApi.start({ to: RESTING_STYLE, immediate: true }),
        ]);
    };

    return {
        leftStyle,
        rightStyle,
        animateSelection,
        resetSelectionAnimation,
    };
};
