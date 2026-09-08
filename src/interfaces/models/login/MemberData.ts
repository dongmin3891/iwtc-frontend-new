export interface SignUpInfo {
    serviceId: string;
    nickname: string;
    password: string;
}

export interface SignInInfo {
    serviceId: string;
    password: string;
}

export interface userInfo {
    id: number;
    nickname: string;
    serviceId: string;
}

export interface UserSummaryResponse {
    data: userInfo;
}
