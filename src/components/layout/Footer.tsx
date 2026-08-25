import Image from "next/image";
import Link from "next/link";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";

const exploreLinks = [
  { href: "/find-your-retreat", label: "Find Your Retreat" },
  { href: "/retreat-listings", label: "Retreat Listings" },
];

const createLinks = [
  { href: "/for-retreat-owners", label: "For Retreat Owners" },
  { href: "/make-your-retreat", label: "Make Your Retreat" },
  { href: "/facilitators-portal", label: "Facilitators" },
];

const companyLinks = [
  { href: "/why-work-with-us", label: "Why work with us" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/cookies", label: "Cookie Policy" },
];

const socialLinks = [
  {
    href: "https://instagram.com/retreatyourself",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-[18px]" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "https://facebook.com/retreatyourself",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    href: "https://pinterest.com/retreatyourself",
    label: "Pinterest",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.852 0 1.265.64 1.265 1.408 0 .858-.546 2.141-.828 3.33-.236.995.499 1.806 1.476 1.806 1.771 0 2.993-2.27 2.993-4.964 0-2.05-1.388-3.484-3.37-3.484-2.294 0-3.641 1.72-3.641 3.499 0 .617.237 1.278.532 1.639a.213.213 0 0 1 .049.205c-.054.225-.174.714-.198.814-.032.13-.107.158-.246.095-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
      </svg>
    ),
  },
  {
    href: "https://youtube.com/@retreatyourself",
    label: "YouTube",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
];

const headingClass =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-forest/70";

const linkClass =
  "inline-flex text-sm text-stone-600 transition-colors duration-150 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2 rounded-sm";

function FooterNavGroup({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
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
      <div className="border-t border-beige bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
          <section
            aria-labelledby="footer-newsletter-heading"
            className="rounded-2xl border border-beige bg-cream/60 px-5 py-8 sm:px-8 sm:py-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14"
          >
            <div className="min-w-0">
              <p className={headingClass}>Stay connected</p>
              <h2
                id="footer-newsletter-heading"
                className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-[1.75rem]"
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
      <div className="border-t border-beige bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-[minmax(0,1.75fr)_repeat(4,minmax(0,1fr))] lg:gap-x-10">
            {/* Brand — full width on mobile, first column on desktop */}
            <div className="col-span-2 lg:col-span-1 lg:max-w-xs">
              <Link
                href="/"
                className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
              >
                <Image
                  src="/images/logo-transparent.png"
                  alt="Re: Treat Yourself"
                  width={914}
                  height={365}
                  className="object-contain object-left"
                  style={{ width: "140px", height: "auto" }}
                />
              </Link>
              <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-stone-600">
                We support transformation, retreat owners, and facilitators —
                human-matched retreats worldwide.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                {socialLinks.map(({ href, label, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-full border border-beige bg-white text-warm-brown shadow-sm transition-all duration-200 hover:border-forest/25 hover:bg-forest/5 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            <FooterNavGroup title="Explore" links={exploreLinks} />
            <FooterNavGroup title="Create" links={createLinks} />
            <FooterNavGroup title="Company" links={companyLinks} />
            <FooterNavGroup title="Legal" links={legalLinks} />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-forest/20 bg-forest text-cream">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p className="text-xs text-cream/80">
            © {year} Landaus Mann Investments Ltd · Vanuatu
          </p>
          <p className="text-xs text-cream/60">
            Platform development by{" "}
            <a
              href="https://innerflect.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-cream/90 underline-offset-2 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
            >
              InnerFlect Tech
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
