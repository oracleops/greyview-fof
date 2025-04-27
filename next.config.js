/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },
  webpack: (config) => {
    // Disable webpack caching to prevent file system errors
    config.cache = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      bufferutil: false,
      'utf-8-validate': false,
    };
    return config;
  }
};

module.exports = nextConfig;