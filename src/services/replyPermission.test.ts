import assert from 'node:assert/strict';
import test from 'node:test';
import { canDeleteReply } from './replyPermission';

test('allows only the member who wrote the reply to delete it', () => {
    assert.equal(canDeleteReply(7, 7), true);
    assert.equal(canDeleteReply(7, 8), false);
});

test('does not allow deleting guest replies or deletion while logged out', () => {
    assert.equal(canDeleteReply(null, 7), false);
    assert.equal(canDeleteReply(7, null), false);
    assert.equal(canDeleteReply(7, undefined), false);
});
