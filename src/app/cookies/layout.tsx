import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "How Light Path Retreats uses cookies and similar technologies.", alternates: { canonical: canonicalUrl("/cookies") },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
