/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['picsum.photos', 'www.youtube.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'media.iwtc.ddongmy.com',
                pathname: '/iwtc/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '9000',
                pathname: '/iwtc/**',
            },
        ],
    },
    output: 'standalone',
    trailingSlash: false,
    reactStrictMode: true,
};

module.exports = nextConfig;
