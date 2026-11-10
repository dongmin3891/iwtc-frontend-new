export const getYoutubeVideoId = (youtubeUrl: string) => {
    try {
        const url = new URL(youtubeUrl.trim());
        const videoId = url.searchParams.get('v');

        if (
            url.protocol !== 'https:' ||
            !['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname.toLowerCase()) ||
            url.pathname !== '/watch' ||
            !videoId ||
            !/^[A-Za-z0-9_-]{1,64}$/.test(videoId)
        ) {
            return undefined;
        }

        return videoId;
    } catch {
        return undefined;
    }
};
