'use client';

import { useEffect, useState } from 'react';
import { parsePublicTrafficStats, PublicTrafficStats } from './trafficStats';

const visitNumberFormatter = new Intl.NumberFormat('ko-KR');

const TrafficSummary = () => {
    const [trafficStats, setTrafficStats] = useState<PublicTrafficStats>();

    useEffect(() => {
        const controller = new AbortController();

        const loadTrafficStats = async () => {
            try {
                const response = await fetch('/api/traffic', { signal: controller.signal });
                if (!response.ok) throw new Error('Traffic is unavailable');

                setTrafficStats(parsePublicTrafficStats(await response.json()));
            } catch {
                if (controller.signal.aborted) return;
                setTrafficStats({ status: 'unavailable', checkedAt: new Date().toISOString() });
            }
        };

        void loadTrafficStats();

        return () => controller.abort();
    }, []);

    if (trafficStats?.status === 'unavailable') {
        return <div className="h-[106px]" aria-hidden="true" />;
    }

    if (!trafficStats) {
        return (
            <div
                className="grid h-[106px] grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-4"
                aria-label="방문 통계를 불러오는 중입니다"
            >
                <span className="animate-pulse rounded-2xl bg-white/10" />
                <span className="animate-pulse rounded-2xl bg-white/10" />
            </div>
        );
    }

    return (
        <div
            className="h-[106px] rounded-3xl border border-white/15 bg-white/[0.08] px-5 py-4 shadow-lg shadow-black/10 backdrop-blur"
            aria-live="polite"
        >
            <dl className="grid grid-cols-2 gap-5">
                <div>
                    <dt className="text-xs font-semibold text-slate-400">오늘 방문</dt>
                    <dd className="mt-1 text-xl font-black tabular-nums text-white">
                        {visitNumberFormatter.format(trafficStats.todayVisits)}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs font-semibold text-slate-400">최근 7일 방문</dt>
                    <dd className="mt-1 text-xl font-black tabular-nums text-white">
                        {visitNumberFormatter.format(trafficStats.lastSevenDaysVisits)}
                    </dd>
                </div>
            </dl>
            <p className="mt-2 text-[10px] font-medium text-slate-500">Cloudflare visits · 10분 단위 갱신</p>
        </div>
    );
};

export default TrafficSummary;
