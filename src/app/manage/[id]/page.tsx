'use client';
import React, { useEffect, useState } from 'react';
import WorldCupManageForm from '@/components/manage/WorldCupManageForm';
import WorldCupContentsManageListWrapper from '@/components/manage/WorldCupContentsManagerListWrapper';
import { useQueryGetMyWorldCup, useQueryGetMyWorldCupContentsList } from '@/services/ManageWorldCupService';
import { getMediaFile } from '@/services/EtcService';
import {
    ManagedContent,
    normalizePersistedManagedContent,
    PersistedManagedContentView,
} from '@/domain/manage/persistedContent';

/*
    월드컵 관리 페이지를 표현합니다.
*/
const ManageForm = ({ params }: { params: { id: string } }) => {
    const id = Number(params.id);
    const { data: myWorldCupData, isSuccess: isMyWorldCupSuccess } = useQueryGetMyWorldCup(id);
    const { data: myWorldCupContentsList, isSuccess: isMyWorldCupContentsList } = useQueryGetMyWorldCupContentsList(id);
    const [worldCupContentsList, setWorldCupContentsList] = useState<ManagedContent[]>([]); // 최초 수정페이지에서 컨텐츠가 담기는 배열
    const [worldCupId, setWorldCupId] = useState(id ? id : 0);
    const [isCreateWorldCup, setIsCreateWorldCup] = useState(false);
    const [modifyList, setModifyList] = useState<PersistedManagedContentView[]>([]);
    const [deleteList, setDeleteList] = useState<PersistedManagedContentView[]>([]);
    const [newList, setNewList] = useState<ManagedContent[]>([]);
    const [isChanges, setIsChange] = useState(false);
    const persistedContents = myWorldCupContentsList?.data?.data;

    useEffect(() => {
        if (isMyWorldCupSuccess) {
            setIsCreateWorldCup(true);
        }
    }, [isMyWorldCupSuccess]);

    useEffect(() => {
        const fetchData = async () => {
            if (worldCupContentsList.length < 1 && isMyWorldCupContentsList && id && persistedContents) {
                try {
                    const newData = await Promise.all(
                        persistedContents.map(async (items, index) => {
                            const data = items.mediaFileId ? await getMediaFile(items.mediaFileId) : undefined;
                            return normalizePersistedManagedContent(items, data?.data.data, index);
                        })
                    );

                    setWorldCupContentsList(newData);
                } catch (error) {
                    console.error('비동기 작업 실패:', error);
                }
            }
        };

        fetchData();
    }, [id, isMyWorldCupContentsList, persistedContents, worldCupContentsList.length]);

    useEffect(() => {
        if (newList.length > 0 || deleteList.length > 0 || modifyList.length > 0) {
            setIsChange(true);
        } else {
            setIsChange(false);
        }
    }, [newList, deleteList, modifyList, worldCupContentsList]);

    return (
        <div>
            <div className="flex my-5">
                <div className="flex-none m-5">
                    <WorldCupManageForm
                        setIsCreateWorldCup={setIsCreateWorldCup}
                        setWorldCupId={setWorldCupId}
                        myWorldCupData={isMyWorldCupSuccess ? myWorldCupData.data.data : undefined}
                        isCreateWorldCup={isCreateWorldCup}
                    />
                </div>
                <div className="flex-auto">
                    <WorldCupContentsManageListWrapper
                        isCreateWorldCup={isCreateWorldCup}
                        worldCupContentsList={worldCupContentsList}
                        setWorldCupContentsList={setWorldCupContentsList}
                        worldCupId={worldCupId}
                        setModifyList={setModifyList}
                        setDeleteList={setDeleteList}
                        setNewList={setNewList}
                        newList={newList}
                        modifyList={modifyList}
                        deleteList={deleteList}
                        isChanges={isChanges}
                        isModifyPage={id ? true : false}
                    />
                </div>
            </div>
        </div>
    );
};

export default ManageForm;
