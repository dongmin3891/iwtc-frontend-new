'use client';
import React, { ChangeEvent, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getLoginFormSchema } from '@/utils/validations/loginValidation';
import ValidateMessage from '../ValidateMessage';
import { useMutation } from '@tanstack/react-query';
import { userMeSummary, userSignIn } from '@/services/MemberService';
import Link from 'next/link';
import { setToken } from '@/utils/TokenManager';
import { useRouter } from 'next/navigation';
import { setUserInfo } from '@/stores/LocalStore';
import { useAuth } from '@/providers/AuthProvider';
import AlertPopup from '../popup/AlertPopup';
import { PopupContext } from '@/providers/PopupProvider';
import { isAxiosError } from 'axios';

interface FormTypes {
    username: string;
    password: string;
}

interface LoginErrorResponse {
    message: string;
}

const LoginForm = () => {
    const router = useRouter();
    const { login } = useAuth();
    const { showPopup, hidePopup } = useContext(PopupContext);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<FormTypes>({
        resolver: getLoginFormSchema(),
    });

    const { mutate, isLoading } = useMutation(userSignIn, {
        onSuccess: async (data) => {
            const accessToken = data.headers['access-token'];
            if (typeof accessToken !== 'string') {
                showPopup(<AlertPopup message="로그인 응답을 확인할 수 없습니다." hidePopup={hidePopup} />);
                return;
            }

            setToken(accessToken);

            try {
                const userInfo = await userMeSummary(accessToken);
                setUserInfo(userInfo.data);
                login(userInfo.data);
                router.push('/');
            } catch {
                showPopup(<AlertPopup message="회원 정보를 불러오지 못했습니다." hidePopup={hidePopup} />);
            }
        },
        onError: (error: unknown) => {
            if (isAxiosError<LoginErrorResponse>(error) && error.response?.data) {
                showPopup(<AlertPopup message={error.response.data.message} hidePopup={hidePopup} />);
                return;
            }
            showPopup(<AlertPopup message="로그인 중 오류가 발생했습니다." hidePopup={hidePopup} />);
        },
    });

    const handleChange = (field: keyof FormTypes) => (event: ChangeEvent<HTMLInputElement>) => {
        setValue(field, event.target.value, { shouldValidate: true });
    };

    const handleLogin = ({ username, password }: FormTypes) => {
        mutate({
            serviceId: username.trim().toLowerCase(),
            password,
        });
    };

    return (
        <main className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950 px-5 py-10 text-white sm:px-8 lg:px-10 lg:py-14">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_12%,rgba(124,110,255,0.38),transparent_30%),radial-gradient(circle_at_88%_75%,rgba(14,165,233,0.15),transparent_30%)]" />
            <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:48px_48px]" />

            <div className="mx-auto grid min-h-[calc(100vh-184px)] max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-20">
                <section className="hidden lg:block">
                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-black tracking-[0.16em] text-violet-200">
                        WELCOME BACK
                    </span>
                    <h1 className="mt-6 max-w-xl text-6xl font-black leading-[1.08] tracking-[-0.05em]">
                        다시 만나서
                        <br />
                        반가워요.
                    </h1>
                    <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
                        로그인하면 내가 만든 월드컵을 관리하고, 후보를 추가하거나 수정할 수 있어요.
                    </p>

                    <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-400/15 text-lg">✦</span>
                            <p className="mt-4 text-sm font-bold">월드컵 관리</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">내가 만든 게임을 한곳에서 확인하세요.</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-400/15 text-lg">↗</span>
                            <p className="mt-4 text-sm font-bold">후보 업데이트</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">이미지와 영상 후보를 편하게 관리하세요.</p>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-[460px] rounded-[32px] border border-white/10 bg-white/[0.08] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
                    <div className="lg:hidden">
                        <span className="text-xs font-black tracking-[0.16em] text-violet-200">WELCOME BACK</span>
                    </div>
                    <div className="mt-3 lg:mt-0">
                        <p className="text-sm font-bold text-violet-200">IWTC 계정</p>
                        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">로그인</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-400">계정 정보를 입력하고 내 월드컵으로 돌아가세요.</p>
                    </div>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit(handleLogin)} noValidate>
                        <div>
                            <label htmlFor="service-id" className="mb-2 block text-xs font-bold text-slate-300">
                                아이디
                            </label>
                            <input
                                id="service-id"
                                type="text"
                                className={`h-12 w-full rounded-2xl border bg-slate-950/45 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-4 ${
                                    errors.username
                                        ? 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-400/10'
                                        : 'border-white/10 focus:border-violet-300/50 focus:ring-violet-400/10'
                                }`}
                                placeholder="영문·숫자 6~10자"
                                autoComplete="username"
                                aria-invalid={Boolean(errors.username)}
                                aria-describedby={errors.username ? 'service-id-error' : undefined}
                                {...register('username')}
                                onChange={handleChange('username')}
                            />
                            {errors.username && (
                                <ValidateMessage
                                    id="service-id-error"
                                    className="mt-2 block text-xs font-semibold text-rose-300"
                                    result={errors.username}
                                />
                            )}
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label htmlFor="password" className="text-xs font-bold text-slate-300">
                                    비밀번호
                                </label>
                                <span className="text-[11px] font-semibold text-slate-600">8~16자</span>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={`h-12 w-full rounded-2xl border bg-slate-950/45 px-4 pr-16 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-4 ${
                                        errors.password
                                            ? 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-400/10'
                                            : 'border-white/10 focus:border-violet-300/50 focus:ring-violet-400/10'
                                    }`}
                                    placeholder="비밀번호 입력"
                                    autoComplete="current-password"
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={errors.password ? 'password-error' : undefined}
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
                            {errors.password && (
                                <ValidateMessage
                                    id="password-error"
                                    className="mt-2 block text-xs font-semibold text-rose-300"
                                    result={errors.password}
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
                            {isLoading ? '로그인 중' : '로그인'}
                        </button>
                    </form>

                    <div className="mt-7 border-t border-white/10 pt-6 text-center">
                        <p className="text-sm text-slate-400">
                            아직 계정이 없나요?{' '}
                            <Link href="/sign-up" className="font-bold text-violet-200 transition hover:text-white">
                                회원가입
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

export default LoginForm;
