import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { WCListDataType } from '../../interfaces/models/world-cup/WcListData';
import { mapWorldCupListMedia, WorldCupListMediaLoader } from './worldCupListMedia';

const createItem = (): WCListDataType => ({
    reftContentName: 'left',
    rightContentName: 'right',
    description: 'description',
    worldCupId: 1,
    gameTitle: 'title',
    reftImgMediaFileNo: 10,
    rightImgMediaFileNo: 20,
});

const media = (mediaData: string, author: string) => ({
    data: {
        mediaData,
        fileType: 'STATIC_MEDIA_FILE',
        sourceProvider: 'PEXELS',
        sourceUrl: `https://www.pexels.com/photo/${author}`,
        sourceAuthor: author,
        sourceAuthorUrl: `https://www.pexels.com/@${author}`,
    },
});

describe('mapWorldCupListMedia', () => {
    it('maps both sides when both media requests succeed', async () => {
        const loader: WorldCupListMediaLoader = async (id) =>
            id === 10 ? media('left-image', 'left-author') : media('right-image', 'right-author');

        const [result] = await mapWorldCupListMedia([createItem()], loader);

        assert.equal(result.reftImgMediaFileNo, 'left-image');
        assert.equal(result.rightImgMediaFileNo, 'right-image');
        assert.equal(result.reftSourceUrl, 'https://www.pexels.com/photo/left-author');
        assert.equal(result.reftSourceAuthorUrl, 'https://www.pexels.com/@left-author');
        assert.equal(result.rightSourceUrl, 'https://www.pexels.com/photo/right-author');
        assert.equal(result.rightSourceAuthorUrl, 'https://www.pexels.com/@right-author');
    });

    it('uses embedded media without making fallback requests', async () => {
        let requestCount = 0;
        const loader: WorldCupListMediaLoader = async () => {
            requestCount += 1;
            return undefined;
        };
        const item = {
            ...createItem(),
            reftMediaFile: media('embedded-left', 'left-author').data,
            rightMediaFile: media('embedded-right', 'right-author').data,
        };

        const [result] = await mapWorldCupListMedia([item], loader);

        assert.equal(requestCount, 0);
        assert.equal(result.reftImgMediaFileNo, 'embedded-left');
        assert.equal(result.rightImgMediaFileNo, 'embedded-right');
    });

    it('preserves the existing shifted placement when only the left request rejects', async () => {
        const loader: WorldCupListMediaLoader = async (id) => {
            if (id === 10) throw new Error('left failed');
            return media('right-image', 'right-author');
        };

        const [result] = await mapWorldCupListMedia([createItem()], loader);

        assert.equal(result.reftImgMediaFileNo, 'right-image');
        assert.equal(result.rightImgMediaFileNo, '/images/default.png');
    });

    it('keeps the left response in place when only the right request rejects', async () => {
        const loader: WorldCupListMediaLoader = async (id) => {
            if (id === 20) throw new Error('right failed');
            return media('left-image', 'left-author');
        };

        const [result] = await mapWorldCupListMedia([createItem()], loader);

        assert.equal(result.reftImgMediaFileNo, 'left-image');
        assert.equal(result.rightImgMediaFileNo, '/images/default.png');
    });

    it('uses both fallback images when both requests reject', async () => {
        const loader: WorldCupListMediaLoader = async () => {
            throw new Error('failed');
        };

        const [result] = await mapWorldCupListMedia([createItem()], loader);

        assert.equal(result.reftImgMediaFileNo, '/images/default.png');
        assert.equal(result.rightImgMediaFileNo, '/images/default.png');
    });
});
