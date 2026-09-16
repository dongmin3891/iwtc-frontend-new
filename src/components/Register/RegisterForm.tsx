'use client';

import React, { ChangeEvent, useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { getRegisterFormSchema } from '@/utils/validations/registerValidation';
import { userSignUp } from '@/services/MemberService';
import { PopupContext } from '@/providers/PopupProvider';
import ValidateMessage from '../ValidateMessage';
import AlertPopup from '../popup/AlertPopup';

type FormTypes = {
    username: string;
    password: string;
    passwordConfirm: string;
    nickname: string;
};

interface RegisterErrorResponse {
    message: string;
}

const RegisterForm = () => {
    const router = useRouter();
    const { showPopup, hidePopup } = useContext(PopupContext);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<FormTypes>({
        resolver: getRegisterFormSchema(),
    });

    const { mutate, isLoading } = useMutation(userSignUp, {
        onSuccess: () => {
            router.push('/sign-in');
            showPopup(<AlertPopup message="회원가입에 성공하셨습니다." hidePopup={hidePopup} />);
        },
        onError: (error: unknown) => {
            if (isAxiosError<RegisterErrorResponse>(error) && error.response?.data) {
                showPopup(<AlertPopup message={error.response.data.message} hidePopup={hidePopup} />);
                return;
            }
            showPopup(<AlertPopup message="회원가입 중 오류가 발생했습니다." hidePopup={hidePopup} />);
        },
    });

    const handleChange = (field: keyof FormTypes) => (event: ChangeEvent<HTMLInputElement>) => {
        setValue(field, event.target.value, { shouldValidate: true });
    };

    const handleRegister = ({ username, password, nickname }: FormTypes) => {
        mutate({
            serviceId: username.trim().toLowerCase(),
            password,
            nickname: nickname.trim(),
        });
    };

    const inputClassName = (hasError: boolean) =>
        `h-12 w-full rounded-2xl border bg-slate-950/45 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-4 ${
            hasError
                ? 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-400/10'
                : 'border-white/10 focus:border-violet-300/50 focus:ring-violet-400/10'
        }`;

    return (
        <main className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950 px-5 py-10 text-white sm:px-8 lg:px-10 lg:py-14">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_14%_16%,rgba(124,110,255,0.4),transparent_31%),radial-gradient(circle_at_86%_72%,rgba(14,165,233,0.14),transparent_31%)]" />
            <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:48px_48px]" />

            <div className="mx-auto grid min-h-[calc(100vh-184px)] max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-16">
                <section className="hidden lg:block">
                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-black tracking-[0.16em] text-violet-200">
                        CREATE YOUR ACCOUNT
                    </span>
                    <h1 className="mt-6 max-w-xl text-6xl font-black leading-[1.08] tracking-[-0.05em]">
                        나만의 월드컵을
                        <br />
                        만들어 보세요.
                    </h1>
                    <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
                        계정을 만들면 주제와 후보를 직접 구성하고, 언제든 다시 찾아 관리할 수 있어요.
                    </p>

                    <ol className="mt-10 max-w-lg space-y-3" aria-label="회원가입 후 이용 단계">
                        {[
                            ['01', '계정 만들기', '간단한 정보로 IWTC 계정을 시작하세요.'],
                            ['02', '월드컵 구성', '주제와 설명을 정하고 후보를 추가하세요.'],
                            ['03', '공유하고 즐기기', '완성한 월드컵을 친구들과 플레이하세요.'],
                        ].map(([number, title, description]) => (
                            <li key={number} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-400/15 text-xs font-black text-violet-200">
                                    {number}
                                </span>
                                <div>
                                    <p className="text-sm font-bold">{title}</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="mx-auto w-full max-w-[520px] rounded-[32px] border border-white/10 bg-white/[0.08] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
                    <div className="lg:hidden">
                        <span className="text-xs font-black tracking-[0.16em] text-violet-200">CREATE YOUR ACCOUNT</span>
                    </div>
                    <div className="mt-3 lg:mt-0">
                        <p className="text-sm font-bold text-violet-200">IWTC 시작하기</p>
                        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">회원가입</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-400">아래 정보를 입력하면 바로 계정을 만들 수 있어요.</p>
                    </div>

                    <form className="mt-7 space-y-5" onSubmit={handleSubmit(handleRegister)} noValidate>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label htmlFor="service-id" className="text-xs font-bold text-slate-300">
                                        아이디
                                    </label>
                                    <span className="text-[11px] font-semibold text-slate-600">6~10자</span>
                                </div>
                                <input
                                    id="service-id"
                                    type="text"
                                    className={inputClassName(Boolean(errors.username))}
                                    placeholder="영문·숫자"
                                    autoComplete="username"
                                    aria-invalid={Boolean(errors.username)}
                                    aria-describedby={errors.username ? 'service-id-error' : 'service-id-help'}
                                    {...register('username')}
                                    onChange={handleChange('username')}
                                />
                                {errors.username ? (
                                    <ValidateMessage
                                        id="service-id-error"
                                        className="mt-2 block text-xs font-semibold text-rose-300"
                                        result={errors.username}
                                    />
                                ) : (
                                    <p id="service-id-help" className="mt-2 text-[11px] leading-4 text-slate-600">
                                        로그인할 때 사용할 아이디예요.
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label htmlFor="nickname" className="text-xs font-bold text-slate-300">
                                        닉네임
                                    </label>
                                    <span className="text-[11px] font-semibold text-slate-600">2~10자</span>
                                </div>
                                <input
                                    id="nickname"
                                    type="text"
                                    className={inputClassName(Boolean(errors.nickname))}
                                    placeholder="공백 없이 입력"
                                    autoComplete="nickname"
                                    aria-invalid={Boolean(errors.nickname)}
                                    aria-describedby={errors.nickname ? 'nickname-error' : 'nickname-help'}
                                    {...register('nickname')}
                                    onChange={handleChange('nickname')}
                                />
                                {errors.nickname ? (
                                    <ValidateMessage
                                        id="nickname-error"
                                        className="mt-2 block text-xs font-semibold text-rose-300"
                                        result={errors.nickname}
                                    />
                                ) : (
                                    <p id="nickname-help" className="mt-2 text-[11px] leading-4 text-slate-600">
                                        다른 사용자에게 보이는 이름이에요.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label htmlFor="password" className="text-xs font-bold text-slate-300">
                                    비밀번호
                                </label>
                                <span className="text-[11px] font-semibold text-slate-600">영문·숫자·특수문자 포함</span>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={`${inputClassName(Boolean(errors.password))} pr-16`}
                                    placeholder="8~16자로 입력"
                                    autoComplete="new-password"
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={errors.password ? 'password-error' : 'password-help'}
                                    {...register('password')}
                                    onChange={handleChange('password')}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 px-4 text-xs font-bold text-slate-500 transition hover:text-slate-200"
                                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                                    onClick={() => setShowPassword((current) => !current)}
                                >
                                    {showPassword ? '숨기기' : '보기'}
                                </button>
                            </div>
                            {errors.password ? (
                                <ValidateMessage
                                    id="password-error"
                                    className="mt-2 block text-xs font-semibold text-rose-300"
                                    result={errors.password}
                                />
                            ) : (
                                <p id="password-help" className="mt-2 text-[11px] leading-4 text-slate-600">
                                    8~16자, 영문·숫자·특수문자를 각각 하나 이상 사용하세요.
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password-confirm" className="mb-2 block text-xs font-bold text-slate-300">
                                비밀번호 확인
                            </label>
                            <div className="relative">
                                <input
                                    id="password-confirm"
                                    type={showPasswordConfirm ? 'text' : 'password'}
                                    className={`${inputClassName(Boolean(errors.passwordConfirm))} pr-16`}
                                    placeholder="비밀번호를 한 번 더 입력"
                                    autoComplete="new-password"
                                    aria-invalid={Boolean(errors.passwordConfirm)}
                                    aria-describedby={errors.passwordConfirm ? 'password-confirm-error' : undefined}
                                    {...register('passwordConfirm')}
                                    onChange={handleChange('passwordConfirm')}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 px-4 text-xs font-bold text-slate-500 transition hover:text-slate-200"
                                    aria-label={showPasswordConfirm ? '비밀번호 확인 값 숨기기' : '비밀번호 확인 값 표시'}
                                    onClick={() => setShowPasswordConfirm((current) => !current)}
                                >
                                    {showPasswordConfirm ? '숨기기' : '보기'}
                                </button>
                            </div>
                            {errors.passwordConfirm && (
                                <ValidateMessage
                                    id="password-confirm-error"
                                    className="mt-2 block text-xs font-semibold text-rose-300"
                                    result={errors.passwordConfirm}
                                />
                            )}
                        </div>

                        <button
                            type="submit"
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 text-sm font-black text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-400 disabled:cursor-wait disabled:opacity-60"
                            disabled={isLoading}
                        >
                            {isLoading && (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            )}
                            {isLoading ? '계정 만드는 중' : '계정 만들기'}
                        </button>
                    </form>

                    <div className="mt-7 border-t border-white/10 pt-6 text-center">
                        <p className="text-sm text-slate-400">
                            이미 계정이 있나요?{' '}
                            <Link href="/sign-in" className="font-bold text-violet-200 transition hover:text-white">
                                로그인
                            </Link>
                        </p>
                        <Link href="/" className="mt-4 inline-flex text-xs font-semibold text-slate-600 transition hover:text-slate-300">
                            ← 월드컵 목록으로 돌아가기
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default React.memo(RegisterForm);
