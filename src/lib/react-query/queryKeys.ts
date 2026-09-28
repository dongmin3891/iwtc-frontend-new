export const worldCupQueryKeys = {
    detail: (worldCupId: number) => ['wcDetail', worldCupId] as const,
    rounds: (worldCupId: number) => ['wcRounds', worldCupId] as const,
    rank: (worldCupId: number) => ['AllRankList', worldCupId] as const,
};

export const manageWorldCupQueryKeys = {
    lists: () => ['MyWorldCupList'] as const,
    detail: (worldCupId: number) => ['MyWorldCup', worldCupId] as const,
    contents: (worldCupId: number) => ['MyWorldCupContentsList', worldCupId] as const,
};

export const replyQueryKeys = {
    lists: () => ['worldCupReplyList'] as const,
    list: (worldCupId: number, offset: number) => [...replyQueryKeys.lists(), worldCupId, offset] as const,
};
