import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseChangelog } from './changelog';

describe('parseChangelog', () => {
    it('parses releases, summaries, sections, and list items', () => {
        const releases = parseChangelog(`# Updates

## 2.0.0 · 2026-09-28

새 기준 버전입니다.

### 게임 경험

- 고정 대진을 적용했습니다.
- 모바일 전환을 개선했습니다.
`);

        assert.deepEqual(releases, [
            {
                version: '2.0.0',
                date: '2026-09-28',
                summary: '새 기준 버전입니다.',
                sections: [
                    {
                        title: '게임 경험',
                        items: ['고정 대진을 적용했습니다.', '모바일 전환을 개선했습니다.'],
                    },
                ],
            },
        ]);
    });

    it('keeps release order and provides a default section for top-level items', () => {
        const releases = parseChangelog(`## 2.0.0 · 2026-09-28
- 현재 변경

## 1.0.0 · 2025-01-01
- 이전 변경
`);

        assert.deepEqual(
            releases.map(({ version, sections }) => ({ version, section: sections[0] })),
            [
                { version: '2.0.0', section: { title: '주요 변경', items: ['현재 변경'] } },
                { version: '1.0.0', section: { title: '주요 변경', items: ['이전 변경'] } },
            ]
        );
    });
});
