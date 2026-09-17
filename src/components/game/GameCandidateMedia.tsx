import CustomYoutubePlayer from '@/components/youtubePlayer/CustomYoutubePlayer';
import { MappedMediaContent } from '@/domain/game/mediaFile';
import { WorldCupGameContent } from '@/interfaces/models/world-cup/WcGameData';
import { isMP4 } from '@/utils/common';
import Image from 'next/image';
import MediaAttribution from './MediaAttribution';

interface GameCandidateMediaProps {
    content: MappedMediaContent<WorldCupGameContent>;
    attributionPosition?: 'left' | 'right';
}

const GameCandidateMedia = ({ content, attributionPosition = 'right' }: GameCandidateMediaProps) => {
    if (content.fileType === 'INTERNET_VIDEO_URL') {
        return (
            <div className="h-full w-full bg-black [&>div]:h-full [&_iframe]:h-full [&_iframe]:w-full">
                <CustomYoutubePlayer
                    videoUrl={content.imgUrl}
                    time={content.internetMovieStartPlayTime}
                    width="100%"
                    height="100%"
                    playDuration={content.videoPlayDuration}
                />
            </div>
        );
    }

    if (isMP4(content.imgUrl)) {
        return (
            <div className="h-full w-full bg-black">
                <video className="h-full w-full object-cover" src={content.imgUrl} autoPlay muted loop playsInline />
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <Image
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                src={content.imgUrl}
                fill
                priority
                sizes="(max-width: 767px) 100vw, 50vw"
                alt={content.name}
            />
            <MediaAttribution
                sourceProvider={content.sourceProvider}
                sourceUrl={content.sourceUrl}
                sourceAuthor={content.sourceAuthor}
                sourceAuthorUrl={content.sourceAuthorUrl}
                position={attributionPosition}
            />
        </div>
    );
};

export default GameCandidateMedia;
