import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },

  output: 'standalone',

  // output file tracing root to help with standalone output
  outputFileTracingRoot: process.cwd(),

  webpack: (config, { isServer }) => {
    // optimize chunks: split large files to stay below 25 MiB
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 24000000,        // ~24 MiB
      minSize: 20000,           // minimum chunk size
      automaticNameDelimiter: '-', // name delimiter for split chunks
    };

    if (!isServer) {
      // disable source maps for smaller client bundle
      config.devtool = false;

      // placeholder for dynamic imports: dynamically import heavy libs in components
      // example: const HeavyComponent = dynamic(() => import('recharts'), { ssr: false });
    }

    // force clean cache to avoid huge .next/cache/webpack files
    config.cache = false;

    return config;
  },
};

export default nextConfig;
