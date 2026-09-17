'use client';

import React, { ChangeEvent, FormEvent, useContext, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { createWorldCup, ManagedWorldCupSummary, updateMyWorldCup } from '@/services/ManageWorldCupService';
import { getAccessToken } from '@/utils/TokenManager';
import { PopupContext } from '@/providers/PopupProvider';
import AlertPopup from '../popup/AlertPopup';

interface IProps {
    setIsCreateWorldCup: (isCreated: boolean) => void;
    setWorldCupId: (worldCupId: number) => void;
    worldCupId?: number;
    myWorldCupData?: Pick<ManagedWorldCupSummary, 'title' | 'description' | 'visibleType'>;
    isCreateWorldCup: boolean;
}

interface ManageWorldCupErrorResponse {
    errorCode: number;
    message: string;
}

type FieldErrors = Partial<Record<'title' | 'description' | 'visibleType', string>>;

const WorldCupManageForm = ({
    setIsCreateWorldCup,
    setWorldCupId,
    worldCupId,
    myWorldCupData,
    isCreateWorldCup,
}: IProps) => {
    const { showPopup, hidePopup } = useContext(PopupContext);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [worldCupInfo, setWorldCupInfo] = useState({
        title: myWorldCupData?.title ?? '',
        description: myWorldCupData?.description ?? '',
        visibleType: myWorldCupData?.visibleType ?? 'PUBLIC',
    });
    const isEditMode = Boolean(myWorldCupData && worldCupId);

    useEffect(() => {
        if (myWorldCupData) {
            setWorldCupInfo({
                title: myWorldCupData.title,
                description: myWorldCupData.description,
                visibleType: myWorldCupData.visibleType,
            });
        }
    }, [myWorldCupData]);

    const showAlertPopup = (message: string) => {
        showPopup(<AlertPopup message={message} hidePopup={hidePopup} />);
    };

    const createGame = useMutation(createWorldCup, {
        onSuccess: (data) => {
            setWorldCupId(data.data);
            setIsCreateWorldCup(true);
        },
        onError: (error: unknown) => {
            if (isAxiosError<ManageWorldCupErrorResponse>(error) && error.response?.data.message) {
                showAlertPopup(error.response.data.message);
                return;
            }
            showAlertPopup('월드컵을 만드는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        },
    });

    const updateGame = useMutation(updateMyWorldCup, {
        onSuccess: () => {
            showAlertPopup('월드컵 기본 정보를 저장했습니다.');
        },
        onError: (error: unknown) => {
            if (isAxiosError<ManageWorldCupErrorResponse>(error) && error.response?.data.message) {
                showAlertPopup(error.response.data.message);
                return;
            }
            showAlertPopup('월드컵 기본 정보를 저장하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        },
    });

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setWorldCupInfo((current) => ({
            ...current,
            [name]: value,
        }));
        setFieldErrors((current) => ({
            ...current,
            [name]: undefined,
        }));
    };

    const validate = () => {
        const nextErrors: FieldErrors = {};
        const title = worldCupInfo.title.trim();
        const description = worldCupInfo.description.trim();

        if (!title) {
            nextErrors.title = '월드컵 제목을 입력해주세요.';
        }
        if (!description || description.length > 100) {
            nextErrors.description = '설명은 1자 이상 100자 이하로 입력해주세요.';
        }
        if (!['PUBLIC', 'PRIVATE'].includes(worldCupInfo.visibleType)) {
            nextErrors.visibleType = '공개 여부를 선택해주세요.';
        }

        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmitWorldCup = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate() || createGame.isLoading || updateGame.isLoading) {
            return;
        }

        const payload = {
            title: worldCupInfo.title.trim(),
            description: worldCupInfo.description.trim(),
            visibleType: worldCupInfo.visibleType,
            token: getAccessToken(),
        };

        if (isEditMode && worldCupId) {
            updateGame.mutate({
                worldCupId,
                ...payload,
            });
            return;
        }

        if (isCreateWorldCup) {
            return;
        }

        createGame.mutate(payload);
    };

    const isSaving = createGame.isLoading || updateGame.isLoading;
    const isDisabled = isSaving || (isCreateWorldCup && !isEditMode);

    return (
        <section className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <span className="text-[11px] font-black tracking-[0.16em] text-violet-200">STEP 01</span>
                    <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">월드컵 기본 정보</h2>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                        {isEditMode
                            ? '게임의 제목, 설명과 공개 범위를 수정한 뒤 별도로 저장하세요.'
                            : '후보를 추가하기 전에 게임의 주제와 공개 범위를 정해주세요.'}
                    </p>
                </div>
                <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold ${
                        isCreateWorldCup
                            ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
                            : 'border-white/10 bg-white/[0.05] text-slate-400'
                    }`}
                >
                    {isEditMode ? '수정 가능' : isCreateWorldCup ? '저장 완료' : '작성 중'}
                </span>
            </div>

            <form className="mt-7 space-y-6" onSubmit={handleSubmitWorldCup} noValidate>
                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="text-xs font-bold text-slate-300" htmlFor="title">
                            월드컵 제목
                        </label>
                        <span className="text-[11px] font-semibold text-slate-600">필수</span>
                    </div>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={worldCupInfo.title}
                        onChange={handleChange}
                        disabled={isDisabled}
                        placeholder="예: 최고의 여름 휴가지 월드컵"
                        aria-invalid={Boolean(fieldErrors.title)}
                        aria-describedby={fieldErrors.title ? 'title-error' : 'title-help'}
                        className={`h-12 w-full rounded-2xl border bg-slate-950/45 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                            fieldErrors.title
                                ? 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-400/10'
                                : 'border-white/10 focus:border-violet-300/50 focus:ring-violet-400/10'
                        }`}
                    />
                    {fieldErrors.title ? (
                        <p id="title-error" className="mt-2 text-xs font-semibold text-rose-300">
                            {fieldErrors.title}
                        </p>
                    ) : (
                        <p id="title-help" className="mt-2 text-[11px] leading-4 text-slate-600">
                            무엇을 비교하는 월드컵인지 한눈에 알 수 있게 작성하세요.
                        </p>
                    )}
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="text-xs font-bold text-slate-300" htmlFor="description">
                            설명
                        </label>
                        <span className="text-[11px] font-semibold text-slate-600">{worldCupInfo.description.length}/100</span>
                    </div>
                    <textarea
                        id="description"
                        name="description"
                        value={worldCupInfo.description}
                        onChange={handleChange}
                        disabled={isDisabled}
                        maxLength={100}
                        rows={4}
                        placeholder="플레이어가 이해하기 쉽도록 월드컵을 소개해주세요."
                        aria-invalid={Boolean(fieldErrors.description)}
                        aria-describedby={fieldErrors.description ? 'description-error' : 'description-help'}
                        className={`w-full resize-none rounded-2xl border bg-slate-950/45 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                            fieldErrors.description
                                ? 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-400/10'
                                : 'border-white/10 focus:border-violet-300/50 focus:ring-violet-400/10'
                        }`}
                    />
                    {fieldErrors.description ? (
                        <p id="description-error" className="mt-2 text-xs font-semibold text-rose-300">
                            {fieldErrors.description}
                        </p>
                    ) : (
                        <p id="description-help" className="mt-2 text-[11px] leading-4 text-slate-600">
                            목록과 게임 시작 화면에 표시되는 소개 문구예요.
                        </p>
                    )}
                </div>

                <fieldset disabled={isDisabled}>
                    <legend className="text-xs font-bold text-slate-300">공개 여부</legend>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        {[
                            { value: 'PUBLIC', label: '공개', description: '누구나 찾아서 플레이' },
                            { value: 'PRIVATE', label: '비공개', description: '목록에 노출하지 않음' },
                        ].map((option) => {
                            const isSelected = worldCupInfo.visibleType === option.value;
                            return (
                                <label
                                    key={option.value}
                                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                                        isSelected
                                            ? 'border-violet-300/45 bg-violet-400/10 ring-4 ring-violet-400/[0.06]'
                                            : 'border-white/10 bg-slate-950/30 hover:border-white/20'
                                    } ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="visibleType"
                                            value={option.value}
                                            onChange={handleChange}
                                            checked={isSelected}
                                            className="h-4 w-4 accent-violet-500"
                                        />
                                        <span className="text-sm font-bold text-white">{option.label}</span>
                                    </span>
                                    <span className="mt-2 block pl-6 text-[11px] leading-4 text-slate-500">{option.description}</span>
                                </label>
                            );
                        })}
                    </div>
                    {fieldErrors.visibleType && (
                        <p className="mt-2 text-xs font-semibold text-rose-300">{fieldErrors.visibleType}</p>
                    )}
                </fieldset>

                {isEditMode ? (
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 text-sm font-black text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-400 disabled:cursor-wait disabled:opacity-60"
                    >
                        {updateGame.isLoading && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        )}
                        {updateGame.isLoading ? '기본 정보 저장 중' : '기본 정보 저장'}
                    </button>
                ) : isCreateWorldCup ? (
                    <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3" role="status">
                        <p className="text-sm font-bold text-emerald-200">기본 정보를 저장했어요.</p>
                        <p className="mt-1 text-xs leading-5 text-emerald-100/60">이제 오른쪽에서 후보를 추가할 수 있습니다.</p>
                    </div>
                ) : (
                    <button
                        type="submit"
                        disabled={createGame.isLoading}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 text-sm font-black text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-400 disabled:cursor-wait disabled:opacity-60"
                    >
                        {createGame.isLoading && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        )}
                        {createGame.isLoading ? '월드컵 만드는 중' : '기본 정보 저장하고 후보 추가하기'}
                    </button>
                )}
            </form>
        </section>
    );
};

export default WorldCupManageForm;
