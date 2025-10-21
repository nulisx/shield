import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },

  output: 'standalone',

  // experimental replaced with top-level option
  outputFileTracingRoot: process.cwd(),

  webpack: (config, { isServer }) => {
    // optimize chunks so no single file exceeds 25 MiB
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 24000000, // ~24 MiB
    };

    if (!isServer) {
      // disable source maps for smaller client bundle
      config.devtool = false;
    }

    // force clean cache to avoid huge .next/cache/webpack files
    config.cache = false;

    return config;
  },
};

export default nextConfig;
