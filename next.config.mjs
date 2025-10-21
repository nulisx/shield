/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },

  // Let Next.js run server code on Edge functions
  experimental: {
    runtime: 'edge',
  },

  webpack: (config) => {
    config.devtool = false; // smaller build
    return config;
  },
};

export default nextConfig;
