import { Dispatch, SetStateAction, useContext, useState } from 'react';
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

type SaveStatus = 'idle' | 'success' | 'error';

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
    const [isModificationSaving, setIsModificationSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

    const { showPopup, hidePopup } = useContext(PopupContext);

    const isCreateMode = isCreateWorldCup && !isModifyPage;
    const isModifyMode = isCreateWorldCup && Boolean(isModifyPage);
    const pendingChangeCount = isModifyMode
        ? newList.length + modifyList.length + deleteList.length
        : worldCupContentsList.length;
    const canSave = isCreateMode ? worldCupContentsList.length > 0 : Boolean(isChanges);

    /**
     * 수정된 월드컵 컨텐츠 서버에 전송
     */
    const createNewWorldCupContentsList = () => {
        if (!canSave || mutationWorldCupContents.isLoading) {
            return;
        }
        setSaveStatus('idle');
        const token = getAccessToken();

        mutationWorldCupContents.mutate({
            worldCupId: worldCupId,
            accessToken: token,
            contents: worldCupContentsList,
        });
    };

    const modifyNewWorldCupContentsList = async () => {
        if (!canSave || isModificationSaving) {
            return;
        }

        const accessToken = getAccessToken();
        setIsModificationSaving(true);
        setSaveStatus('idle');

        try {
            await saveWorldCupContentChanges(
                { worldCupId, accessToken, deleteList, modifyList, newList },
                {
                    removeContent: removeMyWorldCupContents,
                    updateContent: updateMyWorldCupContents,
                    updateStaticContent: updateStaticWorldCupContent,
                    createContents: createWorldCupContents,
                    createStaticContent: createStaticWorldCupContent,
                }
            );
            setDeleteList?.([]);
            setModifyList?.([]);
            setNewList?.([]);
            void queryClient.invalidateQueries({ queryKey: ['MyWorldCupContentsList'] });
            setSaveStatus('success');
            showAlertPopup('후보 변경사항을 저장했습니다.');
        } catch (error) {
            console.error('작업 중 오류 발생', error);
            setSaveStatus('error');
            showAlertPopup('저장하지 못했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsModificationSaving(false);
        }
    };

    const mutationWorldCupContents = useMutation(
        (input: { worldCupId: number; accessToken: string; contents: ManagedContent[] }) =>
            createNewWorldCupContents(input, {
                createContents: createWorldCupContents,
                createStaticContent: createStaticWorldCupContent,
            }),
        {
            onSuccess: () => {
                setSaveStatus('success');
                showAlertPopup('후보 저장을 완료했습니다.');
                router.push('/');
            },
            onError: () => {
                setSaveStatus('error');
                showAlertPopup('저장하지 못했습니다. 잠시 후 다시 시도해주세요.');
            },
        }
    );

    const showAlertPopup = (message: string) => {
        showPopup(<AlertPopup message={message} hidePopup={hidePopup} />);
    };

    const isSaving = mutationWorldCupContents.isLoading || isModificationSaving;
    const saveDescription = isSaving
        ? '변경사항을 서버에 반영하고 있어요. 잠시만 기다려주세요.'
        : !canSave
        ? isCreateMode
            ? '후보를 한 개 이상 추가하면 저장할 수 있어요.'
            : '후보를 추가하거나 수정하면 저장 버튼이 활성화돼요.'
        : isCreateMode
        ? `추가한 후보 ${worldCupContentsList.length}개를 한 번에 저장합니다.`
        : `추가 ${newList.length}개 · 수정 ${modifyList.length}개 · 삭제 ${deleteList.length}개를 반영합니다.`;

    return (
        <div className="min-w-0">
            {isCreateWorldCup ? (
                <div className="space-y-6">
                    <div className="min-w-0">
                        <WorldCupContentsManageList
                            worldCupContentsList={worldCupContentsList}
                            setWorldCupContentsList={setWorldCupContentsList}
                            setModifyList={setModifyList}
                            setDeleteList={setDeleteList}
                            setNewList={setNewList}
                            newList={newList}
                        />
                    </div>

                    <section
                        className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/45"
                        aria-labelledby="candidate-save-title"
                    >
                        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-black tracking-[0.16em] text-emerald-300">
                                        FINAL STEP
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold text-slate-400">
                                        후보 {worldCupContentsList.length}개
                                    </span>
                                    {pendingChangeCount > 0 && (
                                        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold text-amber-200">
                                            저장 전 변경 {pendingChangeCount}건
                                        </span>
                                    )}
                                </div>
                                <h3 id="candidate-save-title" className="mt-3 text-lg font-black tracking-[-0.03em] text-white">
                                    {isModifyMode ? '후보 변경사항 저장' : '후보 목록 저장'}
                                </h3>
                                <p className="mt-1.5 text-xs leading-5 text-slate-400">{saveDescription}</p>

                                {saveStatus === 'success' && !canSave && (
                                    <p className="mt-3 text-xs font-bold text-emerald-300" role="status">
                                        저장이 완료되었습니다. 최신 후보 목록을 불러왔어요.
                                    </p>
                                )}
                                {saveStatus === 'error' && (
                                    <p className="mt-3 text-xs font-bold text-rose-300" role="alert">
                                        저장에 실패했습니다. 입력 내용을 유지했으니 다시 시도해주세요.
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                disabled={!canSave || isSaving}
                                onClick={isModifyMode ? modifyNewWorldCupContentsList : createNewWorldCupContentsList}
                                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-sky-950/20 transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-sky-300/70 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:brightness-100 lg:w-auto lg:min-w-[190px]"
                            >
                                {isSaving && (
                                    <span
                                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                                        aria-hidden="true"
                                    />
                                )}
                                {isSaving ? '저장 중...' : isModifyMode ? '변경사항 저장' : '후보 목록 저장'}
                            </button>
                        </div>
                    </section>
                </div>
            ) : (
                <div>
                    <NotCreateWorldCupLogo />
                </div>
            )}
        </div>
    );
};

export default WorldCupContentsManageListWrapper;
