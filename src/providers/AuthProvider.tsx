'use client';

import type { userInfo as UserInfo } from '@/interfaces/models/login/MemberData';
import { localStorageClear, setUserInfo } from '@/stores/LocalStore';
import { getAccessToken, removeToken } from '@/utils/TokenManager';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

interface AuthContextValue {
    isLoggedIn: boolean;
    user: UserInfo | null;
    login: (user: UserInfo) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
    isLoggedIn: false,
    user: null,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        const loginCheck = async () => {
            try {
                const { refreshAccessToken } = await import('@/services/BaseService');
                const accessToken = getAccessToken() || (await refreshAccessToken());
                const { userMeSummary } = await import('@/services/MemberService');
                const response = await userMeSummary(accessToken);
                setUserInfo(response.data);
                setUser(response.data);
                setIsLoggedIn(true);
            } catch {
                removeToken();
                localStorageClear();
                setUser(null);
                setIsLoggedIn(false);
            }
        };

        void loginCheck();
    }, []);

    const login = (authenticatedUser: UserInfo) => {
        setUser(authenticatedUser);
        setIsLoggedIn(true);
    };

    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
    };

    return <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
