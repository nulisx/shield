/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },

  // === prevents huge webpack cache files ===
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  output: 'standalone', // smaller deployable output
  webpack: (config, { isServer }) => {
    // prevents splitting giant chunks
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 25000000, // 25 MB max per chunk
    };
    return config;
  },
};

export default nextConfig;
