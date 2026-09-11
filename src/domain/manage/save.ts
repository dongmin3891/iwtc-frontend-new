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
}

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
            dependencies.createContents({
                worldCupId,
                params: createWorldCupContentRequests(newList),
                token: accessToken,
            })
        );
    }

    await Promise.all(requests);
};
