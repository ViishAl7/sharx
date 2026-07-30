import PrivacyPage from "./PrivacyPage";

const title = "Privacy Policy | Sharx";
const description =
  "Read Sharx's privacy policy to learn how we collect, use, and protect your data while you play free online games.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    type: "website",
    url: "https://sharx.in/privacy",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function Page() {
  return <PrivacyPage />;
}