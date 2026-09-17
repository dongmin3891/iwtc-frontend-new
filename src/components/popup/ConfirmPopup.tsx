'use client';

import React, { KeyboardEvent, useEffect, useId, useRef } from 'react';

interface ConfirmPopupProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    hidePopup: () => void;
    onConfirm: () => void;
}

const ConfirmPopup = ({
    title,
    message,
    confirmLabel = '확인',
    cancelLabel = '취소',
    hidePopup,
    onConfirm,
}: ConfirmPopupProps) => {
    const titleId = useId();
    const messageId = useId();
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';
        cancelButtonRef.current?.focus();

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

        if (event.key !== 'Tab') {
            return;
        }

        event.preventDefault();
        const activeElement = document.activeElement;

        if (event.shiftKey) {
            if (activeElement === confirmButtonRef.current) {
                cancelButtonRef.current?.focus();
            } else {
                confirmButtonRef.current?.focus();
            }
            return;
        }

        if (activeElement === cancelButtonRef.current) {
            confirmButtonRef.current?.focus();
        } else {
            cancelButtonRef.current?.focus();
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
                className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-rose-300/15 bg-slate-900 shadow-2xl shadow-black/50"
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/70 to-transparent" />
                <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                        <span
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-rose-300/20 bg-rose-400/10 text-lg font-black text-rose-200"
                            aria-hidden="true"
                        >
                            !
                        </span>
                        <div className="min-w-0 pt-0.5">
                            <span className="text-[10px] font-black tracking-[0.16em] text-rose-300">DANGER ZONE</span>
                            <h2 id={titleId} className="mt-1.5 text-xl font-black tracking-[-0.03em] text-white">
                                {title}
                            </h2>
                        </div>
                    </div>

                    <p
                        id={messageId}
                        className="mt-5 whitespace-pre-wrap break-words rounded-2xl border border-rose-300/10 bg-rose-400/[0.05] px-4 py-4 text-sm leading-6 text-slate-300"
                    >
                        {message}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                            ref={cancelButtonRef}
                            type="button"
                            onClick={hidePopup}
                            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-black text-slate-200 transition hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            ref={confirmButtonRef}
                            type="button"
                            onClick={onConfirm}
                            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-rose-500 px-4 text-sm font-black text-white shadow-lg shadow-rose-950/30 transition hover:bg-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300/70 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ConfirmPopup;
