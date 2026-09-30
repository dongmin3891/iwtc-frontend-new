'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

const getImageSourceKey = (src: ImageProps['src']) => {
    if (typeof src === 'string') {
        return src;
    }

    return 'src' in src ? src.src : src.default.src;
};

const SmoothImage = ({ alt, className = '', onLoad, src, ...props }: ImageProps) => {
    const sourceKey = getImageSourceKey(src);
    const [loadedSource, setLoadedSource] = useState<string>();
    const isLoaded = loadedSource === sourceKey;

    return (
        <Image
            {...props}
            alt={alt}
            src={src}
            className={`transition-[opacity,filter,transform] duration-200 ease-out motion-reduce:transition-none ${
                isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-[2px]'
            } ${className}`}
            onLoad={(event) => {
                setLoadedSource(sourceKey);
                onLoad?.(event);
            }}
        />
    );
};

export default SmoothImage;
