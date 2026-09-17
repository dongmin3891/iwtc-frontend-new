import CustomYoutubePlayer from '@/components/youtubePlayer/CustomYoutubePlayer';
import { isMP4 } from '@/utils/common';
import Image from 'next/image';
import Link from 'next/link';
import { WCListViewData } from '@/interfaces/models/world-cup/WcListData';
import MediaAttribution from '@/components/game/MediaAttribution';

interface WorldCupListProps {
    wcList: WCListViewData;
    priority?: boolean;
}

const WorldCupList = ({ wcList, priority = false }: WorldCupListProps) => {
    const {
        gameTitle,
        reftContentName,
        reftImgMediaFileNo,
        reftFileType,
        reftVideoPlayDuration,
        reftVideoStartTime,
        reftSourceProvider,
        reftSourceUrl,
        reftSourceAuthor,
        reftSourceAuthorUrl,
        rightContentName,
        rightImgMediaFileNo,
        rightFileType,
        rightVideoPlayDuration,
        rightVideoStartTime,
        rightSourceProvider,
        rightSourceUrl,
        rightSourceAuthor,
        rightSourceAuthorUrl,
        description,
        worldCupId,
    } = wcList;

    const renderPreview = (
        fileType: string,
        mediaSource: string,
        contentName: string,
        videoStartTime?: string,
        videoPlayDuration?: number
    ) => {
        if (fileType === 'INTERNET_VIDEO_URL') {
            return (
                <div className="h-full w-full [&_iframe]:pointer-events-none [&_iframe]:h-full [&_iframe]:w-full">
                    <CustomYoutubePlayer
                        videoUrl={mediaSource}
                        time={videoStartTime}
                        width="100%"
                        height="100%"
                        playDuration={videoPlayDuration}
                    />
                </div>
            );
        }

        if (isMP4(mediaSource)) {
            return <video className="h-full w-full object-cover" src={mediaSource} autoPlay muted loop playsInline />;
        }

        return (
            <Image
                className="object-cover transition duration-500 group-hover:scale-105"
                src={mediaSource}
                fill
                priority={priority}
                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 200px"
                alt={contentName || '후보 이미지'}
            />
        );
    };

    return (
        <article className="group relative min-w-0 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1.5 hover:border-violet-200 hover:shadow-[0_20px_45px_rgba(79,70,229,0.14)]">
            <Link
                href={`/play-game/${worldCupId}`}
                aria-label={`${gameTitle} 월드컵 시작하기`}
                className="absolute inset-0 z-10 rounded-[28px] focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-400/40"
            />
            <div className="relative grid aspect-[16/10] grid-cols-2 overflow-hidden bg-slate-100">
                <div className="relative min-w-0 overflow-hidden border-r border-white/30">
                    {renderPreview(
                        reftFileType,
                        reftImgMediaFileNo,
                        reftContentName,
                        reftVideoStartTime,
                        reftVideoPlayDuration
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 pb-3 pt-10">
                        <div className="mb-1 flex justify-end">
                            <MediaAttribution
                                sourceProvider={reftSourceProvider}
                                sourceUrl={reftSourceUrl}
                                sourceAuthor={reftSourceAuthor}
                                sourceAuthorUrl={reftSourceAuthorUrl}
                                variant="inline"
                                className="max-w-full truncate"
                            />
                        </div>
                        <p className="truncate text-sm font-bold text-white">{reftContentName || '후보 준비 중'}</p>
                    </div>
                </div>
                <div className="relative min-w-0 overflow-hidden">
                    {renderPreview(
                        rightFileType,
                        rightImgMediaFileNo,
                        rightContentName,
                        rightVideoStartTime,
                        rightVideoPlayDuration
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 pb-3 pt-10 text-right">
                        <div className="mb-1 flex justify-start">
                            <MediaAttribution
                                sourceProvider={rightSourceProvider}
                                sourceUrl={rightSourceUrl}
                                sourceAuthor={rightSourceAuthor}
                                sourceAuthorUrl={rightSourceAuthorUrl}
                                variant="inline"
                                className="max-w-full truncate"
                            />
                        </div>
                        <p className="truncate text-sm font-bold text-white">
                            {rightContentName || '후보 준비 중'}
                        </p>
                    </div>
                </div>
                <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-slate-950 text-[11px] font-black italic tracking-tight text-white shadow-xl">
                    VS
                </span>
            </div>

            <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h3 className="truncate text-xl font-black tracking-[-0.025em] text-slate-950">
                            {gameTitle}
                        </h3>
                        <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                            {description || '어떤 후보가 마지막까지 살아남을까요?'}
                        </p>
                    </div>
                    <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-50 text-lg text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
                        →
                    </span>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[11px] font-black tracking-[0.14em] text-violet-600">START GAME</span>
                    <span className="text-xs font-semibold text-slate-400">클릭해서 시작</span>
                </div>
            </div>
        </article>
    );
};

export default WorldCupList;
