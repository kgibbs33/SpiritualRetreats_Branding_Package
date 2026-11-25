import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with Light Path Retreats with a question, partnership idea or general enquiry.", alternates: { canonical: canonicalUrl("/contact") },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
