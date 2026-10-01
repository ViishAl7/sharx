// next.config.js

/** @type {import('next').NextConfig} */

const nextConfig = {
  // 📱 Phone / dusre device se dev server test karne ke liye
  allowedDevOrigins: ["10.161.228.92"],

  // 🔗 Old URLs → new branded URLs (only ONE definition)
  async redirects() {
    return [
      { source: "/about",   destination: "/inside", permanent: true },
      { source: "/contact", destination: "/hello",  permanent: true },
      { source: "/privacy", destination: "/trust",  permanent: true },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [65, 70, 75, 80, 85, 90],
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 180, 220, 300, 400],
    minimumCacheTTL: 60 * 60 * 24 * 60, // 60 days
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

  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;