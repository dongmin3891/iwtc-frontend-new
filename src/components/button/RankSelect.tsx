'use client';
import { TimeTab } from '@/interfaces/models/tab/TimeTab';
import React, { Dispatch, SetStateAction, useState } from 'react';

const TIME_FILTERS: TimeTab[] = [
    { id: 1, name: '전체', active: true, type: 'ALL' },
    { id: 2, name: '년', active: false, type: 'YEAR' },
    { id: 3, name: '월', active: false, type: 'MONTH' },
    { id: 4, name: '일', active: false, type: 'DAY' },
];

interface IProps {
    setRank: Dispatch<SetStateAction<string>>;
}

const RankSelect = ({ setRank }: IProps) => {
    const [selectedRank, setSelectedRank] = useState<TimeTab['type']>('ALL');

    const handleTab = (list: TimeTab): void => {
        setRank(list.type);
        setSelectedRank(list.type);
    };

    return (
        <fieldset className="w-full">
            <legend className="mb-2 text-xs font-bold text-slate-500">등록 기간</legend>
            <div className="grid h-12 grid-cols-4 rounded-2xl bg-slate-100 p-1">
                {TIME_FILTERS.map((filter) => {
                    const isActive = filter.type === selectedRank;

                    return (
                        <button
                            type="button"
                            key={filter.id}
                            className={`rounded-xl px-3 text-sm font-bold transition ${
                                isActive
                                    ? 'bg-white text-violet-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                            aria-pressed={isActive}
                            onClick={() => handleTab(filter)}
                        >
                            {filter.name}
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
};

export default RankSelect;
