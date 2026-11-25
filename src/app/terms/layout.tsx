import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "Choose the agreement for the way you use Light Path Retreats: retreat planner, venue or facilitator terms.", alternates: { canonical: canonicalUrl("/terms") },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
