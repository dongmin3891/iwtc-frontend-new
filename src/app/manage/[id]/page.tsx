'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import WorldCupManageForm from '@/components/manage/WorldCupManageForm';
import WorldCupContentsManageListWrapper from '@/components/manage/WorldCupContentsManagerListWrapper';
import { useQueryGetMyWorldCup, useQueryGetMyWorldCupContentsList } from '@/services/ManageWorldCupService';
import { getMediaFile } from '@/services/EtcService';
import {
    ManagedContent,
    normalizePersistedManagedContent,
    PersistedManagedContentView,
} from '@/domain/manage/persistedContent';

const ManagePageLoading = () => (
    <div
        className="mt-8 grid animate-pulse items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]"
        aria-label="월드컵 편집 정보 불러오는 중"
    >
        <div className="h-[520px] rounded-[28px] border border-white/10 bg-white/[0.05]" />
        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.05] p-5 sm:p-6">
            <div className="h-5 w-24 rounded-full bg-white/10" />
            <div className="h-8 w-48 rounded-xl bg-white/10" />
            <div className="h-36 rounded-3xl bg-white/[0.06]" />
            <div className="h-24 rounded-3xl bg-white/[0.06]" />
        </div>
    </div>
);

const ManagePageError = ({ isRetrying, onRetry }: { isRetrying: boolean; onRetry: () => void }) => (
    <section className="mt-8 grid min-h-[360px] place-items-center rounded-[28px] border border-rose-300/15 bg-rose-400/[0.05] px-6 py-12 text-center">
        <div className="max-w-md">
            <span
                className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-rose-300/20 bg-rose-400/10 text-xl text-rose-200"
                aria-hidden="true"
            >
                !
            </span>
            <p className="mt-5 text-[11px] font-black tracking-[0.16em] text-rose-300">LOAD FAILED</p>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">편집 정보를 불러오지 못했습니다</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
                잠시 후 다시 시도해주세요. 계속 실패한다면 로그인 상태와 네트워크 연결을 확인해주세요.
            </p>
            <button
                type="button"
                disabled={isRetrying}
                onClick={onRetry}
                className="mt-6 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
            >
                {isRetrying && (
                    <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-950"
                        aria-hidden="true"
                    />
                )}
                {isRetrying ? '다시 불러오는 중' : '다시 불러오기'}
            </button>
        </div>
    </section>
);

