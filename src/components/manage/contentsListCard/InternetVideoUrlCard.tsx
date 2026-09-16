import YoutubePlayer from '@/components/youtubePlayer/YoutubePlayer';
import {
    applyManagedContentEdit,
    ManagedContent,
    PersistedManagedContentView,
} from '@/domain/manage/persistedContent';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';

interface IProps {
    contents: ManagedContent;
    index: number;
    setWorldCupContentsList: Dispatch<SetStateAction<ManagedContent[]>>;
    setModifyList?: Dispatch<SetStateAction<PersistedManagedContentView[]>>;
    setDeleteList?: Dispatch<SetStateAction<PersistedManagedContentView[]>>;
    setNewList?: Dispatch<SetStateAction<ManagedContent[]>>;
    newList: ManagedContent[];
}

interface InternetVideoContentState {
    contentsId?: number;
    contentsName: string;
    originalName?: string;
    visibleType: string;
    mediaData?: string;
    videoStartTime?: string;
    videoPlayDuration?: number | string;
    detailFileType: string;
    mediaFileId?: number;
}

const createInternetVideoContentState = (contents: ManagedContent): InternetVideoContentState => ({
    contentsId: contents.contentsId,
    contentsName: contents.contentsName,
    originalName: contents.originalName,
    visibleType: contents.visibleType,
    mediaData: contents.mediaData,
    videoStartTime: contents.videoStartTime,
    videoPlayDuration: contents.videoPlayDuration,
    detailFileType: 'YOU_TUBE_URL',
    mediaFileId: contents.mediaFileId,
});

const hasPersistedContentId = (contents: ManagedContent): contents is PersistedManagedContentView =>
    Boolean(contents.contentsId);

const InternetVideoUrlCard = ({
    contents,
    index,
    setWorldCupContentsList,
    setModifyList,
    setDeleteList,
    setNewList,
    newList,
}: IProps) => {
    const [mediaData, setMediaData] = useState<InternetVideoContentState>(() =>
        createInternetVideoContentState(contents)
    );
    const [isUpdateMode, setIsUpdateMode] = useState(false);

    useEffect(() => {
        setMediaData(createInternetVideoContentState(contents));
    }, [contents]);

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
                        current.filter((item) => item.absoluteName !== deleteContent.absoluteName)
                    );
                }
            } else {
                setDeleteList((current) => [...current, deleteContent]);
            }
        }
    };

    const changeVideo = (event: ChangeEvent<HTMLInputElement>) => {
        setMediaData((current) => ({
            ...current,
            mediaData: event.target.value,
        }));
    };

    const handleMediaData = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setMediaData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const applyUpdateContents = () => {
        const updateResult: { content?: ManagedContent } = {};

        setWorldCupContentsList((current) =>
            current.map((item) => {
                if (item.id === index) {
                    const modifiedContent = applyManagedContentEdit(item, mediaData);
                    if (modifiedContent) {
                        updateResult.content = modifiedContent;
                        return modifiedContent;
                    }
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
                        (item) => item.mediaFileId === modifiedContent.mediaFileId
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
        setMediaData(createInternetVideoContentState(contents));
        setIsUpdateMode(false);
    };

    const inputClassName =
        'h-11 w-full rounded-xl border border-white/10 bg-slate-950/55 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300/50 focus:ring-4 focus:ring-violet-400/10';

    return (
        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/10">
            <div className="grid gap-0 md:grid-cols-[240px_minmax(0,1fr)]">
                <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden bg-black/35">
                    <YoutubePlayer url={mediaData.mediaData} componentType="uploadList" />
                    <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[10px] font-black tracking-[0.12em] text-slate-200 backdrop-blur">
                        YOUTUBE
                    </span>
                </div>

                <div className="flex min-w-0 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black tracking-[0.14em] text-slate-600">CANDIDATE {String(index + 1).padStart(2, '0')}</p>
                            {!isUpdateMode ? (
                                <h4 className="mt-2 truncate text-lg font-black text-white">{mediaData.contentsName}</h4>
                            ) : (
                                <div className="mt-3">
                                    <label htmlFor={`video-candidate-name-${index}`} className="mb-2 block text-xs font-bold text-slate-300">
                                        후보 이름
                                    </label>
                                    <input
                                        id={`video-candidate-name-${index}`}
                                        type="text"
                                        className={inputClassName}
                                        placeholder="후보 이름"
                                        name="contentsName"
                                        value={mediaData.contentsName}
                                        onChange={handleMediaData}
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

                    {!isUpdateMode ? (
                        <div className="mt-4 min-w-0">
                            <a
                                href={mediaData.mediaData}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block truncate text-xs font-semibold text-sky-300 transition hover:text-sky-200 hover:underline"
                            >
                                {mediaData.mediaData}
                            </a>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-lg bg-white/[0.05] px-3 py-2 text-[11px] font-semibold text-slate-400">
                                    시작 {mediaData.videoStartTime || '-'}
                                </span>
                                <span className="rounded-lg bg-white/[0.05] px-3 py-2 text-[11px] font-semibold text-slate-400">
                                    반복 {mediaData.videoPlayDuration || '-'}초
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-4">
                            <div>
                                <label htmlFor={`video-candidate-url-${index}`} className="mb-2 block text-xs font-bold text-slate-300">
                                    YouTube 영상 주소
                                </label>
                                <input
                                    id={`video-candidate-url-${index}`}
                                    type="url"
                                    className={inputClassName}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    name="youtubeUrl"
                                    onChange={changeVideo}
                                    value={mediaData.mediaData}
                                />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label htmlFor={`video-candidate-start-${index}`} className="mb-2 block text-xs font-bold text-slate-300">
                                        시작 시간
                                    </label>
                                    <input
                                        id={`video-candidate-start-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        className={inputClassName}
                                        placeholder="00030"
                                        name="videoStartTime"
                                        onChange={handleMediaData}
                                        value={mediaData.videoStartTime}
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`video-candidate-duration-${index}`} className="mb-2 block text-xs font-bold text-slate-300">
                                        반복 시간
                                    </label>
                                    <input
                                        id={`video-candidate-duration-${index}`}
                                        type="number"
                                        min={3}
                                        max={5}
                                        className={inputClassName}
                                        placeholder="3"
                                        name="videoPlayDuration"
                                        onChange={handleMediaData}
                                        value={mediaData.videoPlayDuration}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor={`video-candidate-visible-${index}`} className="mb-2 block text-xs font-bold text-slate-300">
                                    공개 여부
                                </label>
                                <select
                                    id={`video-candidate-visible-${index}`}
                                    name="visibleType"
                                    value={mediaData.visibleType}
                                    onChange={handleMediaData}
                                    className={inputClassName}
                                >
                                    <option value="PUBLIC">공개</option>
                                    <option value="PRIVATE">비공개</option>
                                </select>
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

export default InternetVideoUrlCard;
