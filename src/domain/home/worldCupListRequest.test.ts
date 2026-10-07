import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createWorldCupListUrl } from './worldCupListRequest';

describe('createWorldCupListUrl', () => {
    it('creates the public list URL with the existing query contract', () => {
        const url = createWorldCupListUrl(
            'https://api.iwtc.ddongmy.com/',
            2,
            9,
            'playCount',
            '강아지',
            'WEEK'
        );

        assert.equal(url.origin, 'https://api.iwtc.ddongmy.com');
        assert.equal(url.pathname, '/api/world-cups');
        assert.equal(url.searchParams.get('page'), '2');
        assert.equal(url.searchParams.get('size'), '9');
        assert.equal(url.searchParams.get('sort'), 'playCount,DESC');
        assert.equal(url.searchParams.get('keyword'), '강아지');
        assert.equal(url.searchParams.get('dateRange'), 'WEEK');
    });

    it('omits an undefined keyword without changing the default date range', () => {
        const url = createWorldCupListUrl('https://api.iwtc.ddongmy.com/', 0, 9, 'id');

        assert.equal(url.searchParams.has('keyword'), false);
        assert.equal(url.searchParams.get('dateRange'), 'ALL');
    });
});
