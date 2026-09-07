import { useQuery } from '@tanstack/react-query';
import { ajaxGet, ajaxPost } from './BaseService';
import { WCListApiEnvelope, WCListParent, loadWCListData } from '@/interfaces/models/world-cup/WcListData';
import { createWorldCupClearRequest } from '@/domain/game/clear';
import { WorldCupGameRequest } from '@/domain/game/play';
import { worldCupQueryKeys } from '@/lib/react-query/queryKeys';
import {
    WorldCupClearResponse,
    WorldCupGameResponse,
    WorldCupRankResponse,
    WorldCupRoundResponse,
} from '@/interfaces/models/world-cup/WcGameData';

export const worldCupAllList = async (
    page: number,
    size: number,
    sort: string,
    keyword?: string,
    dateRange = 'ALL'
): Promise<WCListParent> => {
    const param = {
        page,
        size,
        sort: `${sort},DESC`,
        keyword,
        dateRange,
    };
    const response = await ajaxGet<WCListApiEnvelope>('/world-cups', { params: param });
    return loadWCListData(response.data.data);
};

export const useQueryGetWorldCupGameRound = (worldcupId: number) => {
    return useQuery<WorldCupRoundResponse, Error>(
        worldCupQueryKeys.rounds(worldcupId),
        () => worldCupGameRound(worldcupId),
        {
            retry: 0,
            refetchOnWindowFocus: false,
            staleTime: 1000,
        }
    );
};

export const worldCupGameRound = async (worldcupId: number) => {
    const response = await ajaxGet<WorldCupRoundResponse>(`/world-cups/${worldcupId}/available-rounds`);
    return response.data;
};

export const worldCupGamePlay = async ({
    worldcupId,
    currentRound,
    sliceContents,
    excludeContentsIds,
}: WorldCupGameRequest): Promise<WorldCupGameResponse> => {
    const param = {
        currentRound,
        sliceContents,
        excludeContentsIds,
    };
    const response = await ajaxGet<WorldCupGameResponse>(`/world-cups/${worldcupId}/contents`, { params: param });
    return response.data;
};

export const worldCupGameClear = async (routeParams: string[]) => {
    const { worldCupId, resultRequest } = createWorldCupClearRequest(routeParams);
    const response = await ajaxPost<WorldCupClearResponse, typeof resultRequest>(
        `/world-cups/${worldCupId}/clear`,
        resultRequest
    );
    return response.data;
};

//게임의 모든 컨텐츠 조회 (랭크 정렬)
export const useQueryGetWorldCupGameResultRankList = (worldcupId: number) => {
    return useQuery<WorldCupRankResponse, Error>(
        worldCupQueryKeys.rank(worldcupId),
        () => worldCuplGameResultRankList(worldcupId),
        {
            retry: 0,
            refetchOnWindowFocus: false,
            staleTime: 1000,
        }
    );
};

export const worldCuplGameResultRankList = async (worldcupId: number) => {
    const response = await ajaxGet<WorldCupRankResponse>(`/world-cups/${worldcupId}/game-result-contents`);
    return response.data;
};
