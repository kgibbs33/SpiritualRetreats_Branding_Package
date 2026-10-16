import type { Metadata } from "next";
import { EB_Garamond, Lato } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { BRAND_NAME, BRAND_MOTTO, SHORT_DESCRIPTION } from "@/lib/brand";

// ── Fonts: EB Garamond (headings) + Lato (body / nav / buttons / forms) ──

const fontDisplay = EB_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const fontSans = Lato({
  variable: "--font-sans-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// ── Metadata ──────────────────────────────────────────────────────────────

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/+$/, "") ||
  "https://lightpathretreats.com";

const defaultTitle = `${BRAND_NAME} | ${BRAND_MOTTO}`;

const defaultShareImage = {
  url: "/brand/og-share.png",
  width: 1200,
  height: 630,
  alt: BRAND_NAME,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${BRAND_NAME}`,
  },
  description: SHORT_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    title: defaultTitle,
    description: SHORT_DESCRIPTION,
    locale: "en_US",
    images: [defaultShareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: SHORT_DESCRIPTION,
    images: [defaultShareImage.url],
  },
  // Canonical declared per-page; no layout-level fallback
};

// ── Root layout ───────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable}`}
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