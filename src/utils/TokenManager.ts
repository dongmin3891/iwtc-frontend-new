'use client';
import { Cookies } from 'react-cookie';

const cookies = new Cookies();

export const setToken = (token: string) => {
    cookies.set('ACCESS_TOKEN', token, {
        path: '/',
        sameSite: 'lax',
        secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
    });
};

export const removeToken = () => {
    cookies.remove('ACCESS_TOKEN', { path: '/' });
};

export const getAccessToken = () => {
    return cookies.get('ACCESS_TOKEN');
};
