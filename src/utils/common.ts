import { getMediaFileAPI } from '@/services/EtcService';
import { MappedMediaContent, MediaMappableContent, mergeMediaFile } from '@/domain/game/mediaFile';
import { mapWorldCupListMedia } from '@/domain/home/worldCupListMedia';
import { WCListDataType, WCListViewData } from '@/interfaces/models/world-cup/WcListData';

export { getMimeType, isMP4 } from './media';

export const mappingMediaFile = async <T extends MediaMappableContent>(
    gameList: T[]
): Promise<MappedMediaContent<T>[]> => {
    const promises = gameList.map(async (item) => {
        if ('mediaFile' in item) {
            return mergeMediaFile(item, item.mediaFile ?? undefined);
        }
        if (!item.mediaFileId) {
            return mergeMediaFile(item, undefined);
        }
        try {
            const response = await getMediaFileAPI(item.mediaFileId); // API 호출
            return mergeMediaFile(item, response?.data);
        } catch (error) {
            return mergeMediaFile(item, undefined);
        }
    });

    return Promise.all(promises);
};

export const mappingMediaFile2 = async (gameList: WCListDataType[]): Promise<WCListViewData[]> =>
    mapWorldCupListMedia(gameList, getMediaFileAPI);
