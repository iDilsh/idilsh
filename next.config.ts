import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // DO NOT use "standalone" for Vercel - Vercel handles its own output
  // "standalone" is only for Docker/self-hosted deployments
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Empty turbopack config to silence the Turbopack warning in Next.js 16
  turbopack: {},
  // Handle Node.js-only packages that don't work in browser/Vercel edge
  webpack: (config, { isServer }) => {
    // These packages use Node.js native modules and should be excluded from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        canvas: false,
        sharp: false,
      };
    }

    // Externalize Node.js-only packages on server side
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('sharp', 'canvas', 'opencv.js');
      }
    }

    return config;
  },
};

export default nextConfig;
