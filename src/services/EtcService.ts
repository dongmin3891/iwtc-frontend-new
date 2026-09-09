import { ajaxGet } from './BaseService';
import { ManagedMediaFile } from '@/domain/manage/persistedContent';

interface ManagedMediaFileResponse {
    data: ManagedMediaFile;
}

export const getMediaFileAPI = async (mediaFileId: number, type?: string) => {
    const params = {
        size: type || 'original',
    };
    if (!mediaFileId) return;
    try {
        const response = await ajaxGet<ManagedMediaFileResponse>(`/media-files/${mediaFileId}`, { params });
        return response.data;
    } catch {
        return undefined;
    }
};

export const getMediaFile = async (mediaFileId: number) => {
    const response = await ajaxGet<ManagedMediaFileResponse>(`/media-files/${mediaFileId}`, {
        params: { size: 'original' },
    });
    return response;
};
