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
        <>
            <article className="bg-zinc-900 border border-zinc-600 p-3 text-base rounded-lg dark:bg-gray-900">
                <footer className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                        <p className="inline-flex items-center mr-3 text-sm font-semibold">
                            <span className="text-yellow-400">{writerNickname}</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <time
                                dateTime={createdAt}
                                title={moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}
                            >
                                {getPassedTimeMessage(moment(createdAt))}
                            </time>
                        </p>
                    </div>
                    {showDeleteButton && (
                        <button
                            type="button"
                            className="text-sm text-gray-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={onClickDelete}
                            disabled={isDeleting}
                            aria-label={`${writerNickname} 댓글 삭제`}
                        >
                            {isDeleting ? '삭제 중...' : '삭제'}
                        </button>
                    )}
                </footer>

                <p className="text-white dark:text-gray-400">{body}</p>
            </article>
        </>
    );
};

export default ReplyList;
