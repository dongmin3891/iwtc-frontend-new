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
            <div onClick={() => onClickHandler(true)}>
                <a
                    href="#"
                    className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                >
                    {'Logout'}
                </a>
            </div>
        );
    }

    return (
        <div onClick={() => onClickHandler(false)}>
            <a
                href="#"
                className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
                onClick={(e) => {
                    e.preventDefault();
                }}
            >
                {'Login'}
            </a>
        </div>
    );
};

export default SignInUpButton;
