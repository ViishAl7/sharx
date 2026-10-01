// src/app/robots.js
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/login",
          "/signup",
          "/forgot-password",
        ],
      },
    ],
    sitemap: "https://sharx.in/sitemap.xml",
    host: "https://sharx.in",
  };
}