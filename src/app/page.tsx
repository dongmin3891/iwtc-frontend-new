import HydratedWCList from '@/components/home/HydratedWCList';
import TrafficSummary from '@/features/traffic/TrafficSummary';

const Home = () => {
    return (
        <main className="pb-24">
            <section className="relative isolate overflow-hidden border-b border-slate-200/80 bg-slate-950">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(124,110,255,0.42),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(30,197,255,0.2),transparent_28%)]" />
                <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-24">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-violet-100">
                            PICK YOUR FAVORITE
                        </span>
                        <h1 className="mt-6 text-balance text-4xl font-black leading-tight tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                            고민은 짧게,
                            <br />
                            취향은 확실하게.
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                            마음에 드는 월드컵을 골라 바로 시작하세요. 마지막 선택까지 가는 동안 내 취향이
                            선명해집니다.
                        </p>
                    </div>
                    <div className="flex w-full max-w-sm flex-col gap-4 lg:w-80">
                        <TrafficSummary />
                        <a
                            href="#world-cups"
                            className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-violet-50"
                        >
                            월드컵 둘러보기
                            <span aria-hidden="true">↓</span>
                        </a>
                    </div>
                </div>
            </section>
            <HydratedWCList />
        </main>
    );
};
export default Home;
