'use client';
import React, { useEffect, useState } from 'react';
import { useQueryGetWorldCupGameRound, worldCupGamePlay } from '@/services/WorldCupService';
import RoundPopup from '@/components/popup/RoundPopup';
import { useMutation } from '@tanstack/react-query';
import { mappingMediaFile } from '@/utils/common';
import { useRouter } from 'next/navigation';
import { animated } from '@react-spring/web';
import Spiner from '@/components/common/Spiner';
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
    const { data: roundList } = useQueryGetWorldCupGameRound(worldCupId);
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
        return <RoundPopup roundList={roundList} onSelectRound={handleRoundSelect} />;
    }

    if (isLoding) {
        return <Spiner />;
    }

    if (gameList.length > 0) {
        const leftGame = gameList[0];
        const rightGame = gameList[1];
        return (
            <>
                <div className="grid h-full flex  place-items-center box-border" style={{ height: '1000px' }}>
                    <div style={{ height: '15px' }} />
                    <h1 className="text-white text-2xl font-black">🔥 {roundList?.data?.worldCupTitle} 🔥</h1>
                    <h1 className="text-white text-2xl font-black">
                        {selectRound === 2 ? '결승' : selectRound + '강'}
                    </h1>
                    <div className="w-1/2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 relative ">
                        <div
                            className={`bg-blue-600 h-2.5 rounded-full absolute left-0 transition-width transition-all duration-700 ease-in-out`}
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                        {Object.entries(roundLabels).map(([label, position]) => (
                            <div
                                key={label}
                                className={`absolute ${
                                    Math.round(position) === Math.round(progressPercentage)
                                        ? 'text-blue text-1xl text-orange-500 font-bold'
                                        : 'text-white'
                                } flex`}
                                style={{
                                    left: `${position === 100 ? 96 : position}%`,
                                    transform: `translateX(${position === 100 ? `50` : '-50'}%)`,
                                }}
                            >
                                {label}
                            </div>
                        ))}
                    </div>
                    <div
                        className="absolute left-0 transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${progressPercentage}%`, top: '50%' }}
                    >
                        {`4강`}
                    </div>
                    <div className="relative flex p-4 text-black shadow " style={{ width: '1600px', height: '800px' }}>
                        <animated.div
                            className={'flex items-start mx-auto left-0 right-0 w-full'}
                            style={{
                                ...leftStyle,
                            }}
                            onClick={() => handleSelection(0)}
                        >
                            <GameCandidateMedia content={leftGame} />
                            <div className="absolute bottom-10 left-10">
                                <div className="bg-white text-6xl font-bold text-black px-3 py-3 rounded-md">
                                    {leftGame.name}
                                </div>
                            </div>
                        </animated.div>
                        <div className="flex items-center justify-center">
                            <div className="absolute">
                                <div className="flex items-center justify-center h-screen">
                                    <div className="relative">
                                        <div className="px-6 py-6 bg-red-500 text-white font-extrabold text-4xl rounded-lg shadow-lg animate-bounce">
                                            VS
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <animated.div
                            className={'flex items-end mx-auto left-0 right-0 w-full'}
                            style={{
                                ...rightStyle,
                            }}
                            onClick={() => handleSelection(1)}
                        >
                            <GameCandidateMedia content={rightGame} />
                            <div className="absolute bottom-10 right-10">
                                <div className="bg-white text-6xl font-bold text-black px-3 py-3 rounded-md">
                                    {rightGame.name}
                                </div>
                            </div>
                        </animated.div>
                    </div>
                </div>
            </>
        );
    }
};

export default Page;
