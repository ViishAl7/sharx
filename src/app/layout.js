// src/app/layout.js
import "./globals.css";
import Providers from "./providers";
import { Nunito, Righteous, Comfortaa } from "next/font/google";
import Script from "next/script";

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

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-comfortaa",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://sharx.in"),
  title: {
    default: "Crayon Sharx - Free Online Games, Play Now",
    template: "%s | Sharx",
  },
  description:
    "Free games at Sharx — colorful fun, hand-drawn for you. Explore action, racing, puzzle, sports, arcade and multiplayer games, all free to play instantly.",
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
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    url: "https://sharx.in",
    siteName: "Sharx",
    locale: "en_US",
    title: "Crayon Sharx - Free Online Games, Play Now",
    description: "Free games at Sharx — colorful fun, hand-drawn for you.",
    images: [
      {
        url: "/sharx-logo.webp",
        width: 1200,
        height: 630,
        alt: "Sharx - Free Online Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crayon Sharx - Free Online Games, Play Now",
    description: "Free games at Sharx — colorful fun, hand-drawn for you.",
    images: ["/sharx-logo.webp"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Sharx",
  url: "https://sharx.in",
  description: "Free games at Sharx — colorful fun, hand-drawn for you.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://sharx.in/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "Sharx",
    url: "https://sharx.in",
    logo: { "@type": "ImageObject", url: "https://sharx.in/sharx-logo.webp" },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${righteous.variable} ${comfortaa.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Google Analytics — lazyOnload so it never blocks LCP */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z2BF3XNZ72"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z2BF3XNZ72');
          `}
        </Script>

        {/* AdSense — only injects once env var is set */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}