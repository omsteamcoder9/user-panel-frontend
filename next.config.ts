// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
    // Optional: Disable image optimization in development
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig