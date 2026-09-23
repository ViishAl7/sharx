import TermsClient from "./page-client";

export const metadata = {
  title: "Terms of Service | SHARX",
  description:
    "Plain & fair terms for using SHARX. Eligibility, user conduct, third-party games and ads, liability, and how to reach our Grievance Officer.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | SHARX",
    description:
      "Plain & fair terms for using SHARX. Clear rules, clear disclosures.",
    type: "website",
  },
};

export default function TermsPage() {
  return <TermsClient />;
}