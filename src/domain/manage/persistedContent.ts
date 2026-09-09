import { isMP4 } from '../../utils/media';

export interface PersistedManagedContent {
    contentsId: number;
    contentsName: string;
    videoStartTime?: string;
    videoPlayDuration?: number;
    visibleType: string;
    fileType: string;
    mediaPath?: string;
    mediaFileId: number | null;
    mp4Type?: string | boolean;
    imgType?: string | boolean;
    detailFileType?: string;
    originalName?: string;
}

export interface ManagedMediaFile {
    videoStartTime?: string;
    videoPlayDuration?: number;
    visibleType?: string;
    fileType?: string;
    mediaData: string;
    mediaFileId?: number;
    detailType?: string;
    originalName?: string;
}

export interface ManagedContent {
    id: number;
    contentsId?: number;
    contentsName: string;
    videoStartTime?: string;
    videoPlayDuration?: number | string;
    visibleType: string;
    fileType: string;
    mediaPath?: string;
    mediaData?: string;
    mediaFileId?: number;
    mp4Type?: string | boolean;
    imgType?: string | boolean;
    detailFileType?: string;
    originalName?: string;
    absoluteName?: string;
}

export interface PersistedManagedContentView extends ManagedContent {
    contentsId: number;
}

export interface ManagedContentDraft {
    contentsName: string;
    visibleType: string;
    fileType: string;
    mediaPath: string;
    originalName: string;
    absoluteName: string;
    videoStartTime: string;
    videoPlayDuration: string;
    mp4Type: string;
    imgType: string;
    detailFileType: string;
}

export const normalizePersistedManagedContent = (
    content: PersistedManagedContent,
    mediaFile: ManagedMediaFile | undefined,
    index: number
): PersistedManagedContentView => ({
    id: index,
    contentsId: content.contentsId,
    contentsName: content.contentsName,
    videoStartTime: mediaFile?.videoStartTime || content.videoStartTime,
    videoPlayDuration: mediaFile?.videoPlayDuration || content.videoPlayDuration,
    visibleType: mediaFile?.visibleType || content.visibleType,
    fileType: mediaFile?.fileType === 'STATIC_MEDIA_FILE' ? 'file' : content.fileType,
    mediaData: mediaFile?.mediaData || content.mediaPath,
    mediaFileId: mediaFile?.mediaFileId ?? content.mediaFileId ?? undefined,
    mp4Type: mediaFile ? (isMP4(mediaFile.mediaData) ? mediaFile.mediaData : undefined) : content.mp4Type,
    imgType: mediaFile ? (!isMP4(mediaFile.mediaData) ? mediaFile.mediaData : undefined) : content.imgType,
    detailFileType: mediaFile ? mediaFile.detailType : content.detailFileType,
    originalName: mediaFile ? mediaFile.originalName : content.originalName,
});
