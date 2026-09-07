'use client';
import RankListWrapper from '@/components/Rank/RankListWrapper';
import ReplyRegisterForm from '@/components/reply/ReplyRegisterForm';
import ReplyList from '@/components/reply/ReplyList';
import { worldCupGameClear } from '@/services/WorldCupService';
import { useQueryGetReplyList } from '@/services/ReplyService';
import { isMP4, mappingMediaFile } from '@/utils/common';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import CustomYoutubePlayer from '@/components/youtubePlayer/CustomYoutubePlayer';
import { MappedMediaContent } from '@/domain/game/mediaFile';
import { WorldCupClearContent } from '@/interfaces/models/world-cup/WcGameData';

type ClearContentView = MappedMediaContent<WorldCupClearContent>;

const Page = ({ params }: { params: { id: string[] } }) => {
    const [rankList, setRankList] = useState<ClearContentView[]>();
    const { id } = params;
    const worldCupId = Number(id[0]);
    const clearPathParams = id.join('/');
    const { data: reply } = useQueryGetReplyList(worldCupId, 0);

    const { mutate, isSuccess } = useMutation(worldCupGameClear, {
        onSuccess: async (data) => {
            const mappingLsit = await mappingMediaFile(data.data);
            setRankList(mappingLsit);
        },
    });

    useEffect(() => {
        mutate(clearPathParams.split('/'));
    }, [clearPathParams, mutate]);
    // 게임 종료 API 응답값에 컨텐츠 ID를 내가 보내는데 응답값에 ID에 대한 게임 이름 데이터 내려줘야함
    if (isSuccess && rankList) {
        return (
            <>
                <div className="flex h-screen bg-zinc-950 text-white">
                    <div className="w-8/12 h-auto p-4 overflow-auto" style={{ height: '100%' }}>
                        <h1 className="text-2xl font-bold mb-4 text-center">월드컵 우승</h1>
                        <div className="h-full flex flex-col ">
                            <div className="flex h-2/3 bg-zinc-900 border-zinc-400">
                                <ul className=" w-1/4 bg-gray-100 rounded-md shadow-md bg-zinc-900 border border-zinc-600 ">
                                    {rankList.map((items) => {
                                        if (items.rank !== 1) {
                                            return items.fileType === 'INTERNET_VIDEO_URL' ? (
                                                <li className="w-full h-1/3 text-center " key={items.contentsId}>
                                                    <span>{items.rank}등</span>
                                                    <CustomYoutubePlayer
                                                        videoUrl={items.imgUrl}
                                                        time={items.videoStartTime}
                                                        width={'100%'}
                                                        height={'75%'}
                                                        isAutoPlay={false}
                                                        playDuration={items.videoPlayDuration}
                                                    />
                                                </li>
                                            ) : isMP4(items.imgUrl) ? (
                                                <li className="w-full h-1/3 text-center " key={items.contentsId}>
                                                    <span>{items.rank}등</span>
                                                    <div className="flex justify-center items-center w-full h-full">
                                                        <video
                                                            src={items.imgUrl}
                                                            width={'100%'}
                                                            height={'75%'}
                                                            autoPlay
                                                            muted
                                                            loop
                                                        />
                                                    </div>
                                                </li>
                                            ) : (
                                                <li className="w-full h-1/3 text-center" key={items.contentsId}>
                                                    <span>{items.rank}등</span>
                                                    <div className="flex justify-center items-center w-full h-full">
                                                        <img
                                                            src={items.imgUrl}
                                                            alt={items.contentsName}
                                                            className="h-5/6 mb-2 p-4"
                                                        />
                                                    </div>
                                                </li>
                                            );
                                        }
                                    })}
                                </ul>
                                <ul className="w-full bg-gray-100 rounded-md shadow-md  bg-zinc-900 border border-zinc-600">
                                    {rankList.map((items) => {
                                        if (items.rank === 1) {
                                            return items.fileType === 'INTERNET_VIDEO_URL' ? (
                                                <li className="w-full h-full flex justify-center items-center">
                                                    <CustomYoutubePlayer
                                                        videoUrl={items.imgUrl}
                                                        time={items.videoStartTime}
                                                        width={'600rem'}
                                                        height={'400'}
                                                        playDuration={items.videoPlayDuration}
                                                    />
                                                </li>
                                            ) : isMP4(items.imgUrl) ? (
                                                <div className="w-full h-full flex justify-center items-centerl">
                                                    <video
                                                        src={items.imgUrl}
                                                        width={'600rem'}
                                                        height={'400'}
                                                        autoPlay
                                                        muted
                                                        loop
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <li className="w-full h-full flex justify-center items-center ">
                                                        <img
                                                            src={items.imgUrl}
                                                            alt={String(items.contentsId)}
                                                            className="h-5/6"
                                                        />
                                                    </li>
                                                </>
                                            );
                                        }
                                    })}
                                </ul>
                            </div>
                            <div className="flex h-full">
                                <RankListWrapper contentsId={worldCupId} />
                            </div>
                        </div>
                    </div>

                    <div className="w-4/12 p-4" style={{ height: '100%' }}>
                        <h1 className="text-2xl font-bold mb-4 text-center">댓글</h1>
                        <div className="h-full flex flex-col">
                            <section
                                className=" bg-zinc-900 border border-zinc-600 rounded-md shadow-md py-8 antialiased h-full"
                            >
                                <div className="max-w-2xl mx-auto px-4">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg lg:text-2xl font-bold text-white dark:text-white">
                                            댓글 ({reply?.data.length ?? 0})
                                        </h2>
                                    </div>
                                    {reply?.data.map((items, idx) => {
                                        return <ReplyList key={idx} replyData={items} />;
                                    })}
                                </div>
                            </section>
                            <div>
                                <ReplyRegisterForm worldcupId={worldCupId} contentsId={Number(id[3])} />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
};

export default Page;
