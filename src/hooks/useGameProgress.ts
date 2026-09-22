import { createRoundLabels, getGameProgressPercentage } from '@/domain/game/round';
import { useEffect, useState } from 'react';

export const useGameProgress = () => {
    const [initialRound, setInitialRound] = useState(0);
    const [completedMatchCount, setCompletedMatchCount] = useState(0);
    const [roundLabels, setRoundLabels] = useState<Record<string, number>>({});

    useEffect(() => {
        if (initialRound !== 0) {
            setRoundLabels(createRoundLabels(initialRound));
        }
    }, [initialRound]);

    const initializeProgress = (round: number) => {
        setInitialRound(round);
        setCompletedMatchCount(0);
    };

    const advanceProgress = () => {
        setCompletedMatchCount((previous) => Math.min(previous + 1, Math.max(initialRound - 1, 0)));
    };

    return {
        initialRound,
        progressPercentage: getGameProgressPercentage(initialRound, completedMatchCount),
        roundLabels,
        initializeProgress,
        advanceProgress,
    };
};
