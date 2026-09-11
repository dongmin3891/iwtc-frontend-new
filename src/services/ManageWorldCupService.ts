import { ajaxDelete, ajaxGet, ajaxPost, ajaxPut } from "./BaseService";
import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/TokenManager";
import { manageWorldCupQueryKeys } from "@/lib/react-query/queryKeys";
import { PersistedManagedContent } from "@/domain/manage/persistedContent";
import {
  CreateWorldCupContentRequest,
  UpdateWorldCupContentRequest,
} from "@/domain/manage/content";

interface CreateWorldCupRequest {
  title: string;
  description: string;
  visibleType: string;
  token: string;
}

interface CreateWorldCupResponse {
  data: number;
}

interface CreateStaticWorldCupContentResponse {
  data: number;
}

interface DeleteMyWorldCupRequest {
  worldCupId: number;
  token: string;
}

export interface ManagedWorldCupSummary {
  worldCupId: number;
  title: string;
  description: string;
  visibleType: string;
}

interface ManagedWorldCupListResponse {
  data: ManagedWorldCupSummary[];
}

interface ManagedWorldCupDetailResponse {
  data: ManagedWorldCupSummary;
}

interface ManagedWorldCupContentsResponse {
  data: PersistedManagedContent[];
}

const createHeader = (token: string) => {
  return {
    "Content-Type": "application/json",
    "access-token": `${token}`,
  };
};

// 이상형 생성
export const createWorldCup = async ({
  title,
  description,
  visibleType,
  token,
}: CreateWorldCupRequest) => {
  const authHeaders = createHeader(token);

  const param = { title, description, visibleType };
  const response = await ajaxPost<CreateWorldCupResponse, typeof param>(
    `/me/game-manage/world-cups`,
    param,
    {
      headers: authHeaders,
    },
  );
  return response.data;
};

// 이상형 컨텐츠 생성
export const createWorldCupContents = async ({
  worldCupId,
  params,
  token,
}: {
  worldCupId: number;
  params: CreateWorldCupContentRequest[];
  token: string;
}) => {
  const authHeaders = createHeader(token);

  const requestBody = { data: params };
  const response = await ajaxPost<void, typeof requestBody>(
    `/me/game-contents-manage/world-cups/${worldCupId}/contents`,
    requestBody,
    { headers: authHeaders },
  );

  return response.data;
};

export const createStaticWorldCupContent = async ({
  worldCupId,
  contentsName,
  visibleType,
  file,
  token,
}: {
  worldCupId: number;
  contentsName: string;
  visibleType: string;
  file: File;
  token: string;
}) => {
  const formData = new FormData();
  formData.append("contentsName", contentsName);
  formData.append("visibleType", visibleType);
  formData.append("file", file);

  const response = await ajaxPost<
    CreateStaticWorldCupContentResponse,
    FormData
  >(
    `/me/game-contents-manage/world-cups/${worldCupId}/contents/static`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "access-token": token,
      },
      timeout: 15000,
    },
  );

  return response.data;
};

// 이상형 리스트 조회
export const getMyWorldCupList = async (token: string) => {
  const authHeaders = createHeader(token);

  const response = await ajaxGet<ManagedWorldCupListResponse>(
    "/me/game-manage/world-cups",
    {
      headers: authHeaders,
      timeout: 5000,
    },
  );

  return response;
};

export const useQueryGetMyWorldCupList = (token: string) => {
  return useQuery(
    manageWorldCupQueryKeys.lists(),
    () => getMyWorldCupList(token),
    {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: 3000,
      enabled: !!token,
    },
  );
};

// 내가 만든 이상형 월드컵 조회
export const getMyWorldCup = async (worldCupId: number) => {
  const authHeaders = createHeader(getAccessToken());

  const response = await ajaxGet<ManagedWorldCupDetailResponse>(
    `/me/game-manage/world-cups/${worldCupId}`,
    {
      headers: authHeaders,
      timeout: 5000,
    },
  );

  return response;
};

export const useQueryGetMyWorldCup = (worldcupId: number) => {
  return useQuery(
    manageWorldCupQueryKeys.detail(worldcupId),
    () => getMyWorldCup(worldcupId),
    {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: 3000,
      enabled: !!worldcupId,
    },
  );
};

// 이상형 컨텐츠 리스트 조회
export const getMyWorldCupContentsList = async (worldCupId: number) => {
  const authHeaders = createHeader(getAccessToken());

  const response = await ajaxGet<ManagedWorldCupContentsResponse>(
    `/me/game-contents-manage/world-cups/${worldCupId}/manage-contents`,
    {
      headers: authHeaders,
      timeout: 5000,
    },
  );

  return response;
};

export const useQueryGetMyWorldCupContentsList = (worldcupId: number) => {
  return useQuery(
    manageWorldCupQueryKeys.contents(worldcupId),
    () => getMyWorldCupContentsList(worldcupId),
    {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: 0,
      enabled: !!worldcupId,
    },
  );
};

// 이상형 컨텐츠 1건 수정
export const updateMyWorldCupContents = async (
  worldCupId: number,
  contentsId: number,
  params: UpdateWorldCupContentRequest,
  token: string,
) => {
  const authHeaders = createHeader(token);

  const response = await ajaxPut<void, UpdateWorldCupContentRequest>(
    `/me/game-contents-manage/world-cups/${worldCupId}/contents/${contentsId}`,
    params,
    {
      headers: authHeaders,
      timeout: 5000,
    },
  );

  if (response) {
    return response;
  }
};

export const updateStaticWorldCupContent = async ({
  worldCupId,
  contentsId,
  contentsName,
  visibleType,
  file,
  token,
}: {
  worldCupId: number;
  contentsId: number;
  contentsName: string;
  visibleType: string;
  file?: File;
  token: string;
}) => {
  const formData = new FormData();
  formData.append("contentsName", contentsName);
  formData.append("visibleType", visibleType);
  if (file) {
    formData.append("file", file);
  }

  return ajaxPut<void, FormData>(
    `/me/game-contents-manage/world-cups/${worldCupId}/contents/${contentsId}/static`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "access-token": token,
      },
      timeout: 15000,
    },
  );
};

// 이상형 컨텐츠 1건 삭제
export const removeMyWorldCupContents = async (
  worldCupId: number,
  contentsId: number,
  token: string,
) => {
  const authHeaders = createHeader(token);

  const response = await ajaxDelete<void>(
    `/me/game-contents-manage/world-cups/${worldCupId}/contents/${contentsId}`,
    null,
    authHeaders,
  );

  if (response) {
    return response;
  }
};

// 나의 이상형 월드컵 리스트에서 삭제
export const deleteMyWorldCup = async ({
  worldCupId,
  token,
}: DeleteMyWorldCupRequest) => {
  const authHeaders = createHeader(token);
  const response = await ajaxDelete<void>(
    `/me/game-manage/world-cups/${String(worldCupId)}`,
    null,
    authHeaders,
  );

  if (response) {
    return response;
  }
};
