import { ManagedMediaFile } from '../manage/persistedContent';

export interface MediaMappableContent {
    mediaFileId: number;
    imgUrl?: string;
    fileType?: string;
    videoStartTime?: string;
    videoPlayDuration?: number;
    sourceProvider?: string | null;
    sourceExternalId?: string | null;
    sourceUrl?: string | null;
    sourceAuthor?: string | null;
    sourceAuthorUrl?: string | null;
}

export type MappedMediaContent<T extends MediaMappableContent> = T & MediaMappableContent & { imgUrl: string };

export const mergeMediaFile = <T extends MediaMappableContent>(
    content: T,
    mediaFile: ManagedMediaFile | undefined
): MappedMediaContent<T> => {
    if (!mediaFile) {
        return Object.assign(content, { imgUrl: '/images/default.png' });
    }

    return Object.assign(content, {
        imgUrl: mediaFile.mediaData,
        fileType: mediaFile.fileType,
        videoStartTime: mediaFile.videoStartTime,
        videoPlayDuration: mediaFile.videoPlayDuration,
        sourceProvider: mediaFile.sourceProvider,
        sourceExternalId: mediaFile.sourceExternalId,
        sourceUrl: mediaFile.sourceUrl,
        sourceAuthor: mediaFile.sourceAuthor,
        sourceAuthorUrl: mediaFile.sourceAuthorUrl,
    });
};
