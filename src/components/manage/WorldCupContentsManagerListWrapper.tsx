import { Dispatch, SetStateAction, useContext } from 'react';
import WorldCupContentsManageList from './WorldCupContentsManageList';
import {
    createStaticWorldCupContent,
    createWorldCupContents,
    removeMyWorldCupContents,
    updateStaticWorldCupContent,
    updateMyWorldCupContents,
} from '@/services/ManageWorldCupService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from '@/utils/TokenManager';
import AlertPopup from '../popup/AlertPopup';
import { PopupContext } from '@/providers/PopupProvider';
import NotCreateWorldCupLogo from './NotCreateWorldCupLogo';
import { useRouter } from 'next/navigation';
import { ManagedContent, PersistedManagedContentView } from '@/domain/manage/persistedContent';
import { createNewWorldCupContents, saveWorldCupContentChanges } from '@/domain/manage/save';

interface IProps {
    isCreateWorldCup: boolean;
    worldCupContentsList: ManagedContent[];
    setWorldCupContentsList: Dispatch<SetStateAction<ManagedContent[]>>;
    worldCupId: number;
    setModifyList?: Dispatch<SetStateAction<PersistedManagedContentView[]>>;
    setDeleteList?: Dispatch<SetStateAction<PersistedManagedContentView[]>>;
    setNewList?: Dispatch<SetStateAction<ManagedContent[]>>;
    newList?: ManagedContent[];
    modifyList?: PersistedManagedContentView[];
    deleteList?: PersistedManagedContentView[];
    isChanges?: boolean;
    isModifyPage?: boolean;
}
/**
 * 게임 컨텐츠 리스트 래핑 요소입니다.
 * @param initWorldCupGameContentsList 월드컵 게임수정 버튼으로 들어오면 기존 월드컵 컨텐츠가 들어온다.
 * @returns
 */
const WorldCupContentsManageListWrapper = ({
    isCreateWorldCup,
    worldCupContentsList,
    setWorldCupContentsList,
    worldCupId,
    setModifyList,
    setDeleteList,
    setNewList,
    newList = [],
    modifyList = [],
    deleteList = [],
    isChanges,
    isModifyPage,
}: IProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { showPopup, hidePopup } = useContext(PopupContext);

    /**
     * 수정된 월드컵 컨텐츠 서버에 전송
     */
    const createNewWorldCupContentsList = () => {
        if (worldCupContentsList.length === 0) {
            showAlertPopup('새로운 컨텐츠가 없습니다.');
            return;
        }
        const token = getAccessToken();

        mutationWorldCupContents.mutate({
            worldCupId: worldCupId,
            accessToken: token,
            contents: worldCupContentsList,
        });
    };

    const modifyNewWorldCupContentsList = async () => {
        if (!isChanges) {
            showAlertPopup('변경사항이 없습니다.');
            return;
        }

        const accessToken = getAccessToken();

        await saveWorldCupContentChanges(
            { worldCupId, accessToken, deleteList, modifyList, newList },
            {
                removeContent: removeMyWorldCupContents,
                updateContent: updateMyWorldCupContents,
                updateStaticContent: updateStaticWorldCupContent,
                createContents: createWorldCupContents,
                createStaticContent: createStaticWorldCupContent,
            }
        )
            .then(() => {
                setDeleteList?.([]);
                setModifyList?.([]);
                setNewList?.([]);
                queryClient.invalidateQueries({ queryKey: ['MyWorldCupContentsList'] });
                showAlertPopup('수정이 완료되었습니다.');
            })
            .catch((error) => {
                console.error('작업 중 오류 발생', error);
            });
    };

    const mutationWorldCupContents = useMutation(
        (input: { worldCupId: number; accessToken: string; contents: ManagedContent[] }) =>
            createNewWorldCupContents(input, {
                createContents: createWorldCupContents,
                createStaticContent: createStaticWorldCupContent,
            }),
        {
            onSuccess: () => {
                showAlertPopup('성공');
                router.push('/');
            },
            onError: () => {
                showAlertPopup('error');
            },
        }
    );

    const showAlertPopup = (message: string) => {
        showPopup(<AlertPopup message={message} hidePopup={hidePopup} />);
    };

    const getSizeNewContents = (newWorldCupContents: ManagedContent[]) => {
        return newWorldCupContents.length > 0;
    };

    const createButtonClassName = getSizeNewContents(worldCupContentsList)
        ? 'bg-blue-500 hover:bg-blue-700'
        : 'bg-gray-500';
    return (
        <div>
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold" style={{ marginLeft: '2%' }}>
                    ❤️ 이상형 리스트 ❤️
                </h1>
                {isCreateWorldCup && !isModifyPage && (
                    <div className="ml-auto" style={{ marginRight: '2%' }}>
                        <div>
                            <button
                                className={`text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${createButtonClassName}`}
                                onClick={createNewWorldCupContentsList}
                            >
                                새로운 컨텐츠 생성 적용 [{worldCupContentsList?.length}개]
                            </button>
                        </div>
                    </div>
                )}
                {isCreateWorldCup && isModifyPage && (
                    <div className="ml-auto" style={{ marginRight: '2%' }}>
                        <div>
                            <button
                                className={`text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${createButtonClassName}`}
                                onClick={modifyNewWorldCupContentsList}
                            >
                                변경사항 적용 [추가 : {newList.length}개 | 수정 : {modifyList?.length}개 | 삭제 :{' '}
                                {deleteList.length}개]
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-8">
                {isCreateWorldCup ? (
                    <div className="h-screen overflow-y-auto ">
                        <WorldCupContentsManageList
                            worldCupContentsList={worldCupContentsList}
                            setWorldCupContentsList={setWorldCupContentsList}
                            setModifyList={setModifyList}
                            setDeleteList={setDeleteList}
                            setNewList={setNewList}
                            newList={newList}
                        />
                    </div>
                ) : (
                    <div>
                        <NotCreateWorldCupLogo />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorldCupContentsManageListWrapper;
