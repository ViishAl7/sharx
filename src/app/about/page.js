import AboutUs from "./AboutUs";

const title = "About Us | Sharx";
const description =
  "Learn about Sharx — a free online games platform with thousands of instant-play games. No downloads, no sign-up.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "website",
    url: "https://sharx.in/about",
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
  return <AboutUs />;
}