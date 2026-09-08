'use client';

import { userMeSummary } from '@/services/MemberService';
import type { userInfo as UserInfo } from '@/interfaces/models/login/MemberData';
import { getUserInfo, localStorageClear, setUserInfo } from '@/stores/LocalStore';
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
            const accessToken = getAccessToken();
            if (!accessToken) {
                setIsLoggedIn(false);
                setUser(null);
                return;
            }

            try {
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

        if (getAccessToken() && getUserInfo()) {
            void loginCheck();
        } else {
            setIsLoggedIn(false);
        }
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
