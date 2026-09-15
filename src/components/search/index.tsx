'use client';
import React, { ChangeEvent, Dispatch, FormEvent, SetStateAction, useState } from 'react';

interface IProps {
    setKeyword: Dispatch<SetStateAction<undefined | string>>;
}

const SearchBar = ({ setKeyword }: IProps) => {
    const [text, setText] = useState('');

    const onChangeKeyword = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setText(value);
    };

    const onClickSearch = () => {
        setKeyword(text.trim() || undefined);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onClickSearch();
    };

    return (
        <form className="w-full" onSubmit={handleSubmit}>
            <label htmlFor="world-cup-search" className="mb-2 block text-xs font-bold text-slate-500">
                월드컵 검색
            </label>
            <div className="relative">
                <input
                    type="search"
                    id="world-cup-search"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    placeholder="제목이나 키워드를 검색하세요"
                    onChange={onChangeKeyword}
                    value={text}
                />
                <button
                    type="submit"
                    className="absolute inset-y-1.5 right-1.5 grid w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
                    aria-label="검색"
                >
                    <svg
                        className="h-4 w-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />
                    </svg>
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
