import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";
import { BRAND_NAME, CTA } from "@/lib/brand";
import { SITE_CONFIG } from "@/config/site";
import { CONTACT_EMAIL, LEGAL_PAGES_VISIBLE } from "@/lib/constants";

const exploreLinks = [
  { href: "/retreat-listings", label: CTA.DISCOVER_RETREATS },
  { href: "/find-your-retreat", label: CTA.FIND_YOUR_PATH },
  { href: "/how-it-works", label: "How It Works" },
];

const communityLinks = [
  { href: "/join-our-community", label: CTA.JOIN_OUR_COMMUNITY },
  { href: "/venue-application", label: "List Your Venue" },
  { href: "/retreat-intake-form", label: CTA.LIST_YOUR_RETREAT },
  { href: "/facilitator-onboarding", label: CTA.CONNECT_AS_FACILITATOR },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = LEGAL_PAGES_VISIBLE
  ? [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/cookies", label: "Cookie Policy" },
    ]
  : [];

const headingClass =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-green/70";

const linkClass =
  "inline-flex text-sm text-stone-600 transition-colors duration-150 hover:text-river-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-green/30 focus-visible:ring-offset-2 rounded-sm";

function FooterNavGroup({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  if (links.length === 0) return null;
  return (
    <nav aria-label={title}>
      <h3 className={headingClass}>{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className={linkClass}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto">
      {/* Newsletter */}
      <div className="border-t border-sage-mist bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
          <section
            aria-labelledby="footer-newsletter-heading"
            className="rounded-2xl border border-sage-mist bg-warm-cream/60 px-5 py-8 sm:px-8 sm:py-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14"
          >
            <div className="min-w-0">
              <p className={headingClass}>Stay connected</p>
              <h2
                id="footer-newsletter-heading"
                className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy sm:text-[1.75rem]"
              >
                Join the global retreat community
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Updates, free retreat opportunities, and new destination
                launches — delivered to your inbox.
              </p>
            </div>
            <div className="mt-6 min-w-0 lg:mt-0 lg:flex lg:flex-col lg:justify-center">
              <NewsletterSignup variant="light" layout="stacked" />
            </div>
          </section>
        </div>
      </div>

      {/* Links */}
      <div className="border-t border-sage-mist bg-warm-cream">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-[minmax(0,1.75fr)_repeat(4,minmax(0,1fr))] lg:gap-x-10">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1 lg:max-w-xs">
              <Link
                href="/"
                className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-green/40 focus-visible:ring-offset-2"
              >
                <BrandLogo variant="emblem" />
              </Link>
              <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-stone-600">
                {SITE_CONFIG.tagline}
              </p>

              {CONTACT_EMAIL ? (
                <p className="mt-4">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-link text-sm font-medium"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </p>
              ) : (
                <p className="mt-4 text-sm text-stone-500">
                  Contact us via the{" "}
                  <Link href="/contact" className="text-link">
                    contact form
                  </Link>
                </p>
              )}
            </div>

            <FooterNavGroup title="Explore" links={exploreLinks} />
            <FooterNavGroup title="Community" links={communityLinks} />
            <FooterNavGroup title="Company" links={companyLinks} />
            <FooterNavGroup title="Legal" links={legalLinks} />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-forest-green/20 bg-forest-green text-warm-cream">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p className="text-xs text-warm-cream/80">
            &copy; {year} {BRAND_NAME}. {SITE_CONFIG.address}
          </p>
        </div>
      </div>
    </footer>
  );
}