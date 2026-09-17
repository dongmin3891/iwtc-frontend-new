'use client';
import Image from 'next/image';
import Link from 'next/link';
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
import MediaAttribution from '@/components/game/MediaAttribution';

type ClearContentView = MappedMediaContent<WorldCupClearContent>;

interface ResultMediaProps {
    content: ClearContentView;
    priority?: boolean;
}

const ResultMedia = ({ content, priority = false }: ResultMediaProps) => {
    if (content.fileType === 'INTERNET_VIDEO_URL') {
        return (
            <div className="h-full w-full bg-black [&>div]:h-full [&_iframe]:h-full [&_iframe]:w-full">
                <CustomYoutubePlayer
                    videoUrl={content.imgUrl}
                    time={content.videoStartTime}
                    width="100%"
                    height="100%"
                    playDuration={content.videoPlayDuration}
                />
            </div>
        );
    }

    if (isMP4(content.imgUrl)) {
        return <video className="h-full w-full object-cover" src={content.imgUrl} autoPlay muted loop playsInline />;
    }

    return (
        <div className="relative h-full w-full">
            <Image
                className="object-cover"
                src={content.imgUrl}
                fill
                priority={priority}
                sizes="(max-width: 1023px) 100vw, 65vw"
                alt={content.contentsName}
            />
            <MediaAttribution
                sourceProvider={content.sourceProvider}
                sourceUrl={content.sourceUrl}
                sourceAuthor={content.sourceAuthor}
                sourceAuthorUrl={content.sourceAuthorUrl}
            />
        </div>
    );
};

