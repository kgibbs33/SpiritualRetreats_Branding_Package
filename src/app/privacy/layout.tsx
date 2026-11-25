import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Light Path Retreats collects, uses and protects your personal information.", alternates: { canonical: canonicalUrl("/privacy") },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
