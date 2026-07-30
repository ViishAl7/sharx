import Contact from "./Contact";

const title = "Contact Us | Sharx";
const description =
  "Get in touch with the Sharx team — questions, feedback, or partnership inquiries. We usually reply within a day.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    type: "website",
    url: "https://sharx.in/contact",
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
  return <Contact />;
}