const PEXELS_HOSTS = new Set(['pexels.com', 'www.pexels.com']);

export const getSafePexelsUrl = (value?: string | null): string | undefined => {
    if (!value) {
        return undefined;
    }

    try {
        const url = new URL(value);
        if (url.protocol !== 'https:' || !PEXELS_HOSTS.has(url.hostname.toLowerCase())) {
            return undefined;
        }
        return url.toString();
    } catch {
        return undefined;
    }
};
