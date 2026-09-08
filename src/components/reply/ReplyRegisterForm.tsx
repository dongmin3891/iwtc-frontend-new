import { worldCupGameReplyRegister } from '@/services/ReplyService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { ChangeEvent, useState } from 'react';
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

    const [text, setText] = useState<string>('');
    const { mutate: replyRegister } = useMutation(worldCupGameReplyRegister, {
        onSuccess: () => {
            setText('');
            queryClient.invalidateQueries({ queryKey: replyQueryKeys.lists(), refetchType: 'all' });
        },
    });

    const onClickRegister = () => {
        const normalizedText = text.trim();
        if (!normalizedText) {
            return;
        }

        const params = {
            worldcupId: worldcupId,
            contentsId: contentsId,
            body: normalizedText,
            nickname: isLoggedIn ? getUserInfo().nickname : shortid.generate(),
            token: isLoggedIn ? getAccessToken() : undefined,
        };
        replyRegister(params);
    };
    const onChangeText = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const comment = e.target.value;
        setText(comment);
    };
    return (
        <div className="flex mb-10 ">
            <div className=" w-2/3 border border-zinc-600 py-1 px-4 mb-4  bg-zinc-900 rounded-md shadow-md rounded-lg rounded-t-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <label form="comment" className="sr-only">
                    Your comment
                </label>
                <textarea
                    id="comment"
                    rows={3}
                    className=" text-white bg-zinc-900 px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:bg-gray-800"
                    placeholder="댓글 작성하기..."
                    required
                    maxLength={30}
                    value={text}
                    onChange={onChangeText}
                ></textarea>
            </div>
            <button
                type="submit"
                className="w-1/3 items-center py-2 px-4 mb-4 text-ms font-medium text-center text-white bg-yellow-600 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
                onClick={onClickRegister}
            >
                작성하기
            </button>
        </div>
    );
};

export default ReplyRegisterForm;
