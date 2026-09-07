import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    createGameClearPath,
    createWorldCupGameRequest,
    GameRankContents,
    resolveGameContinuation,
    resolveGameSelection,
    updateGameRankContents,
} from './play';

describe('createWorldCupGameRequest', () => {
    it('creates the initial round request without exclusions', () => {
        assert.deepEqual(createWorldCupGameRequest(10, 16, [], 16), {
            worldcupId: 10,
            currentRound: 16,
            sliceContents: 1,
            excludeContentsIds: undefined,
            initialRound: 16,
        });
    });

    it('serializes excluded content ids for the next request', () => {
        assert.deepEqual(createWorldCupGameRequest(10, 8, [3, 7, 9], 16), {
            worldcupId: 10,
            currentRound: 8,
            sliceContents: 1,
            excludeContentsIds: '3,7,9',
            initialRound: 16,
        });
    });
});

describe('resolveGameSelection', () => {
    const contents = [{ contentsId: 10 }, { contentsId: 20 }] as const;

    it('selects the left candidate and excludes the right candidate', () => {
        assert.deepEqual(resolveGameSelection(contents, 0, [3]), {
            winnerContentId: 10,
            loserContentId: 20,
            nextExcludedContents: [3, 20],
        });
    });

    it('selects the right candidate and excludes the left candidate', () => {
        assert.deepEqual(resolveGameSelection(contents, 1, [3]), {
            winnerContentId: 20,
            loserContentId: 10,
            nextExcludedContents: [3, 10],
        });
    });
});

describe('resolveGameContinuation', () => {
    it('finishes immediately after a final-round selection', () => {
        assert.deepEqual(resolveGameContinuation([1, 2], 2, [20], 8), {
            type: 'finish',
        });
    });

    it('requests half of the current round after its last pair', () => {
        assert.deepEqual(resolveGameContinuation([1, 2], 8, [20, 40], 8), {
            type: 'request-next-round',
            nextRound: 4,
            excludedContentsIds: [20, 40],
            initialRound: 8,
        });
    });

    it('removes the played pair while the current round still has candidates', () => {
        const contents = [{ contentsId: 1 }, { contentsId: 2 }, { contentsId: 3 }, { contentsId: 4 }];

        assert.deepEqual(resolveGameContinuation(contents, 8, [2], 8), {
            type: 'show-next-pair',
            remainingContents: [{ contentsId: 3 }, { contentsId: 4 }],
        });
    });
});

describe('game rank contents', () => {
    const emptyRankContents: GameRankContents = {
        firstWinnerContentsId: 0,
        secondWinnerContentsId: 0,
        thirdWinnerContentsId: 0,
        fourthWinnerContentsId: 0,
    };

    it('records the first semifinal loser as fourth and the second as third', () => {
        const afterFirstSemifinal = updateGameRankContents(emptyRankContents, 4, {
            winnerContentId: 10,
            loserContentId: 20,
        });
        const afterSecondSemifinal = updateGameRankContents(afterFirstSemifinal, 4, {
            winnerContentId: 30,
            loserContentId: 40,
        });

        assert.equal(afterFirstSemifinal.fourthWinnerContentsId, 20);
        assert.equal(afterSecondSemifinal.thirdWinnerContentsId, 40);
    });

    it('records the final winner and loser without changing semifinal ranks', () => {
        const result = updateGameRankContents(
            { ...emptyRankContents, thirdWinnerContentsId: 40, fourthWinnerContentsId: 20 },
            2,
            { winnerContentId: 10, loserContentId: 30 }
        );

        assert.deepEqual(result, {
            firstWinnerContentsId: 10,
            secondWinnerContentsId: 30,
            thirdWinnerContentsId: 40,
            fourthWinnerContentsId: 20,
        });
    });

    it('creates a clear-page route with its play id and initial round', () => {
        assert.equal(
            createGameClearPath(
                5,
                '550e8400-e29b-41d4-a716-446655440000',
                4,
                {
                    firstWinnerContentsId: 10,
                    secondWinnerContentsId: 30,
                    thirdWinnerContentsId: 40,
                    fourthWinnerContentsId: 20,
                }
            ),
            '/play-clear/5/550e8400-e29b-41d4-a716-446655440000/4/10/30/40/20'
        );
    });
});
