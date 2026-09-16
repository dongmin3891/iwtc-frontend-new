import MyWorldCupList from '@/components/myWorldcup/MyWorldCupList';

const Page = () => {
    return (
        <main className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950 px-5 py-10 text-white sm:px-8 lg:px-10 lg:py-14">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_8%,rgba(124,110,255,0.3),transparent_28%),radial-gradient(circle_at_88%_62%,rgba(14,165,233,0.13),transparent_30%)]" />
            <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:48px_48px]" />

            <div className="mx-auto max-w-7xl">
                <header className="max-w-3xl">
                    <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-black tracking-[0.16em] text-violet-200">
                        MY WORLD CUPS
                    </span>
                    <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-5xl">내 월드컵 관리</h1>
                    <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                        만든 월드컵을 플레이하거나 후보를 편집하고, 더 이상 사용하지 않는 월드컵을 정리할 수 있어요.
                    </p>
                </header>

                <div className="mt-9">
                    <MyWorldCupList />
                </div>
            </div>
        </main>
    );
};

export default Page;
