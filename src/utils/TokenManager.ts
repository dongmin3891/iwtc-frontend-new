'use client';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
let accessToken = '';

const clearLegacyBrowserStorage = () => {
    if (typeof document !== 'undefined') {
        document.cookie = `${ACCESS_TOKEN_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
    }
    if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
};

export const setToken = (token: string) => {
    accessToken = token;
    clearLegacyBrowserStorage();
};

export const removeToken = () => {
    accessToken = '';
    clearLegacyBrowserStorage();
};

export const getAccessToken = (): string => accessToken;
