import { ManagedMediaFile } from '../manage/persistedContent';
import { WCListDataType, WCListViewData } from '../../interfaces/models/world-cup/WcListData';

interface WorldCupListMediaResponse {
    data: ManagedMediaFile;
}

export type WorldCupListMediaLoader = (
    mediaFileId: number,
    type: 'divide2'
) => Promise<WorldCupListMediaResponse | undefined>;

const isFulfilled = <T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> =>
    result.status === 'fulfilled';

export const mapWorldCupListMedia = async (
    gameList: WCListDataType[],
    loadMediaFile: WorldCupListMediaLoader
): Promise<WCListViewData[]> => {
    const promises = gameList.map(async (item): Promise<WCListViewData> => {
        const results = await Promise.allSettled([
            loadMediaFile(item.reftImgMediaFileNo, 'divide2'),
            loadMediaFile(item.rightImgMediaFileNo, 'divide2'),
        ]);

        // Keep the existing fulfilled-result compaction behavior. A positional fix is a separate change.
        const [response1, response2] = results.filter(isFulfilled).map((result) => result.value);
        const mappedMedia: Pick<
            WCListViewData,
            | 'reftImgMediaFileNo'
            | 'reftFileType'
            | 'reftSourceProvider'
            | 'reftSourceAuthor'
            | 'rightImgMediaFileNo'
            | 'rightFileType'
            | 'rightSourceProvider'
            | 'rightSourceAuthor'
        > = {
            reftImgMediaFileNo: response1 ? response1.data.mediaData : '/images/default.png',
            reftFileType: response1 ? response1.data.fileType || '' : '',
            reftSourceProvider: response1?.data.sourceProvider,
            reftSourceAuthor: response1?.data.sourceAuthor,
            rightImgMediaFileNo: response2 ? response2.data.mediaData : '/images/default.png',
            rightFileType: response2 ? response2.data.fileType || '' : '',
            rightSourceProvider: response2?.data.sourceProvider,
            rightSourceAuthor: response2?.data.sourceAuthor,
        };
        const mappedItem: WCListViewData = Object.assign(item, mappedMedia);

        // The former implementation returned a shallow copy after these missing-response accesses threw.
        if (!response1) return { ...mappedItem };
        if (response1.data.fileType === 'INTERNET_VIDEO_URL') {
            mappedItem.reftVideoStartTime = response1.data.videoStartTime || '00000';
            mappedItem.reftVideoPlayDuration = response1.data.videoPlayDuration || 3;
        }

        if (!response2) return { ...mappedItem };
        if (response2.data.fileType === 'INTERNET_VIDEO_URL') {
            mappedItem.rightVideoStartTime = response2.data.videoStartTime || '00000';
            mappedItem.rightVideoPlayDuration = response2.data.videoPlayDuration || 3;
        }

        return mappedItem;
    });

    return Promise.all(promises);
};
