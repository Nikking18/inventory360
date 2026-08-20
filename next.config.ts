import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://storage.ko-fi.com https://ko-fi.com https://*.ko-fi.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://storage.ko-fi.com https://ko-fi.com https://*.ko-fi.com;
      img-src 'self' data: blob: https://picsum.photos https://images.unsplash.com https://www.google-analytics.com https://www.googletagmanager.com https://img.shields.io https://storage.ko-fi.com https://ko-fi.com https://*.ko-fi.com;
      font-src 'self' data: https://fonts.gstatic.com https://storage.ko-fi.com https://ko-fi.com https://*.ko-fi.com;
      connect-src 'self' blob: data: https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://storage.ko-fi.com https://ko-fi.com https://*.ko-fi.com;
      media-src 'self' blob: data:;
      worker-src 'self' blob:;
      frame-src 'self' https://ko-fi.com https://*.ko-fi.com https://docs.google.com https://*.google.com;
      frame-ancestors 'self';
      form-action 'self' https://docs.google.com https://*.google.com https://ko-fi.com;
      base-uri 'self';
    `.replace(/\s{2,}/g, ' ').trim(),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, { dev }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
