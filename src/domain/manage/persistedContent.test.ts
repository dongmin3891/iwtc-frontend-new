import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyManagedContentEdit, normalizePersistedManagedContent } from './persistedContent';

const content = {
    contentsId: 12,
    contentsName: '후보 A',
    videoStartTime: '00000',
    videoPlayDuration: 1,
    visibleType: 'PRIVATE',
    fileType: 'url',
    mediaPath: 'client-media',
    mediaFileId: 3,
    detailFileType: 'YOU_TUBE_URL',
    originalName: 'client-name',
};

describe('normalizePersistedManagedContent', () => {
    it('combines persisted content with an image media response', () => {
        const result = normalizePersistedManagedContent(
            content,
            {
                videoStartTime: '00100',
                videoPlayDuration: 5,
                visibleType: 'PUBLIC',
                fileType: 'STATIC_MEDIA_FILE',
                mediaData: 'data:image/png;base64,example',
                mediaFileId: 7,
                detailType: 'IMAGE',
                originalName: 'server-name.png',
            },
            2
        );

        assert.equal(result.id, 2);
        assert.equal(result.fileType, 'file');
        assert.equal(result.mediaData, 'data:image/png;base64,example');
        assert.equal(result.imgType, 'data:image/png;base64,example');
        assert.equal(result.mp4Type, undefined);
        assert.equal(result.visibleType, 'PUBLIC');
    });

    it('classifies an MP4 media response without changing its payload', () => {
        const result = normalizePersistedManagedContent(
            content,
            {
                mediaData: 'data:video/mp4;base64,example',
            },
            0
        );

        assert.equal(result.mp4Type, 'data:video/mp4;base64,example');
        assert.equal(result.imgType, undefined);
    });

    it('falls back to the persisted content when media data is absent', () => {
        assert.deepEqual(normalizePersistedManagedContent(content, undefined, 1), {
            id: 1,
            contentsId: 12,
            contentsName: '후보 A',
            videoStartTime: '00000',
            videoPlayDuration: 1,
            visibleType: 'PRIVATE',
            fileType: 'url',
            mediaData: 'client-media',
            mediaFileId: 3,
            mp4Type: undefined,
            imgType: undefined,
            detailFileType: 'YOU_TUBE_URL',
            originalName: 'client-name',
        });
    });

    it('keeps a missing media file optional for a new empty world cup', () => {
        assert.equal(
            normalizePersistedManagedContent({ ...content, mediaFileId: null }, undefined, 0).mediaFileId,
            undefined
        );
    });
});

describe('applyManagedContentEdit', () => {
    const editableContent = {
        id: 0,
        contentsId: 12,
        contentsName: '후보 A',
        visibleType: 'PUBLIC',
        fileType: 'video',
        mediaData: 'https://www.youtube.com/watch?v=before-video',
        videoStartTime: '00030',
        videoPlayDuration: 3,
        detailFileType: 'YOU_TUBE_URL',
    };

    it('keeps a visibility-only edit in the persisted candidate update', () => {
        const result = applyManagedContentEdit(editableContent, {
            contentsName: editableContent.contentsName,
            visibleType: 'PRIVATE',
            mediaData: editableContent.mediaData,
            videoStartTime: editableContent.videoStartTime,
            videoPlayDuration: editableContent.videoPlayDuration,
            detailFileType: editableContent.detailFileType,
        });

        assert.equal(result?.visibleType, 'PRIVATE');
    });

    it('returns no edit when all editable fields are unchanged', () => {
        assert.equal(
            applyManagedContentEdit(editableContent, {
                contentsName: editableContent.contentsName,
                visibleType: editableContent.visibleType,
                mediaData: editableContent.mediaData,
                videoStartTime: editableContent.videoStartTime,
                videoPlayDuration: editableContent.videoPlayDuration,
                detailFileType: editableContent.detailFileType,
            }),
            undefined
        );
    });
});
