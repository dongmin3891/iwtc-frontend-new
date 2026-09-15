'use client';
import { userSignOut } from '@/services/MemberService';
import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { localStorageClear } from '@/stores/LocalStore';
import { useAuth } from '@/providers/AuthProvider';
import { PopupContext } from '@/providers/PopupProvider';
import AlertPopup from '../popup/AlertPopup';
import { removeToken } from '@/utils/TokenManager';

const SignInUpButton = () => {
    const router = useRouter();
    const { isLoggedIn, logout } = useAuth();
    const { showPopup, hidePopup } = useContext(PopupContext);

    const onClickHandler = async (isLogin: boolean) => {
        if (isLogin) {
            try {
                await userSignOut();
            } finally {
                removeToken();
                localStorageClear();
                logout();
                showPopup(<AlertPopup message="로그아웃 하셨습니다." hidePopup={hidePopup} />);
            }
        } else {
            router.push('/sign-in');
        }
    };

    if (isLoggedIn) {
        return (
            <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:w-auto"
                onClick={() => onClickHandler(true)}
            >
                로그아웃
            </button>
        );
    }

    return (
        <button
            type="button"
            className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-700 lg:w-auto"
            onClick={() => onClickHandler(false)}
        >
            로그인
        </button>
    );
};

export default SignInUpButton;
