interface MediaAttributionProps {
    sourceProvider?: string | null;
    sourceUrl?: string | null;
    sourceAuthor?: string | null;
    sourceAuthorUrl?: string | null;
}

const MediaAttribution = ({ sourceProvider, sourceUrl, sourceAuthor, sourceAuthorUrl }: MediaAttributionProps) => {
    if (sourceProvider !== 'PEXELS' || !sourceAuthor || !sourceUrl) {
        return null;
    }

    return (
        <div className="absolute bottom-2 right-2 z-20 rounded-md bg-black/70 px-2 py-1 text-[10px] font-medium text-white sm:text-xs">
            <span>Photo by </span>
            {sourceAuthorUrl ? (
                <a
                    href={sourceAuthorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-white"
                    onClick={(event) => event.stopPropagation()}
                >
                    {sourceAuthor}
                </a>
            ) : (
                <span>{sourceAuthor}</span>
            )}
            <span> on </span>
            <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white"
                onClick={(event) => event.stopPropagation()}
            >
                Pexels
            </a>
        </div>
    );
};

export default MediaAttribution;
