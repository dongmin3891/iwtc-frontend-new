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

    const handleMediaData = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setMediaData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // 해당 요소 삭제
    const removeContents = async () => {
        const deleteResult: { content?: ManagedContent } = {};

        setWorldCupContentsList((prev) => {
            // 먼저 삭제할 컨텐츠를 식별합니다.
            const foundContent = prev.find((contents) => contents.id === index);
            if (foundContent) {
                deleteResult.content = { ...foundContent };
            }

            // 삭제할 컨텐츠를 제외하고 리스트를 반환합니다.
            return prev
                .filter((contents) => contents.id !== index)
                .map((contents, newIndex) => ({ ...contents, id: newIndex }));
        });
        const deleteContent = deleteResult.content;

        if (deleteContent && setNewList && setDeleteList) {
            // newList에서 deleteContent와 일치하는 항목을 제외하고 새로운 배열을 생성합니다.
            //새롭게 추가된 컨텐츠는 deleteList에 넣으면 안된다. 네임과 미디어패스로 구분 이후 수정할 때 newList도 수정해줘야함
            if (!hasPersistedContentId(deleteContent)) {
                if (newList.length > 0) {
                    setNewList((prev) =>
                        prev.filter(
                            (item) =>
                                item.contentsName !== deleteContent.contentsName &&
                                item.mediaPath !== deleteContent.mediaPath
                        )
                    );
                }
            } else {
                setDeleteList((prev) => [...prev, deleteContent]);
            }
        }
    };

    const updateContentsMode = () => {
        setIsUpdateMode(true);
    };

    const applyUpdateContents = async () => {
        const updateResult: { content?: ManagedContent } = {};

        setWorldCupContentsList((prev) =>
            prev.map((contents) => {
                if (contents.id === index) {
                    // 수정 조건을 만족하는 경우, 수정된 컨텐츠 정보를 저장
                    if (
                        contents.contentsName !== mediaData.contentsName ||
                        contents.mediaData !== mediaData.mediaData ||
                        contents.visibleType !== mediaData.visibleType
                    ) {
                        const modifiedContent = {
                            ...contents,
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
                }
                return contents;
            })
        );
        const modifiedContent = updateResult.content;

        if (modifiedContent && setNewList && setModifyList) {
            //새로 추가된 컨텐츠
            if (!hasPersistedContentId(modifiedContent)) {
                if (newList.length) {
                    setNewList((prevList) =>
                        prevList.map((item) =>
                            item.absoluteName === modifiedContent.absoluteName ? modifiedContent : item
                        )
                    );
                }
            } else {
                setModifyList((prev) => {
                    // 수정하려는 컨텐츠의 오리지널 네임을 찾음. 없으면 -1을 반환합니다.
                    const existingIndex = prev.findIndex((item) => item.contentsId === modifiedContent.contentsId);

                    if (existingIndex !== -1) {
                        // 일치하는 항목이 있으면, 그 항목을 업데이트합니다.
                        return prev.map((item, index) => (index === existingIndex ? modifiedContent : item));
                    } else {
                        // 일치하는 항목이 없으면, 새 항목을 배열에 추가합니다.
                        return [...prev, modifiedContent];
                    }
                });
            }
        }

        setIsUpdateMode(false);
    };

    const changeImage = (e: ChangeEvent<HTMLInputElement>) => {
        const imageFile = e.target.files?.[0];
        if (!imageFile) {
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', (e: ProgressEvent<FileReader>) => {
            const mediaData = e.target?.result;
            if (typeof mediaData !== 'string') {
                return;
            }

            setMediaData((prevData) => ({
                ...prevData,
                mediaData,
                imgType: mediaData,
            }));
        });

        reader.readAsDataURL(imageFile);

        setMediaData((prevData) => ({
            ...prevData,
            originalName: imageFile.name,
            detailFileType: imageFile.type.replace('image/', '').toUpperCase(),
            uploadFile: imageFile,
        }));
    };

    return (
        <div>
            <div key={index} className="mb-4 p-4 border rounded-xl shadow-sm">
                <div className="flex justify-between">
                    <div className="flex min-w-0 gap-x-4">
                        <div className="flex min-w-0 gap-x-4">
                            {mediaData.mp4Type && (
                                <video
                                    src={mediaData.mediaData}
                                    width={'auto'}
                                    height={100}
                                    autoPlay
                                    muted
                                    loop
                                ></video>
                            )}
                            {mediaData.imgType && (
                                <img
                                    className="w-full h-52"
                                    src={mediaData.mediaData}
                                    width={10}
                                    height={10}
                                    alt="img"
                                />
                            )}
                        </div>
                        <div>
                            <div className="flex-1 min-w-0">
                                <div className="mb-2">
                                    <strong>컨텐츠 이름:</strong>
                                    <span className="ml-2">
                                        {!isUpdateMode ? (
                                            <span>{mediaData.contentsName}</span>
                                        ) : (
                                            <span>
                                                <input
                                                    id="textInput"
                                                    type="text"
                                                    className="p-1 border rounded-xl"
                                                    placeholder="컨텐츠 이름"
                                                    name="contentsName"
                                                    onChange={handleMediaData}
                                                    value={mediaData.contentsName}
                                                />
                                            </span>
                                        )}
                                    </span>
                                </div>

                                <div className="mb-2 flex">
                                    <div>
                                        <strong>공개 여부:</strong>
                                    </div>
                                    <span className="ml-2">
                                        {!isUpdateMode ? (
                                            <div>{mediaData.visibleType === 'PUBLIC' ? '공개' : '비공개'}</div>
                                        ) : (
                                            <div>
                                                <select
                                                    name="visibleType"
                                                    value={mediaData.visibleType}
                                                    onChange={handleMediaData}
                                                    className="p-1 border rounded-xl"
                                                >
                                                    <option value="PUBLIC">공개</option>
                                                    <option value="PRIVATE">비공개</option>
                                                </select>
                                            </div>
                                        )}
                                    </span>
                                </div>
                                <div>
                                    {isUpdateMode ? (
                                        <div className="flex">
                                            <div className="mt-1.5">
                                                <strong>이미지 변경</strong>
                                            </div>
                                            <div className="ml-3">
                                                <input
                                                    className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                                                    type="file"
                                                    id="formFileMultiple"
                                                    name="mediaPath"
                                                    onChange={changeImage}
                                                    accept="image/jpeg,image/png,image/gif"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sm:flex sm:flex-col sm:items-end">
                        <div>
                            {!isUpdateMode ? (
                                <button
                                    className="bg-green-500 hover:bg-red-700 text-white font-bold my-2 py-2 px-4 rounded"
                                    onClick={updateContentsMode}
                                >
                                    수정
                                </button>
                            ) : (
                                <button
                                    className="bg-green-500 hover:bg-red-700 text-white font-bold my-2 py-2 px-4 rounded"
                                    onClick={applyUpdateContents}
                                >
                                    적용
                                </button>
                            )}
                        </div>
                        <div>
                            {!isUpdateMode ? (
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold my-2 py-2 px-4 rounded"
                                    onClick={() => removeContents()}
                                >
                                    삭제
                                </button>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaticMediaFileTypeCard;