const Page = ({ params }: { params: { id: string[] } }) => {
    const [rankList, setRankList] = useState<ClearContentView[]>();
    const { id } = params;
    const worldCupId = Number(id[0]);
    const winnerContentsId = Number(id[3]);
    const clearPathParams = id.join('/');
    const clearRequestParams = clearPathParams.split('/');
    const {
        data: reply,
        isLoading: isReplyLoading,
        isError: isReplyError,
        refetch: refetchReply,
    } = useQueryGetReplyList(worldCupId, 0);

    const { mutate, isLoading, isError } = useMutation(worldCupGameClear, {
        onSuccess: async (data) => {
            const mappedList = await mappingMediaFile(data.data);
            setRankList(mappedList);
        },
    });

    useEffect(() => {
        mutate(clearRequestParams);
        // URL이 바뀔 때만 게임 결과를 저장한다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clearPathParams, mutate]);

    if (isLoading || (!isError && !rankList)) {
        return (
            <main className="grid min-h-[calc(100vh-72px)] place-items-center bg-slate-950 px-5 text-white">
                <div className="text-center" role="status">
                    <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-violet-400" />
                    <p className="mt-5 text-base font-bold text-slate-200">최종 결과를 기록하고 있어요.</p>
                    <p className="mt-2 text-sm text-slate-500">잠시만 기다려주세요.</p>
                </div>
            </main>
        );
    }

    if (isError) {
        return (
            <main className="grid min-h-[calc(100vh-72px)] place-items-center bg-slate-950 px-5 text-white">
                <div className="w-full max-w-md rounded-[28px] border border-rose-300/20 bg-rose-400/10 p-7 text-center">
                    <p className="text-xl font-black">결과를 저장하지 못했어요.</p>
                    <p className="mt-2 text-sm leading-6 text-rose-100/70">네트워크 상태를 확인하고 다시 시도해주세요.</p>
                    <button
                        type="button"
                        className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-rose-50"
                        onClick={() => mutate(clearRequestParams)}
                    >
                        다시 시도하기
                    </button>
                </div>
            </main>
        );
    }

    const winner = rankList?.find((content) => content.rank === 1);
    const placements = rankList?.filter((content) => content.rank !== 1).sort((a, b) => a.rank - b.rank) ?? [];

    if (!winner) {
        return (
            <main className="grid min-h-[calc(100vh-72px)] place-items-center bg-slate-950 px-5 text-white">
                <div className="text-center">
                    <p className="text-xl font-black">표시할 우승 결과가 없습니다.</p>
                    <Link href="/" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950">
                        홈으로 돌아가기
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950 px-5 py-10 text-white sm:px-8 lg:px-10 lg:py-14">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_5%,rgba(124,110,255,0.34),transparent_26%),radial-gradient(circle_at_88%_28%,rgba(14,165,233,0.13),transparent_28%)]" />
            <div className="absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:48px_48px]" />

            <div className="mx-auto max-w-7xl">
                <header className="text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-black tracking-[0.16em] text-amber-200">
                        <span aria-hidden="true">🏆</span> TOURNAMENT WINNER
                    </span>
                    <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl">최종 선택이 끝났어요</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
                        당신의 선택을 끝까지 살아남은 우승 후보입니다.
                    </p>
                </header>

                <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                    <div className="min-w-0 space-y-8">
                        <section className="overflow-hidden rounded-[32px] border border-amber-200/20 bg-white/[0.07] shadow-2xl shadow-black/30">
                            <div className="relative aspect-[16/10] max-h-[560px] min-h-[300px] overflow-hidden bg-black sm:aspect-video">
                                <ResultMedia content={winner} priority />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
                                    <p className="text-xs font-black tracking-[0.18em] text-amber-200">1ST PLACE</p>
                                    <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                                        {winner.contentsName}
                                    </h2>
                                </div>
                                <span className="absolute right-5 top-5 grid h-14 w-14 place-items-center rounded-2xl border border-amber-200/30 bg-amber-300/15 text-2xl backdrop-blur sm:right-7 sm:top-7">
                                    👑
                                </span>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                                <p className="text-sm font-semibold text-slate-300">다른 선택이 궁금하다면 다시 도전해보세요.</p>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/play-game/${worldCupId}`}
                                        className="flex-1 whitespace-nowrap rounded-xl bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-950 transition hover:bg-violet-50 sm:flex-none"
                                    >
                                        다시 하기
                                    </Link>
                                    <Link
                                        href="/"
                                        className="flex-1 whitespace-nowrap rounded-xl border border-white/15 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-white/10 sm:flex-none"
                                    >
                                        다른 월드컵
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {placements.length > 0 && (
                            <section>
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-black tracking-[0.16em] text-violet-200">FINAL PICKS</p>
                                        <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">최종 순위</h2>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500">이번 게임 결과</span>
                                </div>
                                <ol className="mt-5 grid gap-4 sm:grid-cols-3">
                                    {placements.map((content) => (
                                        <li
                                            key={content.contentsId}
                                            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]"
                                        >
                                            <div className="relative aspect-[16/10] overflow-hidden bg-black">
                                                <ResultMedia content={content} />
                                                <span className="absolute left-3 top-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-black backdrop-blur">
                                                    {content.rank}위
                                                </span>
                                            </div>
                                            <p className="truncate px-4 py-3 text-sm font-bold">{content.contentsName}</p>
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}

                        <RankListWrapper contentsId={worldCupId} />
                    </div>

                    <aside className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] lg:sticky lg:top-24">
                        <div className="border-b border-white/10 p-5 sm:p-6">
                            <p className="text-xs font-black tracking-[0.16em] text-sky-200">COMMENTS</p>
                            <div className="mt-2 flex items-end justify-between gap-4">
                                <h2 className="text-2xl font-black tracking-[-0.03em]">한마디 남기기</h2>
                                <span className="text-xs font-bold text-slate-400">{reply?.data.length ?? 0}개</span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-400">우승 후보에 대한 의견을 나눠보세요.</p>
                        </div>

                        <div className="max-h-[420px] space-y-3 overflow-y-auto p-4 sm:p-5">
                            {isReplyLoading && <p className="py-10 text-center text-sm text-slate-400">댓글을 불러오는 중이에요.</p>}
                            {isReplyError && (
                                <div className="py-8 text-center">
                                    <p className="text-sm font-semibold text-rose-200">댓글을 불러오지 못했어요.</p>
                                    <button
                                        type="button"
                                        className="mt-3 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold hover:bg-white/10"
                                        onClick={() => refetchReply()}
                                    >
                                        다시 불러오기
                                    </button>
                                </div>
                            )}
                            {!isReplyLoading && !isReplyError && reply?.data.length === 0 && (
                                <div className="py-10 text-center">
                                    <p className="font-bold text-slate-300">아직 댓글이 없어요.</p>
                                    <p className="mt-1 text-sm text-slate-500">첫 번째 의견을 남겨보세요.</p>
                                </div>
                            )}
                            {reply?.data.map((item) => <ReplyList key={item.commentId} replyData={item} />)}
                        </div>

                        <div className="border-t border-white/10 p-4 sm:p-5">
                            <ReplyRegisterForm worldcupId={worldCupId} contentsId={winnerContentsId} />
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default Page;
