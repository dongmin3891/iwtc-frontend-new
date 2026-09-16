'use client';

import { getPassedTimeMessage } from '@/utils/Time';
import moment from 'moment';
import { ReplyData, worldCupGameReplyDelete } from '@/services/ReplyService';
import { useAuth } from '@/providers/AuthProvider';
import { canDeleteReply } from '@/services/replyPermission';
import { getAccessToken } from '@/utils/TokenManager';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { replyQueryKeys } from '@/lib/react-query/queryKeys';

interface IProps {
    replyData: ReplyData;
}

const ReplyList = ({ replyData }: IProps) => {
    const { body, commentId, commentWriterId, createdAt, writerNickname } = replyData;
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { mutate: deleteReply, isLoading: isDeleting } = useMutation(
        ({ targetCommentId, token }: { targetCommentId: number; token: string }) =>
            worldCupGameReplyDelete(targetCommentId, token),
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: replyQueryKeys.lists(), refetchType: 'all' });
            },
            onError: () => {
                window.alert('댓글을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.');
            },
        }
    );
    const showDeleteButton = canDeleteReply(commentWriterId, user?.id);

    const onClickDelete = () => {
        const token = getAccessToken();
        if (!token) {
            window.alert('로그인이 필요합니다.');
            return;
        }
        if (!window.confirm('댓글을 삭제할까요?')) {
            return;
        }
        deleteReply({ targetCommentId: commentId, token });
    };

    return (
        <article className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <footer className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-400/15 text-xs font-black text-violet-200">
                        {writerNickname.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-200">{writerNickname}</p>
                        <p className="text-[11px] text-slate-500">
                            <time dateTime={createdAt} title={moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                                {getPassedTimeMessage(moment(createdAt))}
                            </time>
                        </p>
                    </div>
                </div>
                {showDeleteButton && (
                    <button
                        type="button"
                        className="shrink-0 text-xs font-semibold text-slate-500 transition hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={onClickDelete}
                        disabled={isDeleting}
                        aria-label={`${writerNickname} 댓글 삭제`}
                    >
                        {isDeleting ? '삭제 중' : '삭제'}
                    </button>
                )}
            </footer>

            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">{body}</p>
        </article>
    );
};

export default ReplyList;
