import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "About us",
  description: "Meet the team behind Light Path Retreats and why we are building a trusted place for spiritual retreats worldwide.", alternates: { canonical: canonicalUrl("/about") },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
