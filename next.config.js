/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },
  webpack: (config, { dev, isServer }) => {
    // Disable webpack caching to prevent file system errors
    config.cache = false;
    return config;
  }
};

module.exports = nextConfig;