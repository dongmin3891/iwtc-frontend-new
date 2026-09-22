export const getRoundProgressIncrement = (initialRound: number) => 100 / (initialRound - 1);

export const getGameProgressPercentage = (initialRound: number, completedMatchCount: number) => {
    if (initialRound < 2 || completedMatchCount <= 0) {
        return 0;
    }

    return Math.min(100, getRoundProgressIncrement(initialRound) * completedMatchCount);
};

export const createRoundLabels = (initialRound: number) => {
    const labels: Record<string, number> = {};
    let currentRound = initialRound;
    let completedMatchCount = 0;

    while (currentRound >= 2) {
        const label = currentRound === 2 ? '결승' : `${currentRound}강`;
        labels[label] = getGameProgressPercentage(initialRound, completedMatchCount);
        completedMatchCount += currentRound / 2;
        currentRound /= 2;
    }

    return labels;
};
