import React from 'react';

interface IProps {
    visibleType: string;
    handleVisibleType: (visibleType: string) => void;
}

const SelectVisibleType = ({ visibleType, handleVisibleType }: IProps) => {
    return (
        <fieldset>
            <legend className="text-xs font-bold text-slate-300">후보 공개 여부</legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                    { value: 'PUBLIC', label: '공개', description: '게임 후보로 사용' },
                    { value: 'PRIVATE', label: '비공개', description: '목록에서 제외' },
                ].map((option) => {
                    const isSelected = visibleType === option.value;
                    return (
                        <label
                            key={option.value}
                            className={`cursor-pointer rounded-2xl border p-4 transition ${
                                isSelected
                                    ? 'border-violet-300/45 bg-violet-400/10 ring-4 ring-violet-400/[0.06]'
                                    : 'border-white/10 bg-slate-950/30 hover:border-white/20'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="candidate-visible-type"
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={() => handleVisibleType(option.value)}
                                    className="h-4 w-4 accent-violet-500"
                                />
                                <span className="text-sm font-bold text-white">{option.label}</span>
                            </span>
                            <span className="mt-2 block pl-6 text-[11px] leading-4 text-slate-500">{option.description}</span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
};

export default SelectVisibleType;
