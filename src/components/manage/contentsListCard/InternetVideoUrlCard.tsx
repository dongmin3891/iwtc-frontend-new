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
    // 유튜브 영상 플레이어에 제공한다.
    const [mediaData, setMediaData] = useState<InternetVideoContentState>(() =>
        createInternetVideoContentState(contents)
    );
    const [isUpdateMode, setIsUpdateMode] = useState(false);

    useEffect(() => {
        setMediaData(createInternetVideoContentState(contents));
    }, [contents]);

    // 해당 요소 삭제
    const removeContents = () => {
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
                    setNewList((prev) => prev.filter((item) => item.absoluteName !== deleteContent.absoluteName));
                }
            } else {
                setDeleteList((prev) => [...prev, deleteContent]);
            }
        }
    };

    // 해당 요소 수정
    const updateContentsMode = () => {
        setIsUpdateMode(true);
    };

    const changeVideo = (e: ChangeEvent<HTMLInputElement>) => {
        setMediaData((prevData) => ({
            ...prevData,
            mediaData: e.target.value,
        }));
    };

    const handleMediaData = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setMediaData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const applyUpdateContents = () => {
        const updateResult: { content?: ManagedContent } = {};

        setWorldCupContentsList((prev) =>
            prev.map((contents) => {
                if (contents.id === index) {
                    const modifiedContent = applyManagedContentEdit(contents, mediaData);
                    if (modifiedContent) {
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
                    const existingIndex = prev.findIndex((item) => item.mediaFileId === modifiedContent.mediaFileId);

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

    return (
        <div>
            <div key={index} className="mb-4 p-4 border rounded-xl shadow-sm">
                <div className="flex justify-between">
                    <div className="flex min-w-0 gap-x-4">
                        <div className="flex min-w-0 gap-x-4">
                            <YoutubePlayer url={mediaData.mediaData} componentType={'uploadList'} />
                        </div>

                        <div className="flex-1">
                            <div className="mb-2">
                                <strong>컨텐츠 이름:</strong>
                                <span className="ml-1">
                                    {!isUpdateMode ? (
                                        <span>{mediaData.contentsName}</span>
                                    ) : (
                                        <span>
                                            <input
                                                id="textInput"
                                                type="text"
                                                className="p-1 border rounded-xl"
                                                placeholder="이상형 이름"
                                                name="contentsName"
                                                value={mediaData.contentsName}
                                                onChange={handleMediaData}
                                            />
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="mb-2">
                                <strong>영상 주소: </strong>
                                <span className="ml-1">
                                    {!isUpdateMode ? (
                                        <a
                                            href={mediaData.mediaData}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            {mediaData.mediaData}
                                        </a>
                                    ) : (
                                        <input
                                            id="textInput"
                                            type="text"
                                            className="p-1 border rounded-xl"
                                            placeholder="YouTube URL"
                                            name="youtubeUrl"
                                            onChange={changeVideo}
                                            value={mediaData.mediaData}
                                        />
                                    )}
                                </span>
                            </div>

                            <div className="mb-2">
                                <strong>영상 시작 시간:</strong>
                                <span className="ml-1">
                                    {!isUpdateMode ? (
                                        <span>{mediaData.videoStartTime}</span>
                                    ) : (
                                        <span>
                                            <input
                                                id="textInput"
                                                type="text"
                                                className="p-1 border rounded-xl"
                                                placeholder="ex 00100"
                                                name="videoStartTime"
                                                onChange={handleMediaData}
                                                value={mediaData.videoStartTime}
                                            />
                                        </span>
                                    )}
                                </span>
                            </div>

                            <div className="mb-2">
                                <strong>반복 시간:</strong>
                                <span className="ml-1">
                                    {!isUpdateMode ? (
                                        <span>{mediaData.videoPlayDuration}</span>
                                    ) : (
                                        <span>
                                            <input
                                                id="textInput"
                                                type="text"
                                                className="p-1 border rounded-xl"
                                                placeholder="3 ~ 5"
                                                name="videoPlayDuration"
                                                onChange={handleMediaData}
                                                value={mediaData.videoPlayDuration}
                                            />
                                        </span>
                                    )}
                                </span>
                            </div>

                            <div className="flex">
                                <div className="mt-0.4">
                                    <strong>공개 여부:</strong>
                                </div>
                                <div className="ml-1 mb-2">
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
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sm:flex sm:flex-col sm:items-end">
                        <div>
                            <div>
                                {!isUpdateMode ? (
                                    <button
                                        className="bg-green-500 hover:bg-red-700 text-white font-bold my-2 py-2 px-4 rounded"
                                        onClick={() => updateContentsMode()}
                                    >
                                        수정
                                    </button>
                                ) : (
                                    <div className="sm:flex-col">
                                        <div>
                                            <button
                                                className="bg-green-500 hover:bg-red-700 text-white font-bold my-2 py-2 px-4 rounded"
                                                onClick={() => applyUpdateContents()}
                                            >
                                                적용하기
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {!isUpdateMode ? (
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold my-2 py-2 px-4 rounded"
                                    onClick={removeContents}
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

export default InternetVideoUrlCard;
