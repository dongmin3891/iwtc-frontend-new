'use client';
import React, { ChangeEvent, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { getRegisterFormSchema } from '@/utils/validations/registerValidation';
import ValidateMessage from '../ValidateMessage';
import { useMutation } from '@tanstack/react-query';
import { userSignUp } from '@/services/MemberService';
import { useRouter } from 'next/navigation';
import { PopupContext } from '@/providers/PopupProvider';
import AlertPopup from '../popup/AlertPopup';
import { isAxiosError } from 'axios';

type FormTypes = {
    username: string;
    password: string;
    passwordConfirm: string;
    nickname: string;
};

interface inputTypes {
    id: number;
    type: string;
    placeholder: string;
    inputText: 'username' | 'password' | 'passwordConfirm' | 'nickname';
}
const RegisterForm = () => {
    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<FormTypes>({
        resolver: getRegisterFormSchema(),
    });

    const router = useRouter();
    const { showPopup, hidePopup } = useContext(PopupContext);

    const inputCss =
        'w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-yellow-400 focus:outline-none';

    const inputList: inputTypes[] = [
        {
            id: 1,
            type: 'text',
            placeholder: 'username을 입력해주세요.',
            inputText: 'username',
        },
        {
            id: 2,
            type: 'password',
            placeholder: '비밀번호를 입력해주세요.',
            inputText: 'password',
        },
        {
            id: 3,
            type: 'password',
            placeholder: '비밀번호를 다시 입력해주세요.',
            inputText: 'passwordConfirm',
        },
        {
            id: 4,
            type: 'text',
            placeholder: 'nickname을 입력해주세요.',
            inputText: 'nickname',
        },
    ];

    const { mutate } = useMutation(userSignUp, {
        onSuccess: () => {
            router.push('/sign-in');
            showPopup(<AlertPopup message={'회원가입에 성공하셨습니다.'} hidePopup={hidePopup} />);
        },
        onError: (error: unknown) => {
            if (isAxiosError<{ message: string }>(error) && error.response?.data) {
                showPopup(<AlertPopup message={error.response.data.message} hidePopup={hidePopup} />);
                return;
            }
            showPopup(<AlertPopup message="회원가입 중 오류가 발생했습니다." hidePopup={hidePopup} />);
        },
    });

    /**
     * handlers
     */
    const handleChange = (field: keyof FormTypes) => (e: ChangeEvent<HTMLInputElement>) => {
        setValue(field, e.target.value, { shouldValidate: true });
    };

    const handleRegister = ({ username, password, nickname }: FormTypes) => {
        const userInfo = {
            serviceId: username.trim().toLowerCase(),
            password,
            nickname: nickname.trim(),
        };
        mutate(userInfo);
    };

    return (
        <div className="p-4">
            <form className="max-w-sm mx-auto" onSubmit={handleSubmit(handleRegister)}>
                <div className="grid gap-y-2 mb-6">
                    {inputList.map((items) => (
                        <React.Fragment key={items.id}>
                            <input
                                className={inputCss}
                                type={items.type}
                                placeholder={items.placeholder}
                                {...register(items.inputText)}
                                onChange={handleChange(items.inputText)}
                            />
                            {errors[items.inputText] && <ValidateMessage result={errors[items.inputText]} />}
                        </React.Fragment>
                    ))}
                </div>
                <button
                    type="submit"
                    className="inline-block px-7 py-3 bg-yellow-400 text-white leading-snug rounded shadow-md hover:bg-yellow-400 hover:shadow-lg focus:bg-yellow-400 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-yellow-400 w-full"
                >
                    회원가입
                </button>
            </form>
        </div>
    );
};
export default React.memo(RegisterForm);
