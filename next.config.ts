import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  swcMinify: true,
  reactStrictMode: true,

  // Image optimization for Firebase Storage
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },

  // Output configuration for better static optimization
  output: 'standalone',

  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;

