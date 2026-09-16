import { ManagedContentDraft } from '@/domain/manage/persistedContent';
import React, { Dispatch, RefObject, SetStateAction } from 'react';
import { createImageDraftFields } from '@/domain/manage/mediaInput';

interface IProps {
    isImageLoaded: boolean;
    setIsImageLoaded: Dispatch<SetStateAction<boolean>>;
    setWorldCupContents: Dispatch<SetStateAction<ManagedContentDraft>>;
    fowardVideoRef: RefObject<HTMLVideoElement>;
    fowardImgRef: RefObject<HTMLImageElement>;
    mp4Type: string;
    imgType: string;
}

const ImageTypeLayout = ({
    isImageLoaded,
    setIsImageLoaded,
    setWorldCupContents,
    fowardVideoRef,
    fowardImgRef,
    mp4Type,
    imgType,
}: IProps) => {
    const readImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;

        const imageFile = event.target.files[0];
        setIsImageLoaded(true);
        const reader = new FileReader();

        reader.addEventListener('load', (loadEvent: ProgressEvent<FileReader>) => {
            if (!loadEvent.target) return;
            const readerResult = loadEvent.target.result;
            setWorldCupContents((current) => ({
                ...current,
                ...createImageDraftFields(imageFile, readerResult),
                uploadFile: imageFile,
            }));
        });

        reader.readAsDataURL(imageFile);
    };

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="candidate-image" className="text-xs font-bold text-slate-300">
                    이미지 파일
                </label>
                <span className="text-[11px] font-semibold text-slate-600">JPEG · PNG · GIF</span>
            </div>
            <label className="block cursor-pointer rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-4 transition hover:border-violet-300/35 hover:bg-violet-400/[0.04]" htmlFor="candidate-image">
                <input
                    className="sr-only"
                    type="file"
                    id="candidate-image"
                    name="mediaPath"
                    onChange={readImage}
                    accept="image/jpeg,image/png,image/gif"
                />
                <span className="flex items-center gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-xl text-slate-400" aria-hidden="true">
                        ↑
                    </span>
                    <span>
                        <span className="block text-sm font-bold text-slate-200">이미지를 선택하거나 다시 선택하세요</span>
                        <span className="mt-1 block text-[11px] leading-4 text-slate-500">10MB 이하의 가로형 이미지를 권장합니다.</span>
                    </span>
                </span>
            </label>

            {isImageLoaded && (mp4Type || imgType) && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <div className="flex aspect-video items-center justify-center">
                        {mp4Type && (
                            <video ref={fowardVideoRef} src={mp4Type} className="h-full w-full object-contain" autoPlay muted loop />
                        )}
                        {imgType && (
                            <img ref={fowardImgRef} src={imgType} className="h-full w-full object-contain" alt="선택한 후보 이미지 미리보기" />
                        )}
                    </div>
                    <p className="border-t border-white/10 px-4 py-3 text-[11px] font-semibold text-slate-500">선택한 이미지 미리보기</p>
                </div>
            )}
        </div>
    );
};

export default ImageTypeLayout;
