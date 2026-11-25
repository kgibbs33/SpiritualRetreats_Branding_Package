import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Register your retreat",
  description: "Tell us about your retreat to be considered for a listing on Light Path Retreats.", alternates: { canonical: canonicalUrl("/retreat-intake-form") },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
