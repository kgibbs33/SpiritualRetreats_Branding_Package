import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Find your retreat",
  description: "Answer a few questions and we will help match you with a spiritual retreat that fits what you are looking for.", alternates: { canonical: canonicalUrl("/retreat-discovery-form") },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
