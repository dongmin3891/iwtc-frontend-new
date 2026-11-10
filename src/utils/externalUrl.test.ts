import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getSafePexelsUrl } from './externalUrl';

describe('getSafePexelsUrl', () => {
    it('accepts HTTPS Pexels URLs', () => {
        assert.equal(getSafePexelsUrl('https://www.pexels.com/photo/123'), 'https://www.pexels.com/photo/123');
    });

    it('rejects executable, insecure, and lookalike URLs', () => {
        assert.equal(getSafePexelsUrl('javascript:alert(1)'), undefined);
        assert.equal(getSafePexelsUrl('http://www.pexels.com/photo/123'), undefined);
        assert.equal(getSafePexelsUrl('https://pexels.com.attacker.example/photo/123'), undefined);
    });
});
