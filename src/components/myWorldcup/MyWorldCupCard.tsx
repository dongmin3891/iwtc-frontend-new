import { deleteMyWorldCup, ManagedWorldCupSummary } from '@/services/ManageWorldCupService';
import { getAccessToken } from '@/utils/TokenManager';
import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import Link from 'next/link';
import ConfirmPopup from '../popup/ConfirmPopup';
import { PopupContext } from '@/providers/PopupProvider';

interface MyWorldCupCardProps {
    myWorldCup: ManagedWorldCupSummary;
    refetch: () => Promise<unknown>;
}

const MyWorldCupCard = ({ myWorldCup, refetch }: MyWorldCupCardProps) => {
    const { showPopup, hidePopup } = useContext(PopupContext);
    const { mutate, isLoading, isError, reset } = useMutation(deleteMyWorldCup, {
        onSuccess: () => {
            void refetch();
        },
    });

    const removeMyWorldCup = (worldCupId: number) => {
        if (isLoading) {
            return;
        }

        reset();
        const accessToken = getAccessToken();
        const params = {
            worldCupId,
            token: accessToken,
        };
        mutate(params);
    };

    const showDeleteConfirm = () => {
        if (isLoading) {
            return;
        }

        showPopup(
            <ConfirmPopup
                title="월드컵 삭제"
                message={`‘${myWorldCup.title}’ 월드컵을 삭제할까요?\n삭제한 월드컵과 후보는 복구할 수 없습니다.`}
                confirmLabel="삭제하기"
                hidePopup={hidePopup}
                onConfirm={() => {
                    hidePopup();
                    removeMyWorldCup(myWorldCup.worldCupId);
                }}
            />
        );
    };

    const isPublic = myWorldCup.visibleType === 'PUBLIC';

    return (
        <article className="group flex min-h-[280px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.08em] ${
                        isPublic
                            ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
                            : 'border-slate-400/20 bg-slate-400/10 text-slate-300'
                    }`}
                >
                    {isPublic ? '공개' : '비공개'}
                </span>
                <span className="text-[10px] font-bold tracking-[0.12em] text-slate-600">ID {myWorldCup.worldCupId}</span>
            </div>

            <div className="mt-6 flex-1">
                <h3 className="break-words text-xl font-black tracking-[-0.03em] text-white">{myWorldCup.title}</h3>
                <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-slate-400">
                    {myWorldCup.description}
                </p>
            </div>

            {isError && (
                <p className="mt-4 rounded-xl border border-rose-300/15 bg-rose-400/[0.06] px-3 py-2 text-xs font-bold text-rose-300" role="alert">
                    삭제하지 못했습니다. 잠시 후 다시 시도해주세요.
                </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-2">
                <Link
                    href={`/play-game/${myWorldCup.worldCupId}`}
                    className="col-span-2 inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-4 text-sm font-black text-white transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-sky-300/70"
                >
                    플레이하기
                </Link>
                <Link
                    href={`/manage/${myWorldCup.worldCupId}`}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-xs font-black text-slate-200 transition hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                    후보 관리
                </Link>
                <button
                    type="button"
                    disabled={isLoading}
                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-2xl border border-rose-300/15 bg-rose-400/[0.06] px-4 text-xs font-black text-rose-200 transition hover:border-rose-300/30 hover:bg-rose-400/10 focus:outline-none focus:ring-2 focus:ring-rose-300/30 disabled:cursor-wait disabled:opacity-60"
                    onClick={showDeleteConfirm}
                >
                    {isLoading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-200/30 border-t-rose-200" aria-hidden="true" />}
                    {isLoading ? '삭제 중' : '삭제'}
                </button>
            </div>
        </article>
    );
};
export default MyWorldCupCard;
