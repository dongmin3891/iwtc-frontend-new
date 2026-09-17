import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import Header from '@/components/common/Header';
import PexelsCreditFooter from '@/components/common/PexelsCreditFooter';
import PopupProvider from '@/providers/PopupProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    metadataBase: new URL('https://iwtc.ddongmy.com'),
    title: 'IWTC | 이상형 월드컵',
    description: '간편하게 만들고 함께 즐기는 이상형 월드컵',
    icons: {
        icon: '/images/favicon.ico',
    },
    openGraph: {
        title: '나의 이상형이 궁금할 땐?',
        description: '쉽게 게임하고 간편하게 만들어요!',
        url: 'https://iwtc.ddongmy.com',
        siteName: 'IWTC',
        images: [
            {
                url: '/images/metahome.png',
                width: 800,
                height: 400,
            },
        ],
        type: 'website',
    },
};

// 이전 버전의 _app 파일의 역할을 대신함
const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <html lang="ko">
                <body className={inter.className} suppressHydrationWarning={true}>
                    <QueryProvider>
                        <AuthProvider>
                            <PopupProvider>
                                <Header />
                                {children}
                                <PexelsCreditFooter />
                            </PopupProvider>
                        </AuthProvider>
                    </QueryProvider>
                </body>
            </html>
        </>
    );
};

export default RootLayout;
