import { ManagedContent, ManagedContentDraft } from './persistedContent';

export interface CreateWorldCupContentRequest {
    contentsName: string;
    visibleType: string;
    createMediaFileRequest: {
        fileType: string;
        mediaData?: string;
        originalName?: string;
        videoStartTime?: string;
        videoPlayDuration?: number | string;
        detailFileType?: string;
    };
}

export interface UpdateWorldCupContentRequest {
    contentsName: string;
    originalName: string;
    mediaData?: string;
    videoStartTime: string | null;
    videoPlayDuration: number | string | null;
    visibleType: string;
    detailFileType?: string;
}

export const createWorldCupContentRequests = (contents: ManagedContent[]): CreateWorldCupContentRequest[] =>
    contents.map((item) => ({
        contentsName: item.contentsName,
        visibleType: item.visibleType,
        createMediaFileRequest: {
            fileType: item.fileType === 'file' ? 'STATIC_MEDIA_FILE' : 'INTERNET_VIDEO_URL',
            mediaData: item.mediaPath || item.mediaData,
            originalName: item.originalName ? item.originalName : item.absoluteName,
            videoStartTime: item.videoStartTime,
            videoPlayDuration: item.videoPlayDuration,
            detailFileType:
                item.fileType === 'file' || item.fileType === 'STATIC_MEDIA_FILE'
                    ? item.detailFileType
                    : 'YOU_TUBE_URL',
        },
    }));

export const createUpdateWorldCupContentRequest = (
    content: ManagedContent
): UpdateWorldCupContentRequest => ({
    contentsName: content.contentsName,
    originalName: content.originalName || 'No_NAME',
    mediaData: content.mediaData,
    videoStartTime: content.videoStartTime ? String(content.videoStartTime) : null,
    videoPlayDuration: content.videoPlayDuration ? content.videoPlayDuration : null,
    visibleType: content.visibleType,
    detailFileType: content.detailFileType,
});

const isYoutubeWatchUrl = (value: string): boolean => {
    try {
        const url = new URL(value.trim());
        const videoId = url.searchParams.get('v');
        return (
            url.protocol === 'https:' &&
            ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname.toLowerCase()) &&
            url.pathname === '/watch' &&
            videoId !== null &&
            /^[A-Za-z0-9_-]{1,64}$/.test(videoId)
        );
    } catch {
        return false;
    }
};

export const validateManagedContentDraft = (contents: ManagedContentDraft): string | null => {
    if (contents.contentsName === '') {
        return '컨텐츠 이름이 없습니다.';
    }

    if (!(contents.visibleType === 'PUBLIC' || contents.visibleType === 'PRIVATE')) {
        return '공개 여부를 선택해주세요.';
    }

    if (!(contents.fileType === 'video' || contents.fileType === 'file')) {
        return '파일 타입이 존재하지 않음';
    }

    if (contents.fileType === 'file') {
        if (!contents.uploadFile) {
            return '이미지 파일을 선택해주세요.';
        }

        if (!['image/jpeg', 'image/png', 'image/gif'].includes(contents.uploadFile.type)) {
            return 'JPEG, PNG 또는 GIF 이미지 파일만 등록할 수 있습니다.';
        }

        if (contents.uploadFile.size > 10 * 1024 * 1024) {
            return '이미지 파일은 10MB 이하여야 합니다.';
        }
    }

    if (contents.fileType === 'video') {
        if (!isYoutubeWatchUrl(contents.mediaPath)) {
            return '유튜브 영상 주소는 HTTPS YouTube watch URL이어야 합니다.';
        }

        if (!/^\d{5}$/.test(contents.videoStartTime)) {
            return "'영상 시작 시간'은 '00000'의 형식입니다. \n 예 : 10분 1초 -> 01001, 0분 30초 -> 00030";
        }

        const playDuration = Number(contents.videoPlayDuration);
        if (!Number.isInteger(playDuration) || !(3 <= playDuration && playDuration <= 5)) {
            return '반복 시간은 3~5초로 설정해주세요.';
        }
    }

    return null;
};

export const normalizeClientManagedContent = (contents: ManagedContent, index: number): ManagedContent => ({
    id: index,
    contentsId: contents.contentsId || undefined,
    contentsName: contents.contentsName,
    videoStartTime: contents.videoStartTime,
    videoPlayDuration: contents.videoPlayDuration,
    visibleType: contents.visibleType,
    fileType: contents.fileType,
    mediaData: contents.mediaPath,
    mediaFileId: contents.mediaFileId,
    mp4Type: contents.mp4Type,
    imgType: contents.imgType,
    detailFileType: contents.detailFileType,
    originalName: contents.originalName,
});
