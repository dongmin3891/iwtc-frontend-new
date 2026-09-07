export const createWorldCupClearRequest = (routeParams: string[]) => {
    const [worldCupId, playId, roundValue, ...rankedContentsIds] = routeParams;
    const placements = rankedContentsIds
        .slice(0, 4)
        .map((contentsId, index) => ({
            contentsId: Number(contentsId),
            rank: index + 1,
        }))
        .filter((placement) => placement.contentsId !== 0);

    return {
        worldCupId,
        resultRequest: {
            playId,
            round: Number(roundValue),
            placements,
        },
    };
};
