import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createWorldCupClearRequest } from './clear';

describe('createWorldCupClearRequest', () => {
    it('creates a ranked placement request', () => {
        assert.deepEqual(
            createWorldCupClearRequest([
                '10',
                '550e8400-e29b-41d4-a716-446655440000',
                '16',
                '1',
                '2',
                '3',
                '4',
            ]),
            {
            worldCupId: '10',
                resultRequest: {
                    playId: '550e8400-e29b-41d4-a716-446655440000',
                    round: 16,
                    placements: [
                        { contentsId: 1, rank: 1 },
                        { contentsId: 2, rank: 2 },
                        { contentsId: 3, rank: 3 },
                        { contentsId: 4, rank: 4 },
                    ],
                },
            },
        );
    });

    it('omits unselected third and fourth places for a final-only game', () => {
        assert.deepEqual(
            createWorldCupClearRequest([
                '10',
                '550e8400-e29b-41d4-a716-446655440000',
                '2',
                '1',
                '2',
                '0',
                '0',
            ]).resultRequest,
            {
                playId: '550e8400-e29b-41d4-a716-446655440000',
                round: 2,
                placements: [
                    { contentsId: 1, rank: 1 },
                    { contentsId: 2, rank: 2 },
                ],
            },
        );
    });
});
