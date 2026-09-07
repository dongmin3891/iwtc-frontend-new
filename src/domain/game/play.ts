export interface WorldCupGameRequest {
    worldcupId: number;
    currentRound: number;
    sliceContents: number;
    excludeContentsIds?: string;
    initialRound: number;
}

interface SelectableGameContent {
    contentsId: number;
}

export interface GameSelectionResult {
    winnerContentId: number;
    loserContentId: number;
    nextExcludedContents: number[];
}

export interface GameRankContents {
    firstWinnerContentsId: number;
    secondWinnerContentsId: number;
    thirdWinnerContentsId: number;
    fourthWinnerContentsId: number;
}

export type GameContinuation<T> =
    | { type: 'finish' }
    | {
          type: 'request-next-round';
          nextRound: number;
          excludedContentsIds: number[];
          initialRound: number;
      }
    | { type: 'show-next-pair'; remainingContents: T[] };

export const resolveGameSelection = (
    contents: readonly [SelectableGameContent, SelectableGameContent, ...SelectableGameContent[]],
    selectedIndex: 0 | 1,
    excludedContentsIds: number[]
): GameSelectionResult => {
    const loserIndex = selectedIndex === 0 ? 1 : 0;
    const winnerContentId = contents[selectedIndex].contentsId;
    const loserContentId = contents[loserIndex].contentsId;

    return {
        winnerContentId,
        loserContentId,
        nextExcludedContents: excludedContentsIds.concat(loserContentId),
    };
};

export const resolveGameContinuation = <T>(
    contents: T[],
    currentRound: number,
    excludedContentsIds: number[],
    initialRound: number
): GameContinuation<T> => {
    if (currentRound === 2) {
        return { type: 'finish' };
    }

    if (contents.length === 2) {
        return {
            type: 'request-next-round',
            nextRound: currentRound / 2,
            excludedContentsIds,
            initialRound,
        };
    }

    return {
        type: 'show-next-pair',
        remainingContents: contents.slice(2),
    };
};

export const updateGameRankContents = (
    rankContents: GameRankContents,
    currentRound: number,
    selection: Pick<GameSelectionResult, 'winnerContentId' | 'loserContentId'>
): GameRankContents => {
    if (currentRound === 4) {
        if (rankContents.fourthWinnerContentsId !== 0) {
            return { ...rankContents, thirdWinnerContentsId: selection.loserContentId };
        }
        return { ...rankContents, fourthWinnerContentsId: selection.loserContentId };
    }

    if (currentRound === 2) {
        return {
            ...rankContents,
            firstWinnerContentsId: selection.winnerContentId,
            secondWinnerContentsId: selection.loserContentId,
        };
    }

    return rankContents;
};

export const createGameClearPath = (
    worldCupId: number,
    playId: string,
    initialRound: number,
    rankContents: GameRankContents
): string =>
    `/play-clear/${worldCupId}/${playId}/${initialRound}/${rankContents.firstWinnerContentsId}/${rankContents.secondWinnerContentsId}/${rankContents.thirdWinnerContentsId}/${rankContents.fourthWinnerContentsId}`;

export const createWorldCupGameRequest = (
    worldCupId: number,
    currentRound: number,
    excludedContentsIds: number[],
    initialRound: number
): WorldCupGameRequest => ({
    worldcupId: worldCupId,
    currentRound,
    sliceContents: 1,
    excludeContentsIds: excludedContentsIds.length === 0 ? undefined : excludedContentsIds.join(','),
    initialRound,
});
