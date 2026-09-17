const PexelsCreditFooter = () => {
    return (
        <footer className="border-t border-slate-800 bg-slate-950 px-5 py-5 text-slate-300 sm:px-8 lg:px-10">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-500">IWTC의 일부 월드컵에는 Pexels 사진이 사용됩니다.</p>
                <a
                    href="https://www.pexels.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-300/70"
                >
                    Photos provided by Pexels
                    <span aria-hidden="true">↗</span>
                </a>
            </div>
        </footer>
    );
};

export default PexelsCreditFooter;
