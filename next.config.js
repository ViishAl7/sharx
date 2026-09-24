// next.config.js

/** @type {import('next').NextConfig} */

const nextConfig = {

  // 📱 Phone / dusre device se dev server test karne ke liye
  allowedDevOrigins: ["10.31.55.92"],

  images: {
    formats: ["image/avif", "image/webp"],

    qualities: [65, 70, 80, 85, 90],

    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536],

    imageSizes: [64, 96, 128, 180, 220, 300, 400],

    minimumCacheTTL: 60 * 60 * 24 * 60,

    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],

    dangerouslyAllowSVG: true,

    contentDispositionType: "inline",
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  compress: true,

  poweredByHeader: false,

  reactStrictMode: true,

  outputFileTracingRoot: process.cwd(),
};

module.exports = nextConfig;