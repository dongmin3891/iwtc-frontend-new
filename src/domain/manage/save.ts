import {
    createUpdateWorldCupContentRequest,
    createWorldCupContentRequests,
    UpdateWorldCupContentRequest,
} from './content';
import { ManagedContent, PersistedManagedContentView } from './persistedContent';

interface SaveWorldCupContentChangesInput {
    worldCupId: number;
    accessToken: string;
    deleteList: PersistedManagedContentView[];
    modifyList: PersistedManagedContentView[];
    newList: ManagedContent[];
}

interface CreateNewWorldCupContentsInput {
    worldCupId: number;
    accessToken: string;
    contents: ManagedContent[];
}

export interface WorldCupContentSaveDependencies {
    removeContent: (worldCupId: number, contentsId: number, token: string) => Promise<unknown>;
    updateContent: (
        worldCupId: number,
        contentsId: number,
        request: UpdateWorldCupContentRequest,
        token: string
    ) => Promise<unknown>;
    createContents: (input: {
        worldCupId: number;
        params: ReturnType<typeof createWorldCupContentRequests>;
        token: string;
    }) => Promise<unknown>;
    createStaticContent: (input: {
        worldCupId: number;
        contentsName: string;
        visibleType: string;
        file: File;
        token: string;
    }) => Promise<unknown>;
}

export const createNewWorldCupContents = async (
    { worldCupId, accessToken, contents }: CreateNewWorldCupContentsInput,
    dependencies: Pick<WorldCupContentSaveDependencies, 'createContents' | 'createStaticContent'>
): Promise<void> => {
    const requests: Promise<unknown>[] = [];
    const videoContents = contents.filter((item) => item.fileType !== 'file');
    const staticContents = contents.filter((item) => item.fileType === 'file');

    if (videoContents.length > 0) {
        requests.push(
            dependencies.createContents({
                worldCupId,
                params: createWorldCupContentRequests(videoContents),
                token: accessToken,
            })
        );
    }

    requests.push(
        ...staticContents.map((item) => {
            if (!item.uploadFile) {
                return Promise.reject(new Error('이미지 파일이 없습니다.'));
            }
            return dependencies.createStaticContent({
                worldCupId,
                contentsName: item.contentsName,
                visibleType: item.visibleType,
                file: item.uploadFile,
                token: accessToken,
            });
        })
    );

    await Promise.all(requests);
};

export const saveWorldCupContentChanges = async (
    { worldCupId, accessToken, deleteList, modifyList, newList }: SaveWorldCupContentChangesInput,
    dependencies: WorldCupContentSaveDependencies
): Promise<void> => {
    const requests: Promise<unknown>[] = [];
    const deletedContentIds = new Set(deleteList.map((item) => item.contentsId));

    requests.push(
        ...deleteList.map((item) => dependencies.removeContent(worldCupId, item.contentsId, accessToken))
    );
    requests.push(
        ...modifyList
            .filter((item) => !deletedContentIds.has(item.contentsId))
            .map((item) =>
                dependencies.updateContent(
                    worldCupId,
                    item.contentsId,
                    createUpdateWorldCupContentRequest(item),
                    accessToken
                )
            )
    );

    if (newList.length > 0) {
        requests.push(
            createNewWorldCupContents(
                { worldCupId, accessToken, contents: newList },
                dependencies
            )
        );
    }

    await Promise.all(requests);
};
