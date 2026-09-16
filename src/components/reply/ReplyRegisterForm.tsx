import { worldCupGameReplyRegister } from '@/services/ReplyService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getUserInfo } from '@/stores/LocalStore';
import * as shortid from 'shortid';
import { replyQueryKeys } from '@/lib/react-query/queryKeys';
import { getAccessToken } from '@/utils/TokenManager';

interface IProps {
    worldcupId: number;
    contentsId: number;
}

const ReplyRegisterForm = ({ worldcupId, contentsId }: IProps) => {
    const queryClient = useQueryClient();
    const { isLoggedIn } = useAuth();

    const [text, setText] = useState('');
    const { mutate: replyRegister, isLoading, isError } = useMutation(worldCupGameReplyRegister, {
        onSuccess: () => {
            setText('');
            queryClient.invalidateQueries({ queryKey: replyQueryKeys.lists(), refetchType: 'all' });
        },
    });

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalizedText = text.trim();
        if (!normalizedText) {
            return;
        }

        replyRegister({
            worldcupId,
            contentsId,
            body: normalizedText,
            nickname: isLoggedIn ? getUserInfo().nickname : shortid.generate(),
            token: isLoggedIn ? getAccessToken() : undefined,
        });
    };

    const onChangeText = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
    };

    return (
        <form onSubmit={onSubmit}>
            <label htmlFor="comment" className="mb-2 block text-xs font-bold text-slate-400">
                댓글 작성
            </label>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45 transition focus-within:border-violet-300/40 focus-within:ring-4 focus-within:ring-violet-400/10">
                <textarea
                    id="comment"
                    rows={3}
                    className="w-full resize-none border-0 bg-transparent px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600"
                    placeholder="우승 후보에 대한 의견을 남겨보세요."
                    required
                    maxLength={30}
                    value={text}
                    onChange={onChangeText}
                />
                <div className="flex items-center justify-between border-t border-white/5 px-3 py-2">
                    <span className="text-[11px] font-semibold text-slate-600">{text.length}/30</span>
                    <button
                        type="submit"
                        className="rounded-xl bg-violet-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={!text.trim() || isLoading}
                    >
                        {isLoading ? '등록 중' : '댓글 등록'}
                    </button>
                </div>
            </div>
            {isError && <p className="mt-2 text-xs font-semibold text-rose-300">댓글을 등록하지 못했어요.</p>}
            {!isLoggedIn && (
                <p className="mt-2 text-[11px] leading-5 text-slate-600">
                    로그인하지 않아도 임시 닉네임으로 댓글을 남길 수 있어요.
                </p>
            )}
        </form>
    );
};

export default ReplyRegisterForm;
