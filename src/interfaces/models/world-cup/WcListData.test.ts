import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadWCListData } from './WcListData';

describe('loadWCListData', () => {
    it('maps the world cup list API page to the existing list model', () => {
        const result = loadWCListData({
            totalElements: 1,
            content: [
                {
                    contentsName1: 'left',
                    contentsName2: 'right',
                    description: 'description',
                    mediaFileId1: 10,
                    mediaFileId2: 20,
                    worldCupId: 30,
                    title: 'title',
                    candidateCount: 16,
                    playCount: 1284,
                    commentCount: 23,
                },
            ],
            pageable: {
                pageNumber: 0,
                pageSize: 20,
            },
            totalPages: 1,
        });

        assert.deepEqual(result, {
            totalCount: 1,
            list: [
                {
                    reftContentName: 'left',
                    rightContentName: 'right',
                    description: 'description',
                    reftImgMediaFileNo: 10,
                    rightImgMediaFileNo: 20,
                    worldCupId: 30,
                    gameTitle: 'title',
                    candidateCount: 16,
                    playCount: 1284,
                    commentCount: 23,
                },
            ],
            pageable: {
                pageNumber: 0,
                pageSize: 20,
            },
            totalPage: 1,
        });
    });

    it('preserves the existing empty-content fallback', () => {
        const result = loadWCListData({
            totalElements: 0,
            pageable: {
                pageNumber: 0,
                pageSize: 20,
            },
            totalPages: 0,
        });

        assert.deepEqual(result.list, []);
    });
});
