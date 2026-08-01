import type { NextConfig } from "next";

const API_BACKEND_URL = process.env.API_BACKEND_URL || "http://localhost:8000";
const POSTHOG_HOST = (process.env.POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/+$/, '');
const POSTHOG_REWRITE_HOST = POSTHOG_HOST.replace(/^https?:\/\//, '');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
      { protocol: "https", hostname: "*.algokube.dev" },
      { protocol: "https", hostname: "*.algokube.com" },
      { protocol: "https", hostname: "*.algokube.in" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BACKEND_URL}/api/:path*`,
      },
      {
        source: "/ingest/static/:path*",
        destination: `https://${POSTHOG_REWRITE_HOST}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `https://${POSTHOG_REWRITE_HOST}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;
