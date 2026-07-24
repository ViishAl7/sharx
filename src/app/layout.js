// src/app/layout.js

import "./globals.css";
import Providers from "./providers";
import { Nunito, Righteous } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const righteous = Righteous({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-righteous",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://sharx.in"),
  title: {
    default: "Play Free Online Games | Sharx",
    template: "%s | Sharx",
  },
  description: "Play thousands of free online games instantly on Sharx. No downloads, no sign-up. Enjoy action, racing, puzzle, sports, arcade and multiplayer games for free.",
  applicationName: "Sharx",
  authors: [{ name: "Sharx", url: "https://sharx.in" }],
  creator: "Sharx",
  publisher: "Sharx",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    url: "https://sharx.in",
    siteName: "Sharx",
    locale: "en_US",
    title: "Play Free Online Games | Sharx",
    description: "Play thousands of free online games instantly. No downloads, no sign-up.",
    images: [{ url: "/sharx.png", width: 1200, height: 630, alt: "Sharx - Free Online Games" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Free Online Games | Sharx",
    description: "Play thousands of free online games instantly. No downloads, no sign-up.",
    images: ["/sharx.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Sharx",
  url: "https://sharx.in",
  description: "Play thousands of free online games instantly. No downloads or sign-up required.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://sharx.in/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "Sharx",
    url: "https://sharx.in",
    logo: { "@type": "ImageObject", url: "https://sharx.in/sharx.png" },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nunito.variable} ${righteous.variable}`}>
      <head>
        {/* ✅ LCP Optimization: Preload first image */}
        <link
          rel="preload"
          as="image"
          href="https://img.gamemonetize.com/6mek3ap987nyfmx3lfoylxoljcndxsz7/512x384.jpg"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}