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
    it('creates the initial fixed-bracket request', () => {
        assert.deepEqual(createWorldCupGameRequest(10, 16, 16), {
            worldcupId: 10,
            currentRound: 16,
            sliceContents: 1,
            initialRound: 16,
        });
    });
});

describe('resolveGameSelection', () => {
    const contents = [{ contentsId: 10 }, { contentsId: 20 }] as const;

    it('selects the left candidate and identifies the right candidate as the loser', () => {
        assert.deepEqual(resolveGameSelection(contents, 0), {
            winnerContentId: 10,
            loserContentId: 20,
        });
    });

    it('selects the right candidate and identifies the left candidate as the loser', () => {
        assert.deepEqual(resolveGameSelection(contents, 1), {
            winnerContentId: 20,
            loserContentId: 10,
        });
    });
});

describe('resolveGameContinuation', () => {
    it('finishes immediately after a final-round selection', () => {
        assert.deepEqual(resolveGameContinuation([1, 2], 2, [], 1, 8), {
            type: 'finish',
        });
    });

    it('starts the next round with exactly the winners of the current round', () => {
        assert.deepEqual(resolveGameContinuation([7, 8], 8, [1, 4, 5], 7, 8), {
            type: 'start-next-round',
            nextRound: 4,
            nextRoundContents: [1, 4, 5, 7],
            initialRound: 8,
        });
    });

    it('removes the played pair and accumulates its winner', () => {
        const contents = [{ contentsId: 1 }, { contentsId: 2 }, { contentsId: 3 }, { contentsId: 4 }];

        assert.deepEqual(resolveGameContinuation(contents, 8, [], contents[0], 8), {
            type: 'show-next-pair',
            remainingContents: [{ contentsId: 3 }, { contentsId: 4 }],
            roundWinners: [{ contentsId: 1 }],
        });
    });

    it('keeps only selected candidates through an eight-player bracket', () => {
        const quarterfinals = [1, 2, 3, 4, 5, 6, 7, 8];

        const afterFirstMatch = resolveGameContinuation(quarterfinals, 8, [], 1, 8);
        assert.equal(afterFirstMatch.type, 'show-next-pair');
        if (afterFirstMatch.type !== 'show-next-pair') return;

        const afterSecondMatch = resolveGameContinuation(
            afterFirstMatch.remainingContents,
            8,
            afterFirstMatch.roundWinners,
            4,
            8
        );
        assert.equal(afterSecondMatch.type, 'show-next-pair');
        if (afterSecondMatch.type !== 'show-next-pair') return;

        const afterThirdMatch = resolveGameContinuation(
            afterSecondMatch.remainingContents,
            8,
            afterSecondMatch.roundWinners,
            5,
            8
        );
        assert.equal(afterThirdMatch.type, 'show-next-pair');
        if (afterThirdMatch.type !== 'show-next-pair') return;

        const quarterfinalResult = resolveGameContinuation(
            afterThirdMatch.remainingContents,
            8,
            afterThirdMatch.roundWinners,
            7,
            8
        );

        assert.deepEqual(quarterfinalResult, {
            type: 'start-next-round',
            nextRound: 4,
            nextRoundContents: [1, 4, 5, 7],
            initialRound: 8,
        });
        if (quarterfinalResult.type !== 'start-next-round') return;

        const afterFirstSemifinal = resolveGameContinuation(
            quarterfinalResult.nextRoundContents,
            4,
            [],
            4,
            8
        );
        assert.equal(afterFirstSemifinal.type, 'show-next-pair');
        if (afterFirstSemifinal.type !== 'show-next-pair') return;

        const final = resolveGameContinuation(
            afterFirstSemifinal.remainingContents,
            4,
            afterFirstSemifinal.roundWinners,
            7,
            8
        );

        assert.deepEqual(final, {
            type: 'start-next-round',
            nextRound: 2,
            nextRoundContents: [4, 7],
            initialRound: 8,
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
