import { ManagedContentDraft } from '@/domain/manage/persistedContent';
import { ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react';
import ImageTypeLayout from './ImageTypeLayout';
import SelectFileType from './SelectFileType';
import SelectVisibleType from './SelectVisibleType';
import YoutubeTypeLayout from './YoutubeTypeLayout';

interface WorldCupContentCreateFormProps {
    mediaFileType: string;
    contents: ManagedContentDraft;
    isImageLoaded: boolean;
    setIsImageLoaded: Dispatch<SetStateAction<boolean>>;
    setContents: Dispatch<SetStateAction<ManagedContentDraft>>;
    videoRef: RefObject<HTMLVideoElement>;
    imageRef: RefObject<HTMLImageElement>;
    onContentsChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onVisibleTypeChange: (value: string) => void;
    onMediaFileTypeChange: (value: string) => void;
    onAdd: () => void;
}

const WorldCupContentCreateForm = ({
    mediaFileType,
    contents,
    isImageLoaded,
    setIsImageLoaded,
    setContents,
    videoRef,
    imageRef,
    onContentsChange,
    onVisibleTypeChange,
    onMediaFileTypeChange,
    onAdd,
}: WorldCupContentCreateFormProps) => {
    return (
        <section className="mb-5 rounded-3xl border border-white/10 bg-slate-950/30 p-4 sm:p-5">
            <SelectFileType mediaFileType={mediaFileType} handleMediaFileType={onMediaFileTypeChange} />

            {mediaFileType ? (
                <div className="mt-6 border-t border-white/10 pt-6">
                    <div className="flex flex-col gap-6">
                        <div>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label htmlFor="candidate-name" className="text-xs font-bold text-slate-300">
                                    후보 이름
                                </label>
                                <span className="text-[11px] font-semibold text-slate-600">필수</span>
                            </div>
                            <input
                                id="candidate-name"
                                type="text"
                                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300/50 focus:ring-4 focus:ring-violet-400/10"
                                placeholder="예: 제주도"
                                name="contentsName"
                                value={contents.contentsName}
                                onChange={onContentsChange}
                            />
                            <p className="mt-2 text-[11px] leading-4 text-slate-600">
                                대결 카드와 결과 화면에 표시되는 이름이에요.
                            </p>
                        </div>

                        {mediaFileType === 'file' ? (
                            <ImageTypeLayout
                                isImageLoaded={isImageLoaded}
                                setIsImageLoaded={setIsImageLoaded}
                                setWorldCupContents={setContents}
                                fowardVideoRef={videoRef}
                                fowardImgRef={imageRef}
                                mp4Type={contents.mp4Type}
                                imgType={contents.imgType}
                            />
                        ) : (
                            <YoutubeTypeLayout
                                mediaPath={contents.mediaPath}
                                videoStartTime={contents.videoStartTime}
                                videoPlayDuration={contents.videoPlayDuration}
                                handleCreateWorldCupContents={onContentsChange}
                            />
                        )}

                        <SelectVisibleType visibleType={contents.visibleType} handleVisibleType={onVisibleTypeChange} />
                    </div>

                    <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08]"
                            onClick={() => onMediaFileTypeChange('')}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            className="h-11 rounded-2xl bg-violet-500 px-6 text-sm font-black text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-400"
                            onClick={onAdd}
                        >
                            후보 목록에 추가
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-8 text-center">
                    <p className="text-sm font-bold text-slate-400">미디어 유형을 선택하면 입력 항목이 열립니다.</p>
                    <p className="mt-2 text-xs leading-5 text-slate-600">후보마다 이미지 또는 YouTube 영상 하나를 등록할 수 있어요.</p>
                </div>
            )}
        </section>
    );
};

export default WorldCupContentCreateForm;
