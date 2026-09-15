import Link from 'next/link';
import { WorldCupRoundResponse } from '@/interfaces/models/world-cup/WcGameData';

interface IProps {
    roundList?: WorldCupRoundResponse;
    isLoading: boolean;
    isError: boolean;
    isStarting: boolean;
    hasStartError: boolean;
    selectedRound: number;
    onSelectRound: (round: number) => void;
    onRetry: () => void;
}

const RoundPopup = ({
    roundList,
    isLoading,
    isError,
    isStarting,
    hasStartError,
    selectedRound,
    onSelectRound,
    onRetry,
}: IProps) => {
    const playableRounds = roundList?.data.rounds.filter((round) => round > 2) ?? [];
    const worldCupTitle = roundList?.data.worldCupTitle;

    return (
        <main className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950 text-white">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_12%,rgba(124,110,255,0.38),transparent_30%),radial-gradient(circle_at_86%_78%,rgba(14,165,233,0.18),transparent_32%)]" />
            <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:48px_48px]" />

            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                    <span aria-hidden="true">←</span>
                    월드컵 목록으로
                </Link>

                <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] lg:items-center lg:gap-16">
                    <section>
                        <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-black tracking-[0.16em] text-violet-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                            READY TO PLAY
                        </span>
                        <p className="mt-6 text-sm font-bold text-violet-200">오늘의 선택을 시작해볼까요?</p>
                        <h1 className="mt-3 max-w-3xl text-balance text-3xl font-black leading-[1.15] tracking-[-0.045em] sm:text-5xl sm:leading-[1.12] lg:text-6xl">
                            {worldCupTitle || '월드컵을 준비하고 있어요'}
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                            참가할 라운드를 고르면 바로 첫 번째 대결이 시작됩니다. 오래 고민하지 말고 더 마음이
                            가는 후보를 선택하세요.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-slate-300">
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">선택 즉시 시작</span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">우승까지 토너먼트</span>
                        </div>
                    </section>

                    <section
                        aria-labelledby="round-selection-title"
                        className="rounded-[32px] border border-white/10 bg-white/[0.08] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-black tracking-[0.16em] text-violet-200">SELECT ROUND</p>
                                <h2 id="round-selection-title" className="mt-2 text-2xl font-black tracking-[-0.03em]">
                                    몇 강부터 시작할까요?
                                </h2>
                            </div>
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-500/20 text-xl">
                                ⚡
                            </span>
                        </div>

                        {isLoading && (
                            <div className="mt-7 space-y-3" aria-label="라운드 목록 불러오는 중">
                                {[0, 1, 2].map((item) => (
                                    <div key={item} className="h-[72px] animate-pulse rounded-2xl bg-white/10" />
                                ))}
                            </div>
                        )}

                        {isError && (
                            <div className="mt-7 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5">
                                <p className="font-bold text-rose-100">라운드 정보를 불러오지 못했어요.</p>
                                <p className="mt-1 text-sm leading-6 text-rose-100/70">잠시 후 다시 시도해주세요.</p>
                                <button
                                    type="button"
                                    className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-rose-50"
                                    onClick={onRetry}
                                >
                                    다시 불러오기
                                </button>
                            </div>
                        )}

                        {!isLoading && !isError && playableRounds.length === 0 && (
                            <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-300">
                                지금 시작할 수 있는 라운드가 없습니다.
                            </div>
                        )}

                        {!isLoading && !isError && playableRounds.length > 0 && (
                            <div className="mt-7 space-y-3">
                                {hasStartError && (
                                    <p className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100">
                                        게임을 시작하지 못했어요. 라운드를 다시 선택해주세요.
                                    </p>
                                )}

                                {playableRounds.map((round) => {
                                    const isSelected = isStarting && selectedRound === round;

                                    return (
                                        <button
                                            type="button"
                                            key={round}
                                            className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-violet-400/15 disabled:cursor-wait disabled:opacity-60"
                                            onClick={() => onSelectRound(round)}
                                            disabled={isStarting}
                                        >
                                            <span>
                                                <span className="block text-xl font-black">{round}강</span>
                                                <span className="mt-1 block text-xs font-semibold text-slate-400">
                                                    우승까지 총 {round - 1}경기
                                                </span>
                                            </span>
                                            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-lg transition group-hover:bg-white group-hover:text-slate-950">
                                                {isSelected ? (
                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                ) : (
                                                    <span aria-hidden="true">→</span>
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-slate-400">
                            라운드를 선택하면 대진을 준비합니다. 진행 중에는 처음부터 다시 시작할 수 있어요.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default RoundPopup;
