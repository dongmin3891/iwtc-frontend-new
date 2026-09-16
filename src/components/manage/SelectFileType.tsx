import React from 'react';

interface IProps {
    mediaFileType: string;
    handleMediaFileType: (fileType: string) => void;
}

const SelectFileType = ({ mediaFileType, handleMediaFileType }: IProps) => {
    const options = [
        {
            value: 'file',
            eyebrow: 'IMAGE',
            title: '이미지 파일',
            description: 'JPEG, PNG, GIF · 최대 10MB',
            icon: '▧',
        },
        {
            value: 'video',
            eyebrow: 'YOUTUBE',
            title: 'YouTube 영상',
            description: '영상 주소와 재생 구간 설정',
            icon: '▶',
        },
    ];

    return (
        <div>
            <div>
                <span className="text-[11px] font-black tracking-[0.14em] text-sky-200">NEW CANDIDATE</span>
                <h3 className="mt-2 text-lg font-black tracking-[-0.02em] text-white">후보 미디어 선택</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">후보를 가장 잘 보여주는 이미지나 영상을 선택하세요.</p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {options.map((option) => {
                    const isSelected = mediaFileType === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={isSelected}
                            className={`group flex min-h-[104px] items-center gap-4 rounded-2xl border p-4 text-left transition ${
                                isSelected
                                    ? 'border-violet-300/45 bg-violet-400/10 ring-4 ring-violet-400/[0.06]'
                                    : 'border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]'
                            }`}
                            onClick={() => handleMediaFileType(option.value)}
                        >
                            <span
                                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg font-black ${
                                    isSelected ? 'bg-violet-400/20 text-violet-100' : 'bg-white/[0.06] text-slate-500'
                                }`}
                                aria-hidden="true"
                            >
                                {option.icon}
                            </span>
                            <span className="min-w-0">
                                <span className="block text-[9px] font-black tracking-[0.14em] text-slate-600">{option.eyebrow}</span>
                                <span className="mt-1 block text-sm font-bold text-slate-200">{option.title}</span>
                                <span className="mt-1 block text-[11px] leading-4 text-slate-500">{option.description}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SelectFileType;
