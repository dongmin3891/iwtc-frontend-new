'use client';
import React, { ChangeEvent, Dispatch, SetStateAction, useContext, useRef, useState } from 'react';
import ManageCardWrapper from './contentsListCard/ManageCardWrapper';
import AlertPopup from '../popup/AlertPopup';
import { PopupContext } from '@/providers/PopupProvider';
import {
    ManagedContent,
    ManagedContentDraft,
    PersistedManagedContentView,
} from '@/domain/manage/persistedContent';
import { validateManagedContentDraft } from '@/domain/manage/content';
import WorldCupContentCreateForm from './WorldCupContentCreateForm';

/*
    게임 관리 폼에서 월드컵 게임 컨텐츠에 관한 내용을 표현하는 폼
*/

interface IProps {
    worldCupContentsList: ManagedContent[];
    setWorldCupContentsList: Dispatch<SetStateAction<ManagedContent[]>>;
    setModifyList?: Dispatch<SetStateAction<PersistedManagedContentView[]>>;
    setDeleteList?: Dispatch<SetStateAction<PersistedManagedContentView[]>>;
    setNewList?: Dispatch<SetStateAction<ManagedContent[]>>;
    newList?: ManagedContent[];
}

const WorldCupContentsManageList = ({
    worldCupContentsList,
    setWorldCupContentsList,
    setModifyList,
    setDeleteList,
    setNewList,
    newList = [],
}: IProps) => {
    const { showPopup, hidePopup } = useContext(PopupContext);

    const imgRef = useRef<HTMLImageElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [mediaFileType, setMediaFileType] = useState('');
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // 컨텐츠 데이터
    const [worldCupContents, setWorldCupContents] = useState<ManagedContentDraft>({
        contentsName: '',
        visibleType: '',
        fileType: '',
        mediaPath: '',
        originalName: '',
        absoluteName: '',
        videoStartTime: '',
        videoPlayDuration: '',
        mp4Type: '',
        imgType: '',
        detailFileType: '',
    });

    const handleCreateWorldCupContents = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setWorldCupContents((prevWorldCupContents) => ({
            ...prevWorldCupContents,
            absoluteName: `uniqueName_${Math.random().toString(36).substr(2, 9)}`,
            [name]: value,
        }));
    };

    const showAlertPopup = (message: string) => {
        showPopup(<AlertPopup message={message} hidePopup={hidePopup} />);
    };

    // 새로운 컨텐츠를 리스트 추가
    const applyNewContents = () => {
        const validationMessage = validateManagedContentDraft(worldCupContents);
        if (validationMessage) {
            showAlertPopup(validationMessage);
            return;
        }

        handleMediaFileType('');
        const updatedContents: ManagedContent = {
            ...worldCupContents,
            id: worldCupContentsList.length,
        };
        setWorldCupContentsList((prev) => [...prev, updatedContents]);
        setNewList?.((prev) => [...prev, updatedContents]);
    };

    const handleVisibleType = (value: string) => {
        setWorldCupContents((prevWorldCupContents) => ({
            ...prevWorldCupContents,
            visibleType: value,
        }));
    };

    const handleMediaFileType = (value: string) => {
        setWorldCupContents({
            contentsName: '',
            visibleType: 'PUBLIC',
            fileType: value,
            mediaPath: '',
            originalName: '',
            absoluteName: '',
            videoStartTime: '',
            videoPlayDuration: '',
            mp4Type: '',
            imgType: '',
            detailFileType: '',
        });
        setIsImageLoaded(false);
        if (imgRef.current) {
            imgRef.current.src = '';
        }
        setMediaFileType(value);
    };

    return (
        <div>
            <WorldCupContentCreateForm
                mediaFileType={mediaFileType}
                contents={worldCupContents}
                isImageLoaded={isImageLoaded}
                setIsImageLoaded={setIsImageLoaded}
                setContents={setWorldCupContents}
                videoRef={videoRef}
                imageRef={imgRef}
                onContentsChange={handleCreateWorldCupContents}
                onVisibleTypeChange={handleVisibleType}
                onMediaFileTypeChange={handleMediaFileType}
                onAdd={applyNewContents}
            />
            {worldCupContentsList.length > 0 && (
                <section className="mt-7" aria-labelledby="candidate-list-title">
                    <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                            <span className="text-[10px] font-black tracking-[0.14em] text-sky-200">ADDED CANDIDATES</span>
                            <h3 id="candidate-list-title" className="mt-1 text-lg font-black text-white">
                                추가된 후보
                            </h3>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold text-slate-400">
                            {worldCupContentsList.length}개
                        </span>
                    </div>
                    <div className="space-y-4">
                        {worldCupContentsList.map((contents, index) => (
                            <ManageCardWrapper
                                key={index}
                                contents={contents}
                                index={contents.id}
                                setWorldCupContentsList={setWorldCupContentsList}
                                setModifyList={setModifyList}
                                setDeleteList={setDeleteList}
                                setNewList={setNewList}
                                newList={newList}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default WorldCupContentsManageList;
