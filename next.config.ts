import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 Standard Prerendering
  cacheComponents: true,
  partialPrefetching: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // For biodata photo uploads
    },
  },

  output: 'standalone',

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "marriagemediausa.com" },
      { protocol: "https", hostname: "**.marriagemediausa.com" },
    ],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers for security & performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' data: blob: https: http:",
              "connect-src 'self' wss: ws: https:",
            ].join("; "),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/uploads/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
