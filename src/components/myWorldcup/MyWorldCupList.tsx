'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQueryGetMyWorldCupList } from '@/services/ManageWorldCupService';
import { getAccessToken } from '@/utils/TokenManager';
import MyWorldCupCard from './MyWorldCupCard';

const MyWorldCupListSkeleton = () => (
    <div className="grid animate-pulse gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="내 월드컵 목록 불러오는 중">
        {[0, 1, 2].map((item) => (
            <div key={item} className="h-64 rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
                <div className="h-6 w-20 rounded-full bg-white/10" />
                <div className="mt-7 h-7 w-3/4 rounded-xl bg-white/10" />
                <div className="mt-4 h-4 w-full rounded-lg bg-white/[0.07]" />
                <div className="mt-2 h-4 w-2/3 rounded-lg bg-white/[0.07]" />
                <div className="mt-8 h-12 rounded-2xl bg-white/[0.07]" />
            </div>
        ))}
    </div>
);

const MyWorldCupList = () => {
    const [accessToken, setAccessToken] = useState('');
    const [hasMounted, setHasMounted] = useState(false);
    const { data: myWorldCupList, isSuccess, isLoading, isError, isFetching, refetch } =
        useQueryGetMyWorldCupList(accessToken);
    const worldCups = myWorldCupList?.data.data ?? [];

    useEffect(() => {
        setAccessToken(getAccessToken() ?? '');
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <MyWorldCupListSkeleton />;
    }

    if (!accessToken) {
        return (
            <section className="grid min-h-[340px] place-items-center rounded-[28px] border border-white/10 bg-white/[0.05] px-6 py-12 text-center">
                <div className="max-w-sm">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-400/10 text-2xl" aria-hidden="true">
                        ↗
                    </span>
                    <h2 className="mt-5 text-xl font-black tracking-[-0.03em]">로그인이 필요합니다</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">내가 만든 월드컵을 확인하려면 먼저 로그인해주세요.</p>
                    <Link
                        href="/sign-in"
                        className="mt-6 inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
                    >
                        로그인하러 가기
                    </Link>
                </div>
            </section>
        );
    }

    if (isLoading) {
        return <MyWorldCupListSkeleton />;
    }

    if (isError) {
        return (
            <section className="grid min-h-[340px] place-items-center rounded-[28px] border border-rose-300/15 bg-rose-400/[0.05] px-6 py-12 text-center">
                <div className="max-w-md">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-rose-300/20 bg-rose-400/10 text-xl text-rose-200" aria-hidden="true">
                        !
                    </span>
                    <p className="mt-5 text-[11px] font-black tracking-[0.16em] text-rose-300">LOAD FAILED</p>
                    <h2 className="mt-2 text-xl font-black tracking-[-0.03em]">월드컵 목록을 불러오지 못했습니다</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-400">잠시 후 다시 시도해주세요. 목록은 변경되지 않았습니다.</p>
                    <button
                        type="button"
                        disabled={isFetching}
                        onClick={() => void refetch()}
                        className="mt-6 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
                    >
                        {isFetching && <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-950" aria-hidden="true" />}
                        {isFetching ? '다시 불러오는 중' : '다시 불러오기'}
                    </button>
                </div>
            </section>
        );
    }

    if (isSuccess && worldCups.length === 0) {
        return (
            <section className="grid min-h-[340px] place-items-center rounded-[28px] border border-dashed border-white/15 bg-white/[0.04] px-6 py-12 text-center">
                <div className="max-w-sm">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.06] text-2xl" aria-hidden="true">
                        ·
                    </span>
                    <h2 className="mt-5 text-xl font-black tracking-[-0.03em]">등록된 월드컵이 없습니다</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">새 콘텐츠는 운영을 통해 순차적으로 추가됩니다.</p>
                </div>
            </section>
        );
    }

    return (
        <section aria-labelledby="my-world-cup-list-title">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="text-[11px] font-black tracking-[0.16em] text-sky-200">CREATED BY ME</span>
                    <h2 id="my-world-cup-list-title" className="mt-2 text-2xl font-black tracking-[-0.04em]">
                        만든 월드컵
                    </h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-bold text-slate-400">
                    총 {worldCups.length}개
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {worldCups.map((myWorldCup) => (
                    <MyWorldCupCard key={myWorldCup.worldCupId} myWorldCup={myWorldCup} refetch={refetch} />
                ))}
            </div>
        </section>
    );
};

export default MyWorldCupList;
