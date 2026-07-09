/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.gamemonetize.com",
      },
      {
        protocol: "https",
        hostname: "html5.gamemonetize.com",
      },
    ],
  },
};

export default nextConfig;