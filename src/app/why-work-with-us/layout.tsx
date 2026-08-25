import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why work with us | Re:Treat Yourself",
  description:
    "Human-matched retreats for seekers, owners, and facilitators — how Re:Treat Yourself supports transformation.",
  alternates: { canonical: "/why-work-with-us" },
};

export default function WhyWorkWithUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
