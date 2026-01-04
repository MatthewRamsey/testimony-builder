/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    // Optimize webpack cache configuration
    // The "Serializing big strings" warning is informational and doesn't affect functionality
    // It occurs when webpack caches large source maps or chunks
    if (config.cache) {
      config.cache = {
        ...config.cache,
        compression: 'gzip',
        maxMemoryGenerations: 1,
      }
    }

    return config
  },
}

module.exports = nextConfig


