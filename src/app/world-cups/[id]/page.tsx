'use client';

import RankListWrapper from '@/components/Rank/RankListWrapper';
import ReplyList from '@/components/reply/ReplyList';
import { formatCount } from '@/domain/home/worldCupStats';
import { useQueryGetReplyList } from '@/services/ReplyService';
import { useQueryGetWorldCupDetail } from '@/services/WorldCupService';
import Link from 'next/link';
import { useState } from 'react';

const WorldCupDetailPage = ({ params }: { params: { id: string } }) => {
    const worldCupId = Number(params.id);
    const [showRanking, setShowRanking] = useState(false);
    const { data: detailResponse, isLoading, isError, refetch } = useQueryGetWorldCupDetail(worldCupId);
    const {
        data: commentsResponse,
        isLoading: isCommentsLoading,
        isError: isCommentsError,
        refetch: refetchComments,
    } = useQueryGetReplyList(worldCupId, 0);

    if (!Number.isInteger(worldCupId) || worldCupId < 1) {
        return (
            <main className="grid min-h-[calc(100vh-72px)] place-items-center bg-slate-950 px-5 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-black">올바르지 않은 월드컵 주소입니다.</h1>
                    <Link href="/" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950">
                        월드컵 목록으로
                    </Link>
                </div>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="grid min-h-[calc(100vh-72px)] place-items-center bg-slate-950 px-5 text-white">
                <div className="text-center" role="status">
                    <span className="mx-auto block h-11 w-11 animate-spin rounded-full border-4 border-white/15 border-t-violet-400" />
                    <p className="mt-5 text-sm font-bold text-slate-300">월드컵 정보를 불러오고 있어요.</p>
                </div>
            </main>
        );
    }

    if (isError || !detailResponse?.data) {
        return (
            <main className="grid min-h-[calc(100vh-72px)] place-items-center bg-slate-950 px-5 text-white">
                <div className="w-full max-w-md rounded-[28px] border border-rose-300/20 bg-rose-400/10 p-7 text-center">
                    <h1 className="text-xl font-black">월드컵 정보를 불러오지 못했어요.</h1>
                    <p className="mt-2 text-sm leading-6 text-rose-100/70">삭제되었거나 비공개로 전환된 월드컵일 수 있습니다.</p>
                    <button
                        type="button"
                        className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
                        onClick={() => refetch()}
                    >
                        다시 불러오기
                    </button>
                </div>
            </main>
        );
    }

    const detail = detailResponse.data;
    const comments = commentsResponse?.data ?? [];
    const maximumRound = detail.rounds.at(-1);
    const roundLabel = maximumRound === 2 ? '결승' : maximumRound ? `${maximumRound}강` : '준비 중';

    return (
        <main className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950 px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-12">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_8%,rgba(124,110,255,0.34),transparent_28%),radial-gradient(circle_at_88%_52%,rgba(14,165,233,0.15),transparent_30%)]" />
            <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:48px_48px]" />

            <div className="mx-auto max-w-7xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                    <span aria-hidden="true">←</span>
                    월드컵 목록으로
                </Link>

                <section className="mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 sm:p-8 lg:p-10">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div>
                            <p className="text-xs font-black tracking-[0.18em] text-violet-200">WORLD CUP OVERVIEW</p>
                            <h1 className="mt-3 text-balance text-3xl font-black tracking-[-0.045em] sm:text-5xl">
                                {detail.title}
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                                {detail.description || '마음에 드는 후보를 골라 마지막 우승자를 결정해보세요.'}
                            </p>
                        </div>
                        <Link
                            href={`/play-game/${worldCupId}`}
                            className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-violet-500 px-7 py-3 text-sm font-black text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-400"
                        >
                            게임 시작하기 <span className="ml-2" aria-hidden="true">→</span>
                        </Link>
                    </div>

                    <dl className="mt-8 grid grid-cols-3 gap-2 border-t border-white/10 pt-6 sm:gap-4">
                        {[
                            ['최대 라운드', roundLabel],
                            ['완료 플레이', `${formatCount(detail.playCount)}회`],
                            ['댓글', `${formatCount(detail.commentCount)}개`],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-2xl bg-white/[0.06] px-3 py-4 text-center sm:px-5">
                                <dt className="text-[10px] font-black tracking-[0.12em] text-slate-500 sm:text-xs">{label}</dt>
                                <dd className="mt-2 text-base font-black text-white sm:text-xl">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                    <section>
                        {showRanking ? (
                            <RankListWrapper contentsId={worldCupId} />
                        ) : (
                            <div className="grid min-h-[360px] place-items-center rounded-[28px] border border-white/10 bg-white/[0.06] p-7 text-center">
                                <div className="max-w-md">
                                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-400/15 text-2xl" aria-hidden="true">
                                        🏆
                                    </span>
                                    <p className="mt-5 text-xs font-black tracking-[0.16em] text-violet-200">SPOILER ALERT</p>
                                    <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">누적 인기 순위를 볼까요?</h2>
                                    <p className="mt-3 text-sm leading-6 text-slate-400">
                                        다른 사람들의 선택 결과가 게임 전 판단에 영향을 줄 수 있어 기본적으로 숨겨두었어요.
                                    </p>
                                    <button
                                        type="button"
                                        className="mt-6 rounded-xl border border-violet-300/30 bg-violet-400/10 px-5 py-3 text-sm font-black text-violet-100 transition hover:bg-violet-400/20"
                                        onClick={() => setShowRanking(true)}
                                    >
                                        스포일러 확인하고 순위 보기
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    <aside className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] lg:sticky lg:top-24">
                        <div className="border-b border-white/10 p-5 sm:p-6">
                            <p className="text-xs font-black tracking-[0.16em] text-sky-200">COMMENTS</p>
                            <div className="mt-2 flex items-end justify-between gap-4">
                                <h2 className="text-2xl font-black tracking-[-0.03em]">최근 댓글</h2>
                                <span className="text-xs font-bold text-slate-400">총 {formatCount(detail.commentCount)}개</span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-400">댓글 작성은 게임을 마친 뒤 우승 후보와 함께 남길 수 있어요.</p>
                        </div>

                        <div className="max-h-[520px] space-y-3 overflow-y-auto p-4 sm:p-5">
                            {isCommentsLoading && <p className="py-10 text-center text-sm text-slate-400">댓글을 불러오는 중이에요.</p>}
                            {isCommentsError && (
                                <div className="py-8 text-center">
                                    <p className="text-sm font-semibold text-rose-200">댓글을 불러오지 못했어요.</p>
                                    <button
                                        type="button"
                                        className="mt-3 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold hover:bg-white/10"
                                        onClick={() => refetchComments()}
                                    >
                                        다시 불러오기
                                    </button>
                                </div>
                            )}
                            {!isCommentsLoading && !isCommentsError && comments.length === 0 && (
                                <div className="py-10 text-center">
                                    <p className="font-bold text-slate-300">아직 댓글이 없어요.</p>
                                    <p className="mt-1 text-sm text-slate-500">게임을 완료하고 첫 의견을 남겨보세요.</p>
                                </div>
                            )}
                            {comments.map((comment) => <ReplyList key={comment.commentId} replyData={comment} />)}
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default WorldCupDetailPage;
