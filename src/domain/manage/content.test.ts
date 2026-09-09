import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    createUpdateWorldCupContentRequest,
    createWorldCupContentRequests,
    normalizeClientManagedContent,
    validateManagedContentDraft,
} from './content';
import { ManagedContentDraft } from './persistedContent';

const createDraft = (overrides: Partial<ManagedContentDraft> = {}): ManagedContentDraft => ({
    contentsName: '후보 A',
    visibleType: 'PUBLIC',
    fileType: 'video',
    mediaPath: 'https://youtube.com/watch?v=example',
    originalName: '',
    absoluteName: '',
    videoStartTime: '00030',
    videoPlayDuration: '3',
    mp4Type: '',
    imgType: '',
    detailFileType: '',
    ...overrides,
});

describe('normalizeClientManagedContent', () => {
    it('maps newly added content to the card model', () => {
        assert.deepEqual(
            normalizeClientManagedContent(
                {
                    id: 2,
                    contentsName: '후보 A',
                    videoStartTime: '00130',
                    videoPlayDuration: 3,
                    visibleType: 'PUBLIC',
                    fileType: 'file',
                    mediaPath: 'data:image/png;base64,example',
                    mediaFileId: 10,
                    mp4Type: false,
                    imgType: true,
                    detailFileType: 'IMAGE',
                    originalName: 'candidate.png',
                },
                2
            ),
            {
                id: 2,
                contentsId: undefined,
                contentsName: '후보 A',
                videoStartTime: '00130',
                videoPlayDuration: 3,
                visibleType: 'PUBLIC',
                fileType: 'file',
                mediaData: 'data:image/png;base64,example',
                mediaFileId: 10,
                mp4Type: false,
                imgType: true,
                detailFileType: 'IMAGE',
                originalName: 'candidate.png',
            }
        );
    });

    it('preserves the existing zero-id normalization', () => {
        assert.equal(
            normalizeClientManagedContent(
                {
                    id: 0,
                    contentsId: 0,
                    contentsName: '후보 B',
                    visibleType: 'PUBLIC',
                    fileType: 'file',
                },
                0
            ).contentsId,
            undefined
        );
    });
});

describe('validateManagedContentDraft', () => {
    it('validates common fields before media-specific fields', () => {
        assert.equal(
            validateManagedContentDraft(createDraft({ contentsName: '', videoStartTime: 'invalid' })),
            '컨텐츠 이름이 없습니다.'
        );
        assert.equal(validateManagedContentDraft(createDraft({ visibleType: '' })), '공개 여부를 선택해주세요.');
        assert.equal(validateManagedContentDraft(createDraft({ fileType: '' })), '파일 타입이 존재하지 않음');
    });

    it('requires an HTTPS YouTube watch URL', () => {
        const message = '유튜브 영상 주소는 HTTPS YouTube watch URL이어야 합니다.';

        assert.equal(validateManagedContentDraft(createDraft({ mediaPath: 'http://youtube.com/watch?v=abc' })), message);
        assert.equal(validateManagedContentDraft(createDraft({ mediaPath: 'https://youtu.be/abc' })), message);
        assert.equal(validateManagedContentDraft(createDraft({ mediaPath: 'https://youtube.com/embed/abc' })), message);
        assert.equal(validateManagedContentDraft(createDraft({ mediaPath: 'https://youtube.com/watch' })), message);
        assert.equal(
            validateManagedContentDraft(createDraft({ mediaPath: 'https://example.com/watch?v=abc' })),
            message
        );
        assert.equal(
            validateManagedContentDraft(createDraft({ mediaPath: ' https://www.youtube.com/watch?v=abc_123-xyz ' })),
            null
        );
        assert.equal(validateManagedContentDraft(createDraft({ mediaPath: 'https://m.youtube.com/watch?v=abc' })), null);
    });

    it('preserves video time and integer duration validation', () => {
        assert.equal(
            validateManagedContentDraft(createDraft({ videoStartTime: '0030' })),
            "'영상 시작 시간'은 '00000'의 형식입니다. \n 예 : 10분 1초 -> 01001, 0분 30초 -> 00030"
        );
        assert.equal(
            validateManagedContentDraft(createDraft({ videoPlayDuration: '2' })),
            '반복 시간은 3~5초로 설정해주세요.'
        );
        assert.equal(
            validateManagedContentDraft(createDraft({ videoPlayDuration: '3.5' })),
            '반복 시간은 3~5초로 설정해주세요.'
        );
        assert.equal(validateManagedContentDraft(createDraft()), null);
    });

    it('blocks static file candidates until the backend supports them', () => {
        assert.equal(
            validateManagedContentDraft(createDraft({ fileType: 'file', mediaPath: '', originalName: '' })),
            '현재는 유튜브 영상 후보만 등록할 수 있습니다.'
        );
        assert.equal(
            validateManagedContentDraft(
                createDraft({ fileType: 'file', mediaPath: 'data:image/png;base64,example', originalName: 'a.png' })
            ),
            '현재는 유튜브 영상 후보만 등록할 수 있습니다.'
        );
    });
});

describe('world cup content requests', () => {
    it('maps file content to the existing create request contract', () => {
        assert.deepEqual(
            createWorldCupContentRequests([
                {
                    id: 1,
                    contentsName: '후보 A',
                    visibleType: 'PUBLIC',
                    fileType: 'file',
                    mediaPath: 'data:image/png;base64,example',
                    originalName: 'candidate.png',
                    detailFileType: 'PNG',
                },
            ]),
            [
                {
                    contentsName: '후보 A',
                    visibleType: 'PUBLIC',
                    createMediaFileRequest: {
                        fileType: 'STATIC_MEDIA_FILE',
                        mediaData: 'data:image/png;base64,example',
                        originalName: 'candidate.png',
                        videoStartTime: undefined,
                        videoPlayDuration: undefined,
                        detailFileType: 'PNG',
                    },
                },
            ]
        );
    });

    it('maps video content and preserves its fallback original name', () => {
        const [result] = createWorldCupContentRequests([
            {
                id: 1,
                contentsName: '후보 B',
                visibleType: 'PRIVATE',
                fileType: 'video',
                mediaData: 'youtube-url',
                absoluteName: 'generated-name',
                videoStartTime: '00030',
                videoPlayDuration: '3',
            },
        ]);

        assert.deepEqual(result.createMediaFileRequest, {
            fileType: 'INTERNET_VIDEO_URL',
            mediaData: 'youtube-url',
            originalName: 'generated-name',
            videoStartTime: '00030',
            videoPlayDuration: '3',
            detailFileType: 'YOU_TUBE_URL',
        });
    });

    it('maps optional update values to the existing fallbacks', () => {
        assert.deepEqual(
            createUpdateWorldCupContentRequest({
                id: 1,
                contentsName: '후보 C',
                visibleType: 'PUBLIC',
                fileType: 'file',
                videoStartTime: '',
                videoPlayDuration: 0,
            }),
            {
                contentsName: '후보 C',
                originalName: 'No_NAME',
                mediaData: undefined,
                videoStartTime: null,
                videoPlayDuration: null,
                visibleType: 'PUBLIC',
                detailFileType: undefined,
            }
        );
    });
});
