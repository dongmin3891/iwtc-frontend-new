import { BASE_URL, MEMBER_URL } from '@/consts';
import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
    RawAxiosRequestHeaders,
} from 'axios';
import { localStorageClear } from '@/stores/LocalStore';
import { removeToken, setToken } from '@/utils/TokenManager';
import { hasRetryableUnauthorizedRequest } from './axiosError';

interface ApiEnvelope<T> {
    code: number;
    message: string;
    data: T;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

const instance = axios.create({
    baseURL: `${BASE_URL}api/`,
    timeout: 10000,
    headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

const requestNewAccessToken = (): Promise<string> => {
    if (!refreshPromise) {
        refreshPromise = axios
            .post<ApiEnvelope<{ newAccessToken: string }>>(`${MEMBER_URL}api/new-access-token`, undefined, {
                timeout: 5000,
                withCredentials: true,
            })
            .then((response) => response.data.data.newAccessToken)
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

const clearClientAuth = () => {
    removeToken();
    if (typeof window !== 'undefined') {
        localStorageClear();
    }
};

const isPublicAuthRequest = (url?: string) =>
    Boolean(
        url?.includes('/members/sign-in') ||
            url?.includes('/members/sign-up') ||
            url?.includes('/new-access-token')
    );

instance.interceptors.request.use(
    (config) => {
        if (config.url?.includes('member')) {
            // 'member'가 포함된 경우 MEMBER_BASE_URL 사용
            config.baseURL = `${MEMBER_URL}api/`;
        } else {
            // 그렇지 않은 경우 기본 BASE_URL 사용
            config.baseURL = `${BASE_URL}api/`;
        }
        return config;
    },
    (error: unknown) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.status === 200 || response.status === 201) {
            return response;
        } else if (response.status === 204) {
            return response;
        } else {
            if (response.status === 401) {
                // common error
            }
            return Promise.reject(response.data);
        }
    },
    async (error: AxiosError) => {
        if (hasRetryableUnauthorizedRequest(error)) {
            const config = error.config as RetryableRequestConfig;
            if (config._retry || isPublicAuthRequest(config.url)) {
                return Promise.reject(error);
            }

            config._retry = true;
            try {
                const newAccessToken = await requestNewAccessToken();
                setToken(newAccessToken);
                config.headers['access-token'] = newAccessToken;
                return instance.request(config);
            } catch {
                clearClientAuth();
                if (typeof window !== 'undefined') {
                    window.alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                    if (window.location.pathname !== '/sign-in') {
                        window.location.assign('/sign-in');
                    }
                }
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export const ajaxGet = async <T = unknown>(subUrl: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return instance.get(subUrl, config);
};

export const ajaxPost = async <T = unknown, D = unknown>(
    subUrl: string,
    data?: D,
    config?: AxiosRequestConfig<D>
): Promise<AxiosResponse<T>> => {
    if (config) {
        return instance.post(subUrl, data, config);
    }
    return instance.post(subUrl, data);
};

export const ajaxPut = async <T = unknown, D = unknown>(
    subUrl: string,
    data: D,
    config?: AxiosRequestConfig<D>
): Promise<AxiosResponse<T>> => {
    return instance.put(subUrl, data, config);
};

export const ajaxDelete = async <T = unknown>(
    subUrl: string,
    data: unknown = {},
    headers?: RawAxiosRequestHeaders
): Promise<AxiosResponse<T>> => {
    return instance.delete(subUrl, { data, headers });
};