const ManageForm = ({ params }: { params: { id: string } }) => {
    const id = Number(params.id);
    const isValidId = Number.isInteger(id) && id > 0;
    const worldCupQuery = useQueryGetMyWorldCup(isValidId ? id : 0);
    const contentsQuery = useQueryGetMyWorldCupContentsList(isValidId ? id : 0);
    const [worldCupContentsList, setWorldCupContentsList] = useState<ManagedContent[]>([]);
    const [worldCupId, setWorldCupId] = useState(isValidId ? id : 0);
    const [isCreateWorldCup, setIsCreateWorldCup] = useState(false);
    const [modifyList, setModifyList] = useState<PersistedManagedContentView[]>([]);
    const [deleteList, setDeleteList] = useState<PersistedManagedContentView[]>([]);
    const [newList, setNewList] = useState<ManagedContent[]>([]);
    const [isChanges, setIsChange] = useState(false);
    const [isHydratingContents, setIsHydratingContents] = useState(false);
    const [hasHydratedContents, setHasHydratedContents] = useState(false);
    const [contentsHydrationError, setContentsHydrationError] = useState(false);
    const [hydrateAttempt, setHydrateAttempt] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);
    const persistedContents = contentsQuery.data?.data?.data;
    const worldCupData = worldCupQuery.data?.data?.data;

    useEffect(() => {
        if (worldCupQuery.isSuccess) {
            setIsCreateWorldCup(true);
        }
    }, [worldCupQuery.isSuccess]);

    useEffect(() => {
        if (!contentsQuery.isSuccess || !persistedContents || !isValidId) {
            return;
        }

        let isCancelled = false;

        const hydrateContents = async () => {
            setIsHydratingContents(true);
            setHasHydratedContents(false);
            setContentsHydrationError(false);

            try {
                const hydratedContents = await Promise.all(
                    persistedContents.map(async (content, index) => {
                        const mediaFile = content.mediaFileId ? await getMediaFile(content.mediaFileId) : undefined;
                        return normalizePersistedManagedContent(content, mediaFile?.data.data, index);
                    })
                );

                if (!isCancelled) {
                    setWorldCupContentsList(hydratedContents);
                    setHasHydratedContents(true);
                }
            } catch (error) {
                console.error('후보 미디어 조회 실패:', error);
                if (!isCancelled) {
                    setContentsHydrationError(true);
                }
            } finally {
                if (!isCancelled) {
                    setIsHydratingContents(false);
                }
            }
        };

        void hydrateContents();

        return () => {
            isCancelled = true;
        };
    }, [contentsQuery.isSuccess, hydrateAttempt, isValidId, persistedContents]);

    useEffect(() => {
        setIsChange(newList.length > 0 || deleteList.length > 0 || modifyList.length > 0);
    }, [newList, deleteList, modifyList]);

    const retryLoad = async () => {
        if (isRetrying || !isValidId) {
            return;
        }

        setIsRetrying(true);
        setContentsHydrationError(false);
        setHasHydratedContents(false);
        setWorldCupContentsList([]);

        try {
            await Promise.all([worldCupQuery.refetch(), contentsQuery.refetch()]);
            setHydrateAttempt((current) => current + 1);
        } finally {
            setIsRetrying(false);
        }
    };

    const hasLoadError =
        !isValidId || worldCupQuery.isError || contentsQuery.isError || contentsHydrationError;
    const isInitialLoading =
        isValidId &&
        !hasLoadError &&
        (worldCupQuery.isLoading ||
            contentsQuery.isLoading ||
            isHydratingContents ||
            (worldCupQuery.isSuccess && contentsQuery.isSuccess && !hasHydratedContents));
    const isReady =
        worldCupQuery.isSuccess &&
        contentsQuery.isSuccess &&
        hasHydratedContents &&
        !isHydratingContents &&
        !hasLoadError;

    return (
        <main className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950 px-5 py-10 text-white sm:px-8 lg:px-10 lg:py-14">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_8%_8%,rgba(124,110,255,0.32),transparent_27%),radial-gradient(circle_at_92%_70%,rgba(14,165,233,0.12),transparent_30%)]" />
            <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:48px_48px]" />

            <div className="mx-auto max-w-7xl">
                <header className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-black tracking-[0.16em] text-violet-200">
                            WORLD CUP STUDIO
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[11px] font-bold text-slate-400">
                            ID {isValidId ? id : '-'}
                        </span>
                    </div>
                    <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-5xl">월드컵 편집하기</h1>
                    <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                        {worldCupData?.title
                            ? `‘${worldCupData.title}’의 기본 정보와 후보 구성을 확인하고 변경사항을 저장하세요.`
                            : '기본 정보와 후보 구성을 불러오고 있습니다. 변경사항은 마지막에 한 번에 저장할 수 있어요.'}
                    </p>
                    <Link href="/" className="mt-5 inline-flex text-xs font-bold text-slate-400 transition hover:text-white">
                        ← 홈으로 돌아가기
                    </Link>
                </header>

                <ol className="mt-8 grid max-w-2xl grid-cols-2 gap-3" aria-label="월드컵 수정 단계">
                    <li className="rounded-2xl border border-violet-300/30 bg-violet-400/10 px-4 py-3">
                        <span className="text-[10px] font-black tracking-[0.14em] text-violet-200">STEP 01</span>
                        <p className="mt-1 text-sm font-bold">기본 정보 확인</p>
                    </li>
                    <li className="rounded-2xl border border-sky-300/30 bg-sky-400/10 px-4 py-3">
                        <span className="text-[10px] font-black tracking-[0.14em] text-sky-200">STEP 02</span>
                        <p className="mt-1 text-sm font-bold">후보 편집·저장</p>
                    </li>
                </ol>

                {isInitialLoading && <ManagePageLoading />}
                {!isInitialLoading && hasLoadError && <ManagePageError isRetrying={isRetrying} onRetry={retryLoad} />}

                {isReady && (
                    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
                        <WorldCupManageForm
                            setIsCreateWorldCup={setIsCreateWorldCup}
                            setWorldCupId={setWorldCupId}
                            myWorldCupData={worldCupData}
                            isCreateWorldCup={isCreateWorldCup}
                        />

                        <section className="min-w-0 rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20 sm:p-6">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <span className="text-[11px] font-black tracking-[0.16em] text-sky-200">STEP 02</span>
                                    <h2 className="mt-2 text-xl font-black tracking-[-0.03em]">후보 편집</h2>
                                    <p className="mt-2 text-xs leading-5 text-slate-400">
                                        후보를 추가·수정·삭제한 뒤 아래 저장 버튼으로 한 번에 반영하세요.
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold text-slate-400">
                                    {worldCupContentsList.length}개
                                </span>
                            </div>

                            <WorldCupContentsManageListWrapper
                                isCreateWorldCup={isCreateWorldCup}
                                worldCupContentsList={worldCupContentsList}
                                setWorldCupContentsList={setWorldCupContentsList}
                                worldCupId={worldCupId}
                                setModifyList={setModifyList}
                                setDeleteList={setDeleteList}
                                setNewList={setNewList}
                                newList={newList}
                                modifyList={modifyList}
                                deleteList={deleteList}
                                isChanges={isChanges}
                                isModifyPage
                            />
                        </section>
                    </div>
                )}
            </div>
        </main>
    );
};

export default ManageForm;
