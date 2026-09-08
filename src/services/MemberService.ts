import { SignUpInfo, SignInInfo, UserSummaryResponse } from '@/interfaces/models/login/MemberData';
import { ajaxGet, ajaxPost } from './BaseService';

export const userSignUp = async (param: SignUpInfo) => {
    const response = await ajaxPost<void, SignUpInfo>('/members/sign-up', param);
    return response;
};

export const userSignIn = async (param: SignInInfo) => {
    const response = await ajaxPost<void, SignInInfo>('/members/sign-in', param);
    return response;
};

export const userSignOut = async () => {
    const response = await ajaxPost<void>(`/members/sign-out`, undefined, {
        timeout: 5000,
    });
    return response;
};

export const userMeSummary = async (token: string) => {
    const headers = {
        'Content-Type': 'application/json',
        'access-token': `${token}`,
    };
    const response = await ajaxGet<UserSummaryResponse>(`/members/me/summary`, {
        headers: headers,
        timeout: 5000,
    });
    return response.data;
};
