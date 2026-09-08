'use client';
import React, { ChangeEvent, useContext } from 'react';
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

    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<FormTypes>({
        resolver: getLoginFormSchema(),
    });

    const { mutate } = useMutation(userSignIn, {
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

    /**
     * handlers
     */
    const handleChange = (field: keyof FormTypes) => (e: ChangeEvent<HTMLInputElement>) => {
        setValue(field, e.target.value, { shouldValidate: true });
    };
    const handleLogin = ({ username, password }: FormTypes) => {
        const loginParam = {
            serviceId: username.trim().toLowerCase(),
            password,
        };
        mutate(loginParam);
    };

    return (
        <>
            <div className="p-4">
                <form className="max-w-sm mx-auto" onSubmit={handleSubmit(handleLogin)}>
                    <div className="grid gap-y-2 mb-6">
                        <input
                            type="text"
                            className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-yellow-400 focus:outline-none"
                            placeholder="Username을 입력해주세요."
                            autoComplete="username"
                            {...register('username')}
                            onChange={handleChange('username')}
                        />
                        {errors.username && <ValidateMessage result={errors.username} />}
                        <input
                            type="password"
                            className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-yellow-400 focus:outline-none"
                            placeholder="비밀번호를 입력해주세요."
                            autoComplete="current-password"
                            {...register('password')}
                            onChange={handleChange('password')}
                        />
                        {errors.password && <ValidateMessage result={errors.password} />}
                    </div>
                    <button
                        type="submit"
                        className="inline-block px-7 py-3 bg-yellow-400 text-white leading-snug rounded shadow-md hover:bg-yellow-400 hover:shadow-lg focus:bg-yellow-400 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-yellow-400 w-full"
                    >
                        로그인
                    </button>
                </form>
            </div>
            <div className="text-center mt-4">
                <Link href="/sign-up">회원가입 </Link>
            </div>
        </>
    );
};

export default LoginForm;
