import React, { ChangeEvent } from 'react';
import YoutubePlayer from '../youtubePlayer/YoutubePlayer';

interface IProps {
    mediaPath: string;
    videoStartTime: string;
    videoPlayDuration: string;
    handleCreateWorldCupContents: (event: ChangeEvent<HTMLInputElement>) => void;
}

const YoutubeTypeLayout = ({ mediaPath, videoStartTime, videoPlayDuration, handleCreateWorldCupContents }: IProps) => {
    return (
        <div className="space-y-5">
            <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="candidate-video-url" className="text-xs font-bold text-slate-300">
                        YouTube 영상 주소
                    </label>
                    <span className="text-[11px] font-semibold text-slate-600">HTTPS watch URL</span>
                </div>
                <input
                    id="candidate-video-url"
                    type="url"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300/50 focus:ring-4 focus:ring-violet-400/10"
                    name="mediaPath"
                    value={mediaPath}
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={handleCreateWorldCupContents}
                />
                <p className="mt-2 text-[11px] leading-4 text-slate-600">YouTube의 영상 페이지 주소를 그대로 붙여 넣으세요.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="candidate-video-start" className="mb-2 block text-xs font-bold text-slate-300">
                        시작 시간
                    </label>
                    <input
                        id="candidate-video-start"
                        type="text"
                        inputMode="numeric"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300/50 focus:ring-4 focus:ring-violet-400/10"
                        name="videoStartTime"
                        value={videoStartTime}
                        onChange={handleCreateWorldCupContents}
                        placeholder="00030"
                    />
                    <p className="mt-2 text-[11px] leading-4 text-slate-600">5자리 분·초 형식 · 예: 10분 1초 → 01001</p>
                </div>
                <div>
                    <label htmlFor="candidate-video-duration" className="mb-2 block text-xs font-bold text-slate-300">
                        반복 시간
                    </label>
                    <input
                        id="candidate-video-duration"
                        type="number"
                        min={3}
                        max={5}
                        inputMode="numeric"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300/50 focus:ring-4 focus:ring-violet-400/10"
                        name="videoPlayDuration"
                        value={videoPlayDuration}
                        onChange={handleCreateWorldCupContents}
                        placeholder="3"
                    />
                    <p className="mt-2 text-[11px] leading-4 text-slate-600">3~5초 사이의 정수로 입력하세요.</p>
                </div>
            </div>

            {mediaPath && (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <YoutubePlayer url={mediaPath} componentType="uploadForm" />
                    <p className="border-t border-white/10 px-4 py-3 text-[11px] font-semibold text-slate-500">입력한 YouTube 영상 미리보기</p>
                </div>
            )}
        </div>
    );
};

export default YoutubeTypeLayout;
