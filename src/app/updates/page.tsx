import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import type { Metadata } from 'next';
import { parseChangelog } from '@/domain/updates/changelog';

export const metadata: Metadata = {
    title: '업데이트 | IWTC',
    description: 'IWTC의 새로운 기능과 주요 변경사항을 확인하세요.',
};

export const dynamic = 'force-static';

const UpdatesPage = async () => {
    const changelog = await readFile(path.join(process.cwd(), 'CHANGELOG.md'), 'utf8');
    const releases = parseChangelog(changelog);
    const latestVersion = releases[0]?.version;

    return (
        <main className="relative isolate min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950 px-5 py-10 text-white sm:px-8 lg:px-10 lg:py-14">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_8%,rgba(124,110,255,0.3),transparent_28%),radial-gradient(circle_at_88%_62%,rgba(14,165,233,0.13),transparent_30%)]" />
            <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:48px_48px]" />

            <div className="mx-auto max-w-4xl">
                <Link href="/" className="text-sm font-bold text-slate-400 transition hover:text-white">
                    <span aria-hidden="true">←</span> 월드컵 목록으로
                </Link>

                <header className="mt-9 border-b border-white/10 pb-10">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-black tracking-[0.16em] text-violet-200">
                            RELEASE NOTES
                        </span>
                        {latestVersion && (
                            <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1.5 text-xs font-bold text-sky-200">
                                CURRENT v{latestVersion}
                            </span>
                        )}
                    </div>
                    <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-6xl">IWTC 업데이트</h1>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                        새로운 기능과 사용 경험의 주요 변경사항을 버전별로 정리합니다.
                    </p>
                </header>

                <div className="mt-10 space-y-8">
                    {releases.map((release, releaseIndex) => (
                        <article
                            key={release.version}
                            className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20"
                        >
                            <header className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-sky-400/5 px-6 py-6 sm:px-8">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                                        v{release.version}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        {releaseIndex === 0 && (
                                            <span className="rounded-full bg-violet-500 px-3 py-1 text-[11px] font-black text-white">
                                                LATEST
                                            </span>
                                        )}
                                        <time dateTime={release.date} className="text-xs font-bold text-slate-400">
                                            {release.date}
                                        </time>
                                    </div>
                                </div>
                                {release.summary && (
                                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{release.summary}</p>
                                )}
                            </header>

                            <div className="grid gap-7 px-6 py-7 sm:px-8 lg:grid-cols-2">
                                {release.sections.map((section) => (
                                    <section key={section.title}>
                                        <h3 className="text-xs font-black tracking-[0.16em] text-violet-200">
                                            {section.title}
                                        </h3>
                                        <ul className="mt-4 space-y-3">
                                            {section.items.map((item) => (
                                                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" aria-hidden="true" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default UpdatesPage;
