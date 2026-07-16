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
  title: "Play Free Games | Sharx",
  description:
    "Play free online games instantly. No downloads, no sign-up. Racing, action, puzzle, sports and more.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nunito.variable} ${righteous.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}