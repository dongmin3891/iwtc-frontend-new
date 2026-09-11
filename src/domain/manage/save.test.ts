import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ManagedContent, PersistedManagedContentView } from './persistedContent';
import { createNewWorldCupContents, saveWorldCupContentChanges, WorldCupContentSaveDependencies } from './save';

const persistedContent = (contentsId: number, contentsName: string): PersistedManagedContentView => ({
    id: contentsId,
    contentsId,
    contentsName,
    visibleType: 'PUBLIC',
    fileType: 'video',
});

const newContent: ManagedContent = {
    id: 3,
    contentsName: 'new',
    visibleType: 'PRIVATE',
    fileType: 'video',
    mediaPath: 'youtube-url',
    videoStartTime: '00030',
    videoPlayDuration: '3',
};

describe('saveWorldCupContentChanges', () => {
    it('combines delete, update, and create requests with the existing arguments', async () => {
        const calls: string[] = [];
        const dependencies: WorldCupContentSaveDependencies = {
            removeContent: async (worldCupId, contentsId, token) => {
                calls.push(`delete:${worldCupId}:${contentsId}:${token}`);
            },
            updateContent: async (worldCupId, contentsId, request, token) => {
                calls.push(`update:${worldCupId}:${contentsId}:${request.contentsName}:${token}`);
            },
            updateStaticContent: async () => {},
            createContents: async ({ worldCupId, params, token }) => {
                calls.push(`create:${worldCupId}:${params.length}:${token}`);
            },
            createStaticContent: async () => {},
        };

        await saveWorldCupContentChanges(
            {
                worldCupId: 10,
                accessToken: 'token',
                deleteList: [persistedContent(1, 'deleted')],
                modifyList: [persistedContent(2, 'modified')],
                newList: [newContent],
            },
            dependencies
        );

        assert.deepEqual(calls, ['delete:10:1:token', 'update:10:2:modified:token', 'create:10:1:token']);
    });

    it('does not create a batch when the new-content list is empty', async () => {
        let createCalls = 0;
        const dependencies: WorldCupContentSaveDependencies = {
            removeContent: async () => {},
            updateContent: async () => {},
            updateStaticContent: async () => {},
            createContents: async () => {
                createCalls += 1;
            },
            createStaticContent: async () => {},
        };

        await saveWorldCupContentChanges(
            {
                worldCupId: 10,
                accessToken: 'token',
                deleteList: [],
                modifyList: [],
                newList: [],
            },
            dependencies
        );

        assert.equal(createCalls, 0);
    });

    it('does not update a persisted content that is also queued for deletion', async () => {
        const calls: string[] = [];
        const deletedContent = persistedContent(1, 'deleted after edit');
        const dependencies: WorldCupContentSaveDependencies = {
            removeContent: async (worldCupId, contentsId) => {
                calls.push(`delete:${worldCupId}:${contentsId}`);
            },
            updateContent: async (worldCupId, contentsId) => {
                calls.push(`update:${worldCupId}:${contentsId}`);
            },
            updateStaticContent: async () => {},
            createContents: async () => {},
            createStaticContent: async () => {},
        };

        await saveWorldCupContentChanges(
            {
                worldCupId: 10,
                accessToken: 'token',
                deleteList: [deletedContent],
                modifyList: [deletedContent, persistedContent(2, 'modified')],
                newList: [],
            },
            dependencies
        );

        assert.deepEqual(calls, ['delete:10:1', 'update:10:2']);
    });

    it('propagates a failed request to the caller', async () => {
        const dependencies: WorldCupContentSaveDependencies = {
            removeContent: async () => {
                throw new Error('delete failed');
            },
            updateContent: async () => {},
            updateStaticContent: async () => {},
            createContents: async () => {},
            createStaticContent: async () => {},
        };

        await assert.rejects(
            saveWorldCupContentChanges(
                {
                    worldCupId: 10,
                    accessToken: 'token',
                    deleteList: [persistedContent(1, 'deleted')],
                    modifyList: [],
                    newList: [],
                },
                dependencies
            ),
            /delete failed/
        );
    });

    it('sends video candidates as one batch and each image as multipart input', async () => {
        const calls: string[] = [];
        const file = { name: 'candidate.png', type: 'image/png', size: 8 } as File;

        await createNewWorldCupContents(
            {
                worldCupId: 10,
                accessToken: 'token',
                contents: [
                    newContent,
                    {
                        id: 4,
                        contentsName: 'image',
                        visibleType: 'PUBLIC',
                        fileType: 'file',
                        uploadFile: file,
                    },
                ],
            },
            {
                createContents: async ({ params }) => {
                    calls.push(`videos:${params.length}`);
                },
                createStaticContent: async (input) => {
                    assert.equal(input.file, file);
                    calls.push(`image:${input.contentsName}:${input.visibleType}`);
                },
            }
        );

        assert.deepEqual(calls, ['videos:1', 'image:image:PUBLIC']);
    });

    it('routes a persisted image edit to the static multipart dependency', async () => {
        const calls: string[] = [];
        const replacement = { name: 'new.png', type: 'image/png', size: 8 } as File;
        const imageContent: PersistedManagedContentView = {
            id: 3,
            contentsId: 3,
            contentsName: 'image',
            visibleType: 'PRIVATE',
            fileType: 'file',
            uploadFile: replacement,
        };
        const dependencies: WorldCupContentSaveDependencies = {
            removeContent: async () => {},
            updateContent: async () => {
                calls.push('video-update');
            },
            updateStaticContent: async (input) => {
                assert.equal(input.file, replacement);
                calls.push(`image-update:${input.contentsId}:${input.visibleType}`);
            },
            createContents: async () => {},
            createStaticContent: async () => {},
        };

        await saveWorldCupContentChanges(
            {
                worldCupId: 10,
                accessToken: 'token',
                deleteList: [],
                modifyList: [imageContent],
                newList: [],
            },
            dependencies
        );

        assert.deepEqual(calls, ['image-update:3:PRIVATE']);
    });

    it('does not send an empty video batch for image-only candidates', async () => {
        let videoBatchCalls = 0;

        await createNewWorldCupContents(
            {
                worldCupId: 10,
                accessToken: 'token',
                contents: [
                    {
                        id: 4,
                        contentsName: 'image',
                        visibleType: 'PRIVATE',
                        fileType: 'file',
                        uploadFile: {
                            name: 'candidate.gif',
                            type: 'image/gif',
                            size: 6,
                        } as File,
                    },
                ],
            },
            {
                createContents: async () => {
                    videoBatchCalls += 1;
                },
                createStaticContent: async () => {},
            }
        );

        assert.equal(videoBatchCalls, 0);
    });
});
