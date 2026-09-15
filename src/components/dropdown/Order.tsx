'use client';
import { OrderType } from '@/interfaces/models/tab/OrderTab';
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';

interface IProps {
    setOrder: Dispatch<SetStateAction<string>>;
}

const Order = ({ setOrder }: IProps) => {
    const [selectedOrder, setSelectedOrder] = useState<OrderType>(OrderType.Lastest);

    const handleOrderChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const selected = event.target.value as OrderType;
        setSelectedOrder(selected);
        const valueToSet = selected === OrderType.Lastest ? 'id' : 'views';
        setOrder(valueToSet);
    };

    return (
        <label className="block w-full text-xs font-bold text-slate-500">
            정렬
            <div className="relative mt-2">
                <select
                    className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    value={selectedOrder}
                    onChange={handleOrderChange}
                    aria-label="월드컵 정렬"
                >
                    {Object.values(OrderType).map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 8 4 4 4-4" />
                </svg>
            </div>
        </label>
    );
};

export default Order;
