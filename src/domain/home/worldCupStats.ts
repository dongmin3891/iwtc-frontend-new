const supportedRounds = [2, 4, 8, 16, 32, 64, 128, 256] as const;

export const getPlayableRoundLabel = (candidateCount?: number) => {
    if (candidateCount === undefined) {
        return undefined;
    }

    const playableRound = [...supportedRounds].reverse().find((round) => round <= candidateCount);
    if (!playableRound) {
        return undefined;
    }

    return playableRound === 2 ? '결승' : `${playableRound}강`;
};

export const formatCount = (count: number) => count.toLocaleString('ko-KR');
