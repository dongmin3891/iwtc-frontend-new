'use client';
import React, { useEffect, useState } from 'react';
import { useQueryGetWorldCupGameRound, worldCupGamePlay } from '@/services/WorldCupService';
import RoundPopup from '@/components/popup/RoundPopup';
import { useMutation } from '@tanstack/react-query';
import { mappingMediaFile } from '@/utils/common';
import { useRouter } from 'next/navigation';
import { animated } from '@react-spring/web';
import {
    createGameClearPath,
    createWorldCupGameRequest,
    GameRankContents,
    resolveGameContinuation,
    resolveGameSelection,
    updateGameRankContents,
} from '@/domain/game/play';
import { MappedMediaContent } from '@/domain/game/mediaFile';
import { WorldCupGameContent } from '@/interfaces/models/world-cup/WcGameData';
import { useGameSelectionAnimation } from '@/hooks/useGameSelectionAnimation';
import GameCandidateMedia from '@/components/game/GameCandidateMedia';
import { useGameProgress } from '@/hooks/useGameProgress';

type GameContentView = MappedMediaContent<WorldCupGameContent>;

const Page = ({ params }: { params: { id: string } }) => {
    const router = useRouter();

    const worldCupId = Number(params.id);
    const {
        data: roundList,
        isLoading: isRoundListLoading,
        isError: isRoundListError,
        refetch: refetchRoundList,
    } = useQueryGetWorldCupGameRound(worldCupId);
    const [selectRound, setSelectRound] = useState<number>(0);
    const [isPlay, setIsPlay] = useState<boolean>(false);
    const [gameList, setGameList] = useState<GameContentView[]>([]);
    const [saveClickContents, setSaveClickContents] = useState<number[]>([]);
    const [rankContents, setRankContents] = useState<GameRankContents>({
        firstWinnerContentsId: 0,
        secondWinnerContentsId: 0,
        thirdWinnerContentsId: 0,
        fourthWinnerContentsId: 0,
    });
    const [isSwapping, setIsSwapping] = useState<boolean>(false);
    const [isLoding, setIsLoding] = useState<boolean>(true);
    const { leftStyle, rightStyle, animateSelection, resetSelectionAnimation } = useGameSelectionAnimation();
    const { initialRound, progressPercentage, roundLabels, initializeProgress, advanceProgress } =
        useGameProgress();

    const applyGameList = (list: GameContentView[], initialRound: number) => {
        setGameList(list);

        advanceProgress(initialRound);
    };

    const getGame = useMutation(worldCupGamePlay, {
        onSuccess: async (data, variables) => {
            setIsPlay(true);
            const list = await mappingMediaFile(data.data.contentsList);
            setIsLoding(false);
            applyGameList(list, variables.initialRound);
        },
    });

    const requestGameRound = (round: number, excludedContentsIds: number[], initialRound: number) => {
        getGame.mutate(createWorldCupGameRequest(worldCupId, round, excludedContentsIds, initialRound));
    };

    const handleRoundSelect = (round: number) => {
        setSelectRound(round);
        initializeProgress(round);
        requestGameRound(round, [], round);
    };

    useEffect(() => {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.add('bg-black');

        return () => {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.remove('bg-black');
        };
    }, []);

    const handleSelection = async (selectedIndex: 0 | 1) => {
        if (isSwapping) return;
        setIsSwapping(true);
        animateSelection(selectedIndex);
        const [firstContent, secondContent] = gameList;
        const { loserContentId, winnerContentId, nextExcludedContents } = resolveGameSelection(
            [firstContent, secondContent],
            selectedIndex,
            saveClickContents
        );
        const continuation = resolveGameContinuation(
            gameList,
            selectRound,
            nextExcludedContents,
            initialRound
        );
        // selectRound가 2이면 결승
        setSaveClickContents(nextExcludedContents);
        if (selectRound === 4) {
            setRankContents(updateGameRankContents(rankContents, selectRound, { winnerContentId, loserContentId }));
        }

        if (continuation.type === 'finish') {
            const updatedRankContents = updateGameRankContents(rankContents, selectRound, {
                winnerContentId,
                loserContentId,
            });
            router.push(createGameClearPath(worldCupId, crypto.randomUUID(), initialRound, updatedRankContents));
            return;
        }
        setTimeout(() => {
            resetSelectionAnimation();
            if (continuation.type === 'request-next-round') {
                setSelectRound(continuation.nextRound);
                requestGameRound(
                    continuation.nextRound,
                    continuation.excludedContentsIds,
                    continuation.initialRound
                );
            } else {
                applyGameList(continuation.remainingContents, initialRound);
            }
            setIsSwapping(false);
        }, 1000);
    };

    if (!isPlay) {
        return (
            <RoundPopup
                roundList={roundList}
                isLoading={isRoundListLoading}
                isError={isRoundListError}
                isStarting={getGame.isLoading}
                hasStartError={getGame.isError}
                selectedRound={selectRound}
                onSelectRound={handleRoundSelect}
                onRetry={() => refetchRoundList()}
            />
        );
    }

    if (isLoding) {
        return (
            <main className="grid min-h-[calc(100vh-72px)] place-items-center bg-slate-950 px-5 text-white">
                <div className="text-center" role="status">
                    <span className="mx-auto block h-11 w-11 animate-spin rounded-full border-4 border-white/15 border-t-violet-400" />
                    <p className="mt-5 text-sm font-bold text-slate-300">첫 번째 대결을 준비하고 있어요.</p>
                </div>
            </main>
        );
    }

    if (gameList.length > 0) {
        const leftGame = gameList[0];
        const rightGame = gameList[1];
        const currentRoundLabel = selectRound === 2 ? '결승' : `${selectRound}강`;
        const remainingMatches = Math.ceil(gameList.length / 2);
        const visibleProgress = Math.min(progressPercentage, 100);
        const isSelectionLocked = isSwapping || getGame.isLoading;
        const gameStatusLabel = getGame.isLoading
            ? '다음 대결 준비 중'
            : isSwapping
              ? '선택 반영 중'
              : '선택 대기 중';

        return (
            <main className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950 px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
                <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_10%_15%,rgba(124,110,255,0.3),transparent_26%),radial-gradient(circle_at_88%_72%,rgba(14,165,233,0.16),transparent_28%)]" />
                <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:48px_48px]" />

                <div className="mx-auto max-w-7xl">
                    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-black tracking-[0.14em] text-violet-200">
                                    {currentRoundLabel}
                                </span>
                                <span className="text-xs font-semibold text-slate-400">
                                    이번 라운드 남은 대결 {remainingMatches}
                                </span>
                            </div>
                            <h1 className="mt-3 text-2xl font-black tracking-[-0.035em] sm:text-3xl">
                                {roundList?.data?.worldCupTitle}
                            </h1>
                            <p className="mt-2 text-sm text-slate-400">더 마음이 가는 후보를 선택하세요.</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                            {gameStatusLabel}
                        </div>
                    </header>

                    <section className="mt-8" aria-label={`게임 진행률 ${Math.round(visibleProgress)}%`}>
                        <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-sky-400 transition-all duration-700 ease-out"
                                style={{ width: `${visibleProgress}%` }}
                            />
                        </div>
                        <div className="relative mt-3 h-5">
                            {Object.entries(roundLabels).map(([label, position]) => (
                                <span
                                    key={label}
                                    className={`absolute whitespace-nowrap text-[11px] font-bold transition-colors ${
                                        visibleProgress >= position ? 'text-violet-200' : 'text-slate-600'
                                    }`}
                                    style={{
                                        left: `${position}%`,
                                        transform:
                                            position === 0
                                                ? 'none'
                                                : position === 100
                                                  ? 'translateX(-100%)'
                                                  : 'translateX(-50%)',
                                    }}
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    </section>

                    <section className="relative mt-8 grid gap-8 md:grid-cols-2 md:gap-5" aria-label="후보 선택">
                        <animated.button
                            type="button"
                            className="group relative isolate aspect-[4/3] min-h-[260px] overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 text-left shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-violet-300/50 focus-visible:z-20 disabled:cursor-wait md:aspect-[16/10] md:min-h-0"
                            style={{ ...leftStyle }}
                            onClick={() => handleSelection(0)}
                            disabled={isSelectionLocked}
                            aria-label={`${leftGame.name} 선택`}
                        >
                            <GameCandidateMedia content={leftGame} attributionPosition="right" />
                            <span className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/5 to-transparent" />
                            <span className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
                                <span className="text-[11px] font-black tracking-[0.16em] text-violet-200">CANDIDATE A</span>
                                <span className="mt-2 block text-2xl font-black tracking-[-0.025em] sm:text-3xl">
                                    {leftGame.name}
                                </span>
                                <span className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-300 opacity-80 transition group-hover:opacity-100">
                                    이 후보 선택하기 <span aria-hidden="true">→</span>
                                </span>
                            </span>
                        </animated.button>

                        <span className="pointer-events-none absolute left-1/2 top-1/2 z-30 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-slate-950 bg-white text-sm font-black italic text-slate-950 shadow-2xl">
                            VS
                        </span>

                        <animated.button
                            type="button"
                            className="group relative isolate aspect-[4/3] min-h-[260px] overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 text-left shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-sky-300/50 focus-visible:z-20 disabled:cursor-wait md:aspect-[16/10] md:min-h-0"
                            style={{ ...rightStyle }}
                            onClick={() => handleSelection(1)}
                            disabled={isSelectionLocked}
                            aria-label={`${rightGame.name} 선택`}
                        >
                            <GameCandidateMedia content={rightGame} attributionPosition="left" />
                            <span className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/5 to-transparent" />
                            <span className="absolute inset-x-0 bottom-0 z-10 p-5 text-right sm:p-7">
                                <span className="text-[11px] font-black tracking-[0.16em] text-sky-200">CANDIDATE B</span>
                                <span className="mt-2 block text-2xl font-black tracking-[-0.025em] sm:text-3xl">
                                    {rightGame.name}
                                </span>
                                <span className="mt-2 flex items-center justify-end gap-2 text-xs font-semibold text-slate-300 opacity-80 transition group-hover:opacity-100">
                                    <span aria-hidden="true">←</span> 이 후보 선택하기
                                </span>
                            </span>
                        </animated.button>

                        {getGame.isLoading && (
                            <div className="absolute inset-0 z-40 grid place-items-center rounded-[28px] bg-slate-950/70 backdrop-blur-sm">
                                <div className="text-center" role="status">
                                    <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-violet-300" />
                                    <p className="mt-4 text-sm font-bold">다음 대결을 준비하고 있어요.</p>
                                </div>
                            </div>
                        )}
                    </section>

                    <p className="mt-6 text-center text-xs font-semibold text-slate-500">
                        선택한 후보는 다음 라운드로 진출합니다.
                    </p>
                </div>
            </main>
        );
    }
};

export default Page;
