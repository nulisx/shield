import { join } from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },

  output: 'standalone',

  experimental: {
    // instead of __dirname, just use process.cwd() as root
    outputFileTracingRoot: process.cwd(),
  },

  webpack: (config, { isServer }) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 25000000, // 25 MiB max per chunk
    };

    if (!isServer) {
      config.devtool = false; // disables source maps for smaller client JS
    }

    return config;
  },
};

export default nextConfig;
