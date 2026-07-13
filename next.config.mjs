/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.gamemonetize.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    qualities: [50, 65, 75],
  },
};

export default nextConfig;