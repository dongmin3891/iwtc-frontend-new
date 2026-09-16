import { getYoutubeVideoId } from '@/utils/youtube';

interface IProps {
    url?: string;
    componentType: 'uploadForm' | 'uploadList';
}

const YoutubePlayer = ({ url, componentType }: IProps) => {
    const videoId = getYoutubeVideoId(url || '');
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return (
        <div className={componentType === 'uploadForm' ? 'aspect-video w-full' : 'aspect-video w-full max-w-[400px]'}>
            <iframe
                className="h-full w-full"
                src={embedUrl}
                title="YouTube 영상 미리보기"
                allowFullScreen
            />
        </div>
    );
};

export default YoutubePlayer;
