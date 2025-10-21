import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for Konva canvas module resolution in browser builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        canvas: false,
      };

      // Ensure Konva uses the browser version
      config.externals = config.externals || [];
      config.externals.push({
        'canvas': 'canvas',
      });
    }

    return config;
  },

  // Mark Konva packages as external to server components to prevent SSR issues
  experimental: {
    serverComponentsExternalPackages: ['konva', 'react-konva'],
  },

  // Optimize for production
  swcMinify: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

