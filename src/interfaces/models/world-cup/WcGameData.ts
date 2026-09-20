export interface WorldCupRoundData {
    worldCupTitle: string;
    rounds: number[];
}

export interface WorldCupRoundResponse {
    data: WorldCupRoundData;
}

export interface WorldCupGameContent {
    contentsId: number;
    mediaFileId: number | null;
    mediaFile?: ManagedMediaFile | null;
    name: string;
    internetMovieStartPlayTime?: string;
    videoPlayDuration?: number;
}

export interface WorldCupGameResponse {
    data: {
        contentsList: WorldCupGameContent[];
    };
}

export interface WorldCupClearContent {
    contentsId: number;
    contentsName: string;
    mediaFileId: number | null;
    mediaFile?: ManagedMediaFile | null;
    rank: number;
}

export interface WorldCupClearResponse {
    data: WorldCupClearContent[];
}

export interface WorldCupRankContent {
    contentsId: number;
    contentsName: string;
    mediaFileId: number | null;
    mediaFile?: ManagedMediaFile | null;
    gameRank: number;
    gameScore: number;
}

export interface WorldCupRankResponse {
    data: WorldCupRankContent[];
}
import { ManagedMediaFile } from '@/domain/manage/persistedContent';
