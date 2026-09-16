import React from 'react';

const NotCreateWorldCupLogo = () => {
    return (
        <div className="grid min-h-[300px] place-items-center rounded-3xl border border-dashed border-white/10 bg-slate-950/25 px-6 py-12 text-center">
            <div className="max-w-sm">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.06] text-2xl" aria-hidden="true">
                    +
                </span>
                <h3 className="mt-5 text-base font-black text-slate-300">기본 정보를 먼저 저장해주세요</h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                    왼쪽의 제목과 설명을 입력하면 후보를 추가하는 편집 공간이 열립니다.
                </p>
            </div>
        </div>
    );
};

export default NotCreateWorldCupLogo;
