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

  description:
    "Play thousands of free online games instantly on Sharx. No downloads, no sign-up. Enjoy action, racing, puzzle, sports, arcade and multiplayer games for free.",

  applicationName: "Sharx",

  authors: [
    {
      name: "Sharx",
      url: "https://sharx.in",
    },
  ],

  creator: "Sharx",
  publisher: "Sharx",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
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
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  openGraph: {
    type: "website",
    url: "https://sharx.in",
    siteName: "Sharx",
    locale: "en_US",
    title: "Play Free Online Games | Sharx",
    description:
      "Play thousands of free online games instantly. No downloads, no sign-up. Play anytime on Sharx.",
    images: [
      {
        url: "/sharx.png",
        width: 1200,
        height: 630,
        alt: "Sharx - Free Online Games",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Play Free Online Games | Sharx",
    description:
      "Play thousands of free online games instantly. No downloads, no sign-up.",
    images: ["/sharx.png"],
  },
};