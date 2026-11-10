import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { getAccessToken, removeToken, setToken } from './TokenManager';

describe('TokenManager', () => {
    afterEach(() => removeToken());

    it('keeps the access token only in module memory', () => {
        setToken('access-token');

        assert.equal(getAccessToken(), 'access-token');
    });

    it('clears the in-memory access token', () => {
        setToken('access-token');
        removeToken();

        assert.equal(getAccessToken(), '');
    });
});
