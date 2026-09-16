import { ManagedContent, PersistedManagedContentView } from '@/domain/manage/persistedContent';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';

interface IProps {
    contents: ManagedContent | '';
    index: number;
    setWorldCupContentsList: Dispatch<SetStateAction<ManagedContent[]>>;
    setModifyList?: Dispatch<SetStateAction<PersistedManagedContentView[]>>;
    setDeleteList?: Dispatch<SetStateAction<PersistedManagedContentView[]>>;
    setNewList?: Dispatch<SetStateAction<ManagedContent[]>>;
    newList: ManagedContent[];
}

interface StaticMediaContentState {
    contentsId?: number;
    contentsName: string;
    originalName?: string;
    visibleType: string;
    mediaData: string;
    videoStartTime?: string;
    videoPlayDuration?: number | string;
    imgType?: string | boolean;
    mp4Type?: string | boolean;
    detailFileType?: string;
    mediaFileId?: number;
    uploadFile?: File;
}

const createStaticMediaContentState = (contents: ManagedContent | ''): StaticMediaContentState => ({
    contentsId: contents ? contents.contentsId : undefined,
    contentsName: contents ? contents.contentsName : '',
    originalName: contents ? contents.originalName : undefined,
    visibleType: contents ? contents.visibleType : '',
    mediaData: contents ? contents.mediaData || '' : '',
    videoStartTime: contents ? contents.videoStartTime : undefined,
    videoPlayDuration: contents ? contents.videoPlayDuration : undefined,
    imgType: contents ? contents.imgType : undefined,
    mp4Type: contents ? contents.mp4Type : undefined,
    detailFileType: contents ? contents.detailFileType : undefined,
    mediaFileId: contents ? contents.mediaFileId : undefined,
    uploadFile: contents ? contents.uploadFile : undefined,
});

const hasPersistedContentId = (contents: ManagedContent): contents is PersistedManagedContentView =>
    Boolean(contents.contentsId);

