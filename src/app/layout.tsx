import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";

const fontSans = Inter({
  variable: "--font-sans-body",
  subsets: ["latin"],
  display: "swap",
});

const fontDisplay = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/+$/, "") ||
  process.env.APP_URL?.trim()?.replace(/\/+$/, "") ||
  "https://retreatyourself.network";

const siteName = "Re: Treat Yourself";
const defaultTitle = "Re: Treat Yourself | Find Your Retreat";
const defaultDescription =
  "Mind–body–spirit retreat matching for seekers, retreat owners, and facilitators—intention-based onboarding and structured next steps.";
const defaultShareImage = {
  url: "/images/hero-meditation.jpg",
  // SCOPE-095: emit explicit dimensions so social crawlers render the card
  // without a layout shift / fetch. Matches public/images/hero-meditation.jpg.
  width: 1200,
  height: 1395,
  alt: "Re: Treat Yourself — find your retreat",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Re: Treat Yourself",
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    locale: "en_US",
    images: [defaultShareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultShareImage.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontDisplay.variable}`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-[100dvh] flex-col antialiased"
        suppressHydrationWarning
      >
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
