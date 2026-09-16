'use client';

import React, { useState } from 'react';
import WorldCupManageForm from '@/components/manage/WorldCupManageForm';
import WorldCupContentsManageListWrapper from '@/components/manage/WorldCupContentsManagerListWrapper';
import NotCreateWorldCupLogo from '@/components/manage/NotCreateWorldCupLogo';
import { ManagedContent } from '@/domain/manage/persistedContent';

const ManageForm = () => {
    const [worldCupContentsList, setWorldCupContentsList] = useState<ManagedContent[]>([]);
    const [worldCupId, setWorldCupId] = useState(0);
    const [isCreateWorldCup, setIsCreateWorldCup] = useState(false);

    return (
        <main className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950 px-5 py-10 text-white sm:px-8 lg:px-10 lg:py-14">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_8%_8%,rgba(124,110,255,0.32),transparent_27%),radial-gradient(circle_at_92%_70%,rgba(14,165,233,0.12),transparent_30%)]" />
            <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:48px_48px]" />

            <div className="mx-auto max-w-7xl">
                <header className="max-w-3xl">
                    <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-black tracking-[0.16em] text-violet-200">
                        WORLD CUP STUDIO
                    </span>
                    <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-5xl">새 월드컵 만들기</h1>
                    <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                        기본 정보를 먼저 저장한 다음 이미지나 영상 후보를 추가하세요. 후보 편집 내용은 마지막에 한 번에 반영됩니다.
                    </p>
                </header>

                <ol className="mt-8 grid max-w-2xl grid-cols-2 gap-3" aria-label="월드컵 생성 단계">
                    <li className="rounded-2xl border border-violet-300/30 bg-violet-400/10 px-4 py-3">
                        <span className="text-[10px] font-black tracking-[0.14em] text-violet-200">STEP 01</span>
                        <p className="mt-1 text-sm font-bold">기본 정보</p>
                    </li>
                    <li
                        className={`rounded-2xl border px-4 py-3 transition ${
                            isCreateWorldCup
                                ? 'border-sky-300/30 bg-sky-400/10 text-white'
                                : 'border-white/10 bg-white/[0.04] text-slate-600'
                        }`}
                    >
                        <span className="text-[10px] font-black tracking-[0.14em]">STEP 02</span>
                        <p className="mt-1 text-sm font-bold">후보 구성</p>
                    </li>
                </ol>

                <div className="mt-8 grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
                    <WorldCupManageForm
                        setIsCreateWorldCup={setIsCreateWorldCup}
                        setWorldCupId={setWorldCupId}
                        isCreateWorldCup={isCreateWorldCup}
                    />

                    <section className="min-w-0 rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20 sm:p-6">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <span className="text-[11px] font-black tracking-[0.16em] text-sky-200">STEP 02</span>
                                <h2 className="mt-2 text-xl font-black tracking-[-0.03em]">후보 구성</h2>
                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    기본 정보를 저장하면 후보 이미지나 영상을 추가할 수 있어요.
                                </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold text-slate-400">
                                {worldCupContentsList.length}개
                            </span>
                        </div>

                        {isCreateWorldCup ? (
                            <WorldCupContentsManageListWrapper
                                isCreateWorldCup={isCreateWorldCup}
                                worldCupContentsList={worldCupContentsList}
                                setWorldCupContentsList={setWorldCupContentsList}
                                worldCupId={worldCupId}
                            />
                        ) : (
                            <NotCreateWorldCupLogo />
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
};

export default ManageForm;
