import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why work with us | Light Path Retreats",
  description:
    "Human-matched retreats for seekers, owners, and facilitators — how Light Path Retreats supports transformation.",
  alternates: { canonical: "/why-work-with-us" },
};

export default function WhyWorkWithUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
