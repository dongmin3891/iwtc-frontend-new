'use client';

import React, { KeyboardEvent, useEffect, useId, useRef } from 'react';

interface IProps {
    message: string;
    hidePopup: () => void;
}

const AlertPopup = ({ message, hidePopup }: IProps) => {
    const titleId = useId();
    const messageId = useId();
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';
        confirmButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
            previousActiveElement?.focus();
        };
    }, []);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            hidePopup();
            return;
        }

        if (event.key === 'Tab') {
            event.preventDefault();
            confirmButtonRef.current?.focus();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:p-6"
            onKeyDown={handleKeyDown}
        >
            <section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={messageId}
                className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-2xl shadow-black/50"
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/70 to-transparent" />
                <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                        <span
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-lg font-black text-violet-200"
                            aria-hidden="true"
                        >
                            i
                        </span>
                        <div className="min-w-0 pt-0.5">
                            <span className="text-[10px] font-black tracking-[0.16em] text-violet-300">IWTC NOTICE</span>
                            <h2 id={titleId} className="mt-1.5 text-xl font-black tracking-[-0.03em] text-white">
                                알림
                            </h2>
                        </div>
                    </div>

                    <p
                        id={messageId}
                        className="mt-5 whitespace-pre-wrap break-words rounded-2xl border border-white/[0.07] bg-slate-950/45 px-4 py-4 text-sm leading-6 text-slate-300"
                    >
                        {message}
                    </p>

                    <button
                        ref={confirmButtonRef}
                        type="button"
                        onClick={hidePopup}
                        className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-5 text-sm font-black text-white shadow-lg shadow-sky-950/20 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-sky-300/70 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        확인
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AlertPopup;
