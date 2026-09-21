import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createTrafficResponse } from './trafficRoute';

describe('createTrafficResponse', () => {
    it('returns an unavailable response without exposing the upstream error', async () => {
        const originalConsoleError = console.error;
        console.error = () => undefined;
        let response: Response;

        try {
            response = await createTrafficResponse(
                async () => {
                    throw new Error('Bearer secret-token: Cloudflare raw error');
                },
                () => new Date('2026-09-21T03:30:00.000Z')
            );
        } finally {
            console.error = originalConsoleError;
        }

        assert.equal(response.status, 503);
        assert.equal(response.headers.get('Cache-Control'), 'no-store');
        assert.deepEqual(await response.json(), {
            status: 'unavailable',
            checkedAt: '2026-09-21T03:30:00.000Z',
        });
    });
});
