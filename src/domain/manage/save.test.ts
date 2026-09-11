import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ManagedContent, PersistedManagedContentView } from './persistedContent';
import { saveWorldCupContentChanges, WorldCupContentSaveDependencies } from './save';

const persistedContent = (contentsId: number, contentsName: string): PersistedManagedContentView => ({
    id: contentsId,
    contentsId,
    contentsName,
    visibleType: 'PUBLIC',
    fileType: 'file',
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
            createContents: async ({ worldCupId, params, token }) => {
                calls.push(`create:${worldCupId}:${params.length}:${token}`);
            },
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
            createContents: async () => {
                createCalls += 1;
            },
        };

        await saveWorldCupContentChanges(
            { worldCupId: 10, accessToken: 'token', deleteList: [], modifyList: [], newList: [] },
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
            createContents: async () => {},
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
            createContents: async () => {},
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
});
