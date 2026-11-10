const isDevelopment = process.env.NODE_ENV === 'development';

const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''} https://static.cloudflareinsights.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://media.iwtc.ddongmy.com https://picsum.photos https://i.ytimg.com",
    "media-src 'self' blob: https://media.iwtc.ddongmy.com",
    `connect-src 'self' https://api.iwtc.ddongmy.com https://cloudflareinsights.com${
        isDevelopment ? ' http://localhost:3001 ws://localhost:*' : ''
    }`,
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
    {
        key: 'Content-Security-Policy',
        value: contentSecurityPolicy,
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'X-Frame-Options',
        value: 'DENY',
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    },
    ...(isDevelopment
        ? []
        : [
              {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains',
              },
          ]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders,
            },
        ];
    },
    images: {
        minimumCacheTTL: 86400,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.youtube.com',
                pathname: '/**',
            },
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
