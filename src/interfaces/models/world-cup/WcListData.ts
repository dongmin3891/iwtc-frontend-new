export interface WCListDataType {
    reftContentName: string;
    rightContentName: string;
    description: string;
    // reftImgPath: string;
    // rightImgPath: string;
    worldCupId: number;
    gameTitle: string;
    reftImgMediaFileNo: number;
    rightImgMediaFileNo: number;
}

export interface WCListViewData extends Omit<WCListDataType, 'reftImgMediaFileNo' | 'rightImgMediaFileNo'> {
    reftImgMediaFileNo: string;
    reftFileType: string;
    reftVideoStartTime?: string;
    reftVideoPlayDuration?: number;
    reftSourceProvider?: string | null;
    reftSourceUrl?: string | null;
    reftSourceAuthor?: string | null;
    reftSourceAuthorUrl?: string | null;
    rightImgMediaFileNo: string;
    rightFileType: string;
    rightVideoStartTime?: string;
    rightVideoPlayDuration?: number;
    rightSourceProvider?: string | null;
    rightSourceUrl?: string | null;
    rightSourceAuthor?: string | null;
    rightSourceAuthorUrl?: string | null;
}

interface WCListApiItem {
    contentsName1: string;
    contentsName2: string;
    description: string;
    mediaFileId1: number;
    mediaFileId2: number;
    worldCupId: number;
    title: string;
}

export interface WCListPageable {
    pageNumber: number;
    pageSize: number;
}

export interface WCListApiPage {
    totalElements: number;
    content?: WCListApiItem[];
    pageable: WCListPageable;
    totalPages: number;
}

export interface WCListApiEnvelope {
    data: WCListApiPage;
}

export interface WCListParent {
    totalPage: number;
    totalCount: number;
    list: WCListDataType[];
    pageable: WCListPageable;
}

export interface WCListViewPage extends Omit<WCListParent, 'list'> {
    list: WCListViewData[];
}

export const loadWCListData = (data: WCListApiPage): WCListParent => {
    return {
        totalCount: data.totalElements,
        list: (data.content || []).map(mapWCListData),
        pageable: data.pageable,
        totalPage: data.totalPages,
    };
};

export const mapWCListData = (data: WCListApiItem): WCListDataType => {
    return {
        reftContentName: data.contentsName1,
        rightContentName: data.contentsName2,
        description: data.description,
        reftImgMediaFileNo: data.mediaFileId1,
        rightImgMediaFileNo: data.mediaFileId2,
        // reftImgPath: data.filePath1,
        // rightImgPath: data.filePath2,
        worldCupId: data.worldCupId,
        gameTitle: data.title,
    };
};
