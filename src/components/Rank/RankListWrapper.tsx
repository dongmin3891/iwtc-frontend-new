import React, { useEffect, useState } from 'react';
import RankList from './RankList';
import { useQueryGetWorldCupGameResultRankList } from '@/services/WorldCupService';
import { mappingMediaFile } from '@/utils/common';
import { MappedMediaContent } from '@/domain/game/mediaFile';
import { WorldCupRankContent } from '@/interfaces/models/world-cup/WcGameData';

interface IProps {
    contentsId: number;
}

type RankContentView = MappedMediaContent<WorldCupRankContent>;

const RankListWrapper = ({ contentsId }: IProps) => {
    const {
        data: allRankList,
        isSuccess: allRankIsSuccess,
        isLoading,
        isError,
        refetch,
    } = useQueryGetWorldCupGameResultRankList(contentsId);
    const [lastResult, setLastResult] = useState<RankContentView[]>([]);
    const rankData = allRankList?.data;

    useEffect(() => {
        if (!allRankIsSuccess || !rankData) {
            return;
        }

        let isActive = true;

        const mapMediaFiles = async () => {
            const mappingList = await mappingMediaFile(rankData);
            if (isActive) {
                setLastResult(mappingList);
            }
        };

        mapMediaFiles();

        return () => {
            isActive = false;
        };
    }, [allRankIsSuccess, rankData]);

    return (
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06]">
            <div className="border-b border-white/10 p-5 sm:p-6">
                <p className="text-xs font-black tracking-[0.16em] text-violet-200">ALL-TIME RANKING</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">누적 인기 순위</h2>
                <p className="mt-2 text-sm text-slate-400">지금까지 모든 플레이 결과를 합산한 순위입니다.</p>
            </div>
            <div className="p-4 sm:p-5">
                {isLoading && <p className="py-10 text-center text-sm text-slate-400">랭킹을 불러오는 중이에요.</p>}
                {isError && (
                    <div className="py-8 text-center">
                        <p className="text-sm font-semibold text-rose-200">랭킹을 불러오지 못했어요.</p>
                        <button
                            type="button"
                            className="mt-3 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold hover:bg-white/10"
                            onClick={() => refetch()}
                        >
                            다시 불러오기
                        </button>
                    </div>
                )}
                {allRankIsSuccess && lastResult.length === 0 && (
                    <p className="py-10 text-center text-sm text-slate-400">표시할 랭킹이 없습니다.</p>
                )}
                {allRankIsSuccess && lastResult.length > 0 && (
                    <ol className="space-y-2">
                        {lastResult.map((items, index) => (
                            <RankList
                                key={`${items.contentsId}-${index}`}
                                contentsName={items.contentsName}
                                rank={items.gameRank}
                                imgUrl={items.imgUrl}
                                fileType={items.fileType}
                                videoStartTime={items.videoStartTime}
                                videoPlayDuration={items.videoPlayDuration}
                                sourceProvider={items.sourceProvider}
                                sourceUrl={items.sourceUrl}
                                sourceAuthor={items.sourceAuthor}
                                sourceAuthorUrl={items.sourceAuthorUrl}
                                gameScore={items.gameScore}
                            />
                        ))}
                    </ol>
                )}
            </div>
        </section>
    );
};

export default RankListWrapper;
