interface MediaAttributionProps {
    sourceProvider?: string | null;
    sourceUrl?: string | null;
    sourceAuthor?: string | null;
    sourceAuthorUrl?: string | null;
    position?: 'left' | 'right';
    variant?: 'overlay' | 'inline';
    className?: string;
}

const MediaAttribution = ({
    sourceProvider,
    sourceUrl,
    sourceAuthor,
    sourceAuthorUrl,
    position = 'right',
    variant = 'overlay',
    className = '',
}: MediaAttributionProps) => {
    if (sourceProvider !== 'PEXELS' || !sourceAuthor || !sourceUrl) {
        return null;
    }

    const layoutClass =
        variant === 'inline'
            ? 'relative z-20 inline-block w-fit rounded bg-black/75 px-1.5 py-0.5 text-[9px] leading-4'
            : position === 'left'
              ? 'absolute bottom-2 left-2 z-20 max-w-[calc(100%-1rem)] break-words rounded-md bg-black/70 px-2 py-1 text-left text-[10px] leading-tight sm:text-xs'
              : 'absolute bottom-2 right-2 z-20 max-w-[calc(100%-1rem)] break-words rounded-md bg-black/70 px-2 py-1 text-right text-[10px] leading-tight sm:text-xs';

    return (
        <div className={`${layoutClass} font-medium text-white ${className}`}>
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
