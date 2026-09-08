'use client';
import Link from 'next/link';
import React, { MouseEvent, useContext } from 'react';
import SignInUpButton from '../header/SignInUpButton';
import { useAuth } from '@/providers/AuthProvider';
import { PopupContext } from '@/providers/PopupProvider';
import AlertPopup from '../popup/AlertPopup';
import { VERSION } from '@/consts/Version';

const Header = () => {
    const { isLoggedIn, user } = useAuth();
    const { showPopup, hidePopup } = useContext(PopupContext);
    const userId = user?.id ?? '';

    const handleLoginBaseService = (e: MouseEvent<HTMLAnchorElement>) => {
        if (!isLoggedIn) {
            e.preventDefault(); // 링크의 기본 동작을 방지합니다.
            showPopup(<AlertPopup message="로그인이 필요한 서비스입니다." hidePopup={hidePopup} />);
        }
        // 로그인 상태에서는 링크의 기본 동작을 계속 진행합니다.
    };

    return (
        <nav
            style={{ backgroundColor: '#2b6cb0' }}
            className="flex items-center justify-between flex-wrap p-6 relative"
        >
            <div className="flex items-center flex-shrink-0 text-white mr-6">
                <svg
                    className="fill-current h-8 w-8 mr-2"
                    width="54"
                    height="54"
                    viewBox="0 0 54 54"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z" />
                </svg>
                <span className="version-number text-white text-sm mr-2" style={{ bottom: '20px', left: '40px' }}>
                    v{VERSION}
                </span>
                <Link href="/">
                    <span className="font-semibold text-xl tracking-tight">이상형 월드컵</span>
                </Link>
            </div>
            <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
                <div className="text-lg lg:flex-grow">
                    <Link
                        href="/manage"
                        className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
                        onClick={handleLoginBaseService}
                    >
                        월드컵 만들기
                    </Link>

                    <Link
                        href={`/members/${userId}/games`}
                        className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
                        onClick={handleLoginBaseService}
                    >
                        자신의 월드컵 목록
                    </Link>
                    <Link
                        href={`https://stingy-sort-6b7.notion.site/36bf75ec4a0d4c888852a4d7bb13ff76?pvs=4`}
                        className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
                    >
                        패치노트
                    </Link>
                </div>
                <SignInUpButton />
            </div>
        </nav>
    );
};

export default Header;
