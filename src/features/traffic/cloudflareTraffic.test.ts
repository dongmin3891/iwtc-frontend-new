import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    getSeoulTrafficQueryWindow,
    parseCloudflareTrafficCounts,
} from './cloudflareTraffic';

describe('getSeoulTrafficQueryWindow', () => {
    it('calculates today and the seven-day window from the KST calendar', () => {
        assert.deepEqual(getSeoulTrafficQueryWindow(new Date('2026-09-21T03:30:00.000Z')), {
            todayStartsAt: '2026-09-20T15:00:00.000Z',
            lastSevenDaysStartAt: '2026-09-14T15:00:00.000Z',
            endsAt: '2026-09-21T03:30:00.000Z',
        });
    });

    it('keeps the previous KST day until midnight in Seoul', () => {
        assert.deepEqual(getSeoulTrafficQueryWindow(new Date('2026-09-20T14:59:59.000Z')), {
            todayStartsAt: '2026-09-19T15:00:00.000Z',
            lastSevenDaysStartAt: '2026-09-13T15:00:00.000Z',
            endsAt: '2026-09-20T14:59:59.000Z',
        });
    });

    it('rejects an invalid current time', () => {
        assert.throws(() => getSeoulTrafficQueryWindow(new Date('invalid')), /must be valid/);
    });
});

describe('parseCloudflareTrafficCounts', () => {
    it('sums visits for today and the last seven days', () => {
        assert.deepEqual(
            parseCloudflareTrafficCounts({
                data: {
                    viewer: {
                        zones: [
                            {
                                today: [{ sum: { visits: 3 } }, { sum: { visits: 2 } }],
                                lastSevenDays: [{ sum: { visits: 21 } }],
                            },
                        ],
                    },
                },
                errors: null,
            }),
            { todayVisits: 5, lastSevenDaysVisits: 21 }
        );
    });

    it('rejects GraphQL errors instead of treating them as zero visits', () => {
        assert.throws(
            () =>
                parseCloudflareTrafficCounts({
                    data: null,
                    errors: [{ message: 'not authorized' }],
                }),
            /GraphQL errors/
        );
    });

    it('rejects malformed visit values', () => {
        assert.throws(() =>
            parseCloudflareTrafficCounts({
                data: {
                    viewer: {
                        zones: [
                            {
                                today: [{ sum: { visits: -1 } }],
                                lastSevenDays: [],
                            },
                        ],
                    },
                },
            })
        );
    });
});
