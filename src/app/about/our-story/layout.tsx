import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Our story",
  description: "Why Light Path Retreats exists, and how we are connecting retreat guests, planners, venues and facilitators.", alternates: { canonical: canonicalUrl("/about/our-story") },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
