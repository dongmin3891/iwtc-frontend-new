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
    const readImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const imageFile = e.target.files[0];
        setIsImageLoaded(true);
        const reader = new FileReader();

        reader.addEventListener('load', (e: ProgressEvent<FileReader>) => {
            if (!e || !e.target) return;
            const readerResult = e.target.result;
            setWorldCupContents((prevWorldCupContents) => ({
                ...prevWorldCupContents,
                ...createImageDraftFields(imageFile, readerResult),
                uploadFile: imageFile,
            }));
        });

        reader.readAsDataURL(imageFile);
    };

    return (
        <div className="mb-2">
            <strong>파일</strong>
            <div className="mb-3 w-96">
                <input
                    className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                    type="file"
                    id="formFileMultiple"
                    name="mediaPath"
                    onChange={readImage}
                    accept="image/jpeg,image/png,image/gif"
                />
                {isImageLoaded === true ? (
                    <div style={{ marginTop: '10px' }}>
                        {mp4Type && (
                            <video
                                ref={fowardVideoRef}
                                src={mp4Type}
                                width={'auto'}
                                height={100}
                                autoPlay
                                muted
                                loop
                            ></video>
                        )}

                        {imgType && <img ref={fowardImgRef} src={imgType} width={'auto'} height={100} alt="img" />}
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};

export default ImageTypeLayout;
