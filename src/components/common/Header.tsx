'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import SignInUpButton from '../header/SignInUpButton';
import { VERSION } from '@/consts/Version';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-[60] border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
            <div className="mx-auto flex min-h-[72px] max-w-7xl flex-wrap items-center justify-between px-5 sm:px-8 lg:px-10">
                <Link href="/" className="group flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-sm font-black text-white shadow-lg shadow-violet-600/20 transition group-hover:-rotate-3 group-hover:scale-105">
                        W
                    </span>
                    <span>
                        <span className="block text-lg font-black tracking-[-0.03em] text-slate-950">IWTC</span>
                        <span className="block text-[10px] font-bold tracking-[0.14em] text-slate-400">
                            IDEAL WORLD CUP · v{VERSION}
                        </span>
                    </span>
                </Link>

                <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
                    aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((current) => !current)}
                >
                    <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        {isMenuOpen ? (
                            <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                        ) : (
                            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                        )}
                    </svg>
                </button>

                <div
                    className={`${
                        isMenuOpen ? 'flex' : 'hidden'
                    } w-full flex-col gap-2 border-t border-slate-100 py-4 lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-1 lg:border-0 lg:py-0`}
                >
                    <div onClick={() => setIsMenuOpen(false)}>
                        <SignInUpButton />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