const StaticMediaFileTypeCard = ({
    contents,
    index,
    setWorldCupContentsList,
    setModifyList,
    setDeleteList,
    setNewList,
    newList,
}: IProps) => {
    const [mediaData, setMediaData] = useState<StaticMediaContentState>(() => createStaticMediaContentState(contents));
    const [isUpdateMode, setIsUpdateMode] = useState(false);

    useEffect(() => {
        setMediaData(createStaticMediaContentState(contents));
    }, [contents]);

    const handleMediaData = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setMediaData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const removeContents = () => {
        const deleteResult: { content?: ManagedContent } = {};

        setWorldCupContentsList((current) => {
            const foundContent = current.find((item) => item.id === index);
            if (foundContent) {
                deleteResult.content = { ...foundContent };
            }

            return current
                .filter((item) => item.id !== index)
                .map((item, newIndex) => ({ ...item, id: newIndex }));
        });
        const deleteContent = deleteResult.content;

        if (deleteContent && setNewList && setDeleteList) {
            if (!hasPersistedContentId(deleteContent)) {
                if (newList.length > 0) {
                    setNewList((current) =>
                        current.filter(
                            (item) =>
                                item.contentsName !== deleteContent.contentsName &&
                                item.mediaPath !== deleteContent.mediaPath
                        )
                    );
                }
            } else {
                setDeleteList((current) => [...current, deleteContent]);
            }
        }
    };

    const applyUpdateContents = () => {
        const updateResult: { content?: ManagedContent } = {};

        setWorldCupContentsList((current) =>
            current.map((item) => {
                if (
                    item.id === index &&
                    (item.contentsName !== mediaData.contentsName ||
                        item.mediaData !== mediaData.mediaData ||
                        item.visibleType !== mediaData.visibleType)
                ) {
                    const modifiedContent = {
                        ...item,
                        contentsName: mediaData.contentsName,
                        mediaData: mediaData.mediaData,
                        imgType: mediaData.mediaData,
                        originalName: mediaData.originalName,
                        visibleType: mediaData.visibleType,
                        detailFileType: mediaData.detailFileType,
                        uploadFile: mediaData.uploadFile,
                    };
                    updateResult.content = modifiedContent;
                    return modifiedContent;
                }
                return item;
            })
        );
        const modifiedContent = updateResult.content;

        if (modifiedContent && setNewList && setModifyList) {
            if (!hasPersistedContentId(modifiedContent)) {
                if (newList.length) {
                    setNewList((current) =>
                        current.map((item) =>
                            item.absoluteName === modifiedContent.absoluteName ? modifiedContent : item
                        )
                    );
                }
            } else {
                setModifyList((current) => {
                    const existingIndex = current.findIndex(
                        (item) => item.contentsId === modifiedContent.contentsId
                    );
                    if (existingIndex !== -1) {
                        return current.map((item, itemIndex) =>
                            itemIndex === existingIndex ? modifiedContent : item
                        );
                    }
                    return [...current, modifiedContent];
                });
            }
        }

        setIsUpdateMode(false);
    };

    const cancelUpdateContents = () => {
        setMediaData(createStaticMediaContentState(contents));
        setIsUpdateMode(false);
    };

    const changeImage = (event: ChangeEvent<HTMLInputElement>) => {
        const imageFile = event.target.files?.[0];
        if (!imageFile) return;

        const reader = new FileReader();
        reader.addEventListener('load', (loadEvent: ProgressEvent<FileReader>) => {
            const nextMediaData = loadEvent.target?.result;
            if (typeof nextMediaData !== 'string') return;

            setMediaData((current) => ({
                ...current,
                mediaData: nextMediaData,
                imgType: nextMediaData,
            }));
        });
        reader.readAsDataURL(imageFile);

        setMediaData((current) => ({
            ...current,
            originalName: imageFile.name,
            detailFileType: imageFile.type.replace('image/', '').toUpperCase(),
            uploadFile: imageFile,
        }));
    };

    const inputClassName =
        'h-11 w-full rounded-xl border border-white/10 bg-slate-950/55 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300/50 focus:ring-4 focus:ring-violet-400/10';

    return (
        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/10">
            <div className="grid gap-0 md:grid-cols-[240px_minmax(0,1fr)]">
                <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden bg-black/35 md:min-h-full">
                    {mediaData.mp4Type ? (
                        <video src={mediaData.mediaData} className="h-full min-h-[190px] w-full object-cover" autoPlay muted loop />
                    ) : mediaData.mediaData ? (
                        <img
                            className="h-full min-h-[190px] w-full object-cover"
                            src={mediaData.mediaData}
                            alt={`${mediaData.contentsName || '후보'} 이미지`}
                        />
                    ) : (
                        <span className="text-xs font-semibold text-slate-600">미리보기 없음</span>
                    )}
                    <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[10px] font-black tracking-[0.12em] text-slate-200 backdrop-blur">
                        IMAGE
                    </span>
                </div>

                <div className="flex min-w-0 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[10px] font-black tracking-[0.14em] text-slate-600">CANDIDATE {String(index + 1).padStart(2, '0')}</p>
                            {!isUpdateMode ? (
                                <h4 className="mt-2 truncate text-lg font-black text-white">{mediaData.contentsName}</h4>
                            ) : (
                                <div className="mt-3">
                                    <label htmlFor={`image-candidate-name-${index}`} className="mb-2 block text-xs font-bold text-slate-300">
                                        후보 이름
                                    </label>
                                    <input
                                        id={`image-candidate-name-${index}`}
                                        type="text"
                                        className={inputClassName}
                                        placeholder="후보 이름"
                                        name="contentsName"
                                        onChange={handleMediaData}
                                        value={mediaData.contentsName}
                                    />
                                </div>
                            )}
                        </div>
                        <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold ${
                                mediaData.visibleType === 'PUBLIC'
                                    ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
                                    : 'border-slate-300/10 bg-slate-400/10 text-slate-400'
                            }`}
                        >
                            {mediaData.visibleType === 'PUBLIC' ? '공개' : '비공개'}
                        </span>
                    </div>

                    {isUpdateMode && (
                        <div className="mt-4 space-y-4">
                            <div>
                                <label htmlFor={`image-candidate-visible-${index}`} className="mb-2 block text-xs font-bold text-slate-300">
                                    공개 여부
                                </label>
                                <select
                                    id={`image-candidate-visible-${index}`}
                                    name="visibleType"
                                    value={mediaData.visibleType}
                                    onChange={handleMediaData}
                                    className={inputClassName}
                                >
                                    <option value="PUBLIC">공개</option>
                                    <option value="PRIVATE">비공개</option>
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor={`image-candidate-file-${index}`}
                                    className="mb-2 block text-xs font-bold text-slate-300"
                                >
                                    이미지 변경
                                </label>
                                <input
                                    className="block w-full rounded-xl border border-white/10 bg-slate-950/55 px-3 py-2 text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-400/15 file:px-3 file:py-2 file:text-xs file:font-bold file:text-violet-200"
                                    type="file"
                                    id={`image-candidate-file-${index}`}
                                    name="mediaPath"
                                    onChange={changeImage}
                                    accept="image/jpeg,image/png,image/gif"
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-auto flex flex-wrap justify-end gap-2 pt-5">
                        {isUpdateMode ? (
                            <>
                                <button
                                    type="button"
                                    className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08]"
                                    onClick={cancelUpdateContents}
                                >
                                    취소
                                </button>
                                <button
                                    type="button"
                                    className="h-10 rounded-xl bg-violet-500 px-4 text-xs font-black text-white transition hover:bg-violet-400"
                                    onClick={applyUpdateContents}
                                >
                                    변경 적용
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08]"
                                    onClick={() => setIsUpdateMode(true)}
                                >
                                    편집
                                </button>
                                <button
                                    type="button"
                                    className="h-10 rounded-xl border border-rose-300/15 bg-rose-400/10 px-4 text-xs font-bold text-rose-200 transition hover:bg-rose-400/20"
                                    onClick={removeContents}
                                >
                                    삭제
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default StaticMediaFileTypeCard;
