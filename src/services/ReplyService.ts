import { useQuery } from '@tanstack/react-query';
import { ajaxGet, ajaxPost } from './BaseService';
import { replyQueryKeys } from '@/lib/react-query/queryKeys';

export interface ReplyData {
    body: string;
    commentId: number;
    commentWriterId: number | null;
    createdAt: string;
    writerNickname: string;
}

interface ReplyListResponse {
    data: ReplyData[];
}

interface ReplyRegisterRequest {
    worldcupId: number;
    contentsId: number;
    body: string;
    nickname: string;
}

// 댓글 조회
export const useQueryGetReplyList = (worldcupId: number, offset: number) => {
    return useQuery<ReplyListResponse, Error>(
        replyQueryKeys.list(worldcupId, offset),
        () => worldCupGameReplyList(worldcupId, offset),
        {
            retry: 0,
            refetchOnWindowFocus: false,
            staleTime: 1000,
        }
    );
};

export const worldCupGameReplyList = async (worldcupId: number, offset: number) => {
    const params = {
        offset,
    };
    const response = await ajaxGet<ReplyListResponse>(`/world-cups/${worldcupId}/comments`, { params: params });
    return response.data;
};

export const worldCupGameReplyRegister = async ({
    worldcupId,
    contentsId,
    body,
    nickname,
}: ReplyRegisterRequest) => {
    const params = {
        body,
        nickname,
    };
    const response = await ajaxPost<unknown, typeof params>(
        `/world-cups/${worldcupId}/contents/${contentsId}/comments`,
        params
    );
    return response.data;
};
