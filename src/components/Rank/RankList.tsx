import React from 'react';
import Image from 'next/image';
import CustomYoutubePlayer from '../youtubePlayer/CustomYoutubePlayer';
import { isMP4 } from '@/utils/common';

interface IProps {
    contentsName: string;
    rank: number;
    imgUrl: string;
    fileType?: string;
    videoStartTime?: string;
    videoPlayDuration?: number;
    gameScore: number;
}

const RankList = ({ contentsName, rank, imgUrl, fileType, videoStartTime, videoPlayDuration, gameScore }: IProps) => {
    return (
        <li className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-950/35 p-3 sm:p-4">
            <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ${
                    rank === 1 ? 'bg-amber-300 text-amber-950' : 'bg-white/10 text-slate-200'
                }`}
            >
                {rank}
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-white">{contentsName}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">누적 {gameScore.toLocaleString()}점</p>
            </div>
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-black sm:h-20 sm:w-28">
                {fileType === 'INTERNET_VIDEO_URL' ? (
                    <div className="h-full w-full [&>div]:h-full [&_iframe]:h-full [&_iframe]:w-full">
                        <CustomYoutubePlayer
                            videoUrl={imgUrl}
                            time={videoStartTime}
                            width="100%"
                            height="100%"
                            isAutoPlay={false}
                            playDuration={videoPlayDuration}
                        />
                    </div>
                ) : isMP4(imgUrl) ? (
                    <video className="h-full w-full object-cover" src={imgUrl} muted />
                ) : (
                    <Image
                        className="object-cover"
                        src={imgUrl}
                        fill
                        priority={rank === 1}
                        sizes="112px"
                        alt={contentsName}
                    />
                )}
            </div>
        </li>
    );
};

export default RankList;
