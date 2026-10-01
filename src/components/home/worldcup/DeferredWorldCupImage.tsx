'use client';

import SmoothImage from '@/components/common/SmoothImage';
import { ImageProps } from 'next/image';
import { useEffect, useRef, useState } from 'react';

const IMAGE_LOAD_ROOT_MARGIN = '200px 0px';

const DeferredWorldCupImage = ({ priority = false, ...props }: ImageProps) => {
    const placeholderRef = useRef<HTMLSpanElement>(null);
    const [shouldRender, setShouldRender] = useState(priority);

    useEffect(() => {
        if (priority || shouldRender) {
            return;
        }

        const placeholder = placeholderRef.current;

        if (!placeholder || !('IntersectionObserver' in window)) {
            setShouldRender(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    return;
                }

                setShouldRender(true);
                observer.disconnect();
            },
            { rootMargin: IMAGE_LOAD_ROOT_MARGIN }
        );

        observer.observe(placeholder);

        return () => observer.disconnect();
    }, [priority, shouldRender]);

    if (!shouldRender) {
        return <span ref={placeholderRef} className="absolute inset-0 bg-slate-100" aria-hidden="true" />;
    }

    return <SmoothImage {...props} priority={priority} />;
};

export default DeferredWorldCupImage;
