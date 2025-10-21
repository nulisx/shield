/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint and TypeScript errors during build
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Images won’t be optimized by Next.js (smaller output)
  images: { unoptimized: true },

  // === Smaller deployable output for Cloudflare Pages ===
  output: 'standalone',

  // experimental setting to trace files properly
  experimental: {
    outputFileTracingRoot: __dirname,
  },

  // webpack adjustments to split large chunks
  webpack: (config, { isServer }) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 25000000, // 25 MiB max per chunk
    };

    // optional: disable source maps for client (smaller files)
    if (!isServer) {
      config.devtool = false;
    }

    return config;
  },
};

export default nextConfig;
