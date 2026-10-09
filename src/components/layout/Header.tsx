"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CTA } from "@/lib/brand";

const mainNav = [
  { href: "/retreat-listings", label: CTA.DISCOVER_RETREATS },
  { href: "/find-your-retreat", label: CTA.FIND_YOUR_PATH },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const linkUnderline =
  "relative shrink-0 whitespace-nowrap px-1 py-2.5 text-[15px] font-semibold tracking-tight text-river-teal transition-colors duration-200 hover:text-forest-green motion-reduce:transition-none 2xl:text-base after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-forest-green after:transition-[width] after:duration-200 motion-reduce:after:transition-none hover:after:w-full after:content-['']";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    queueMicrotask(() => firstMobileLinkRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-stone-900/35 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none xl:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
      />

      <header className="sticky top-0 z-50 border-b border-sage-mist bg-white/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        {/* Mobile: 3-col grid — spacer | centered logo | hamburger. xl+: 3-column grid — logo | centered nav | CTA */}
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:px-6 sm:py-3.5 xl:flex xl:max-w-[90rem] xl:justify-between xl:gap-x-6 xl:px-8 xl:py-4 2xl:gap-x-10">
          <Link
            href="/"
            className="group relative col-start-2 flex shrink-0 items-center justify-self-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 xl:col-auto xl:justify-self-auto"
          >
            <BrandLogo size={56} className="sm:h-[3.5rem] sm:w-[3.5rem]" />
          </Link>

          <nav
            className="hidden min-w-0 xl:flex xl:flex-1 xl:items-center xl:justify-center"
            aria-label="Main"
          >
            <div
              className="flex max-w-full flex-nowrap items-center justify-center gap-x-4 overflow-x-auto overscroll-x-contain px-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden 2xl:gap-x-6"
              role="presentation"
            >
              {mainNav.map(({ href, label }) => (
                <Link key={href} href={href} className={linkUnderline}>
                  {label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="col-start-3 flex shrink-0 items-center justify-end gap-3 xl:col-auto xl:pl-2">
            <Link
              href="/join-our-community"
              className="hidden rounded-full bg-sacred-gold px-6 py-3 text-[15px] font-semibold leading-none text-celestial-navy shadow-sm transition-all motion-reduce:transition-none hover:bg-sacred-gold/90 hover:shadow-md 2xl:px-7 2xl:text-base xl:inline-flex"
            >
              {CTA.JOIN_OUR_COMMUNITY}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-11 min-h-[44px] min-w-[44px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 xl:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <span
                className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-200 motion-reduce:transition-none ${
                  mobileOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-current transition-opacity duration-200 motion-reduce:transition-none ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-200 motion-reduce:transition-none ${
                  mobileOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <nav
          id="mobile-nav"
          className={`overflow-hidden border-t border-sage-mist bg-warm-cream transition-[max-height] duration-300 ease-out motion-reduce:transition-none xl:hidden ${
            mobileOpen ? "max-h-[min(75vh,calc(100dvh-5rem))]" : "max-h-0"
          }`}
          aria-label="Mobile"
          aria-hidden={!mobileOpen}
        >
          <div className="max-h-[min(75vh,calc(100dvh-5rem))] overflow-y-auto overscroll-y-contain px-4 py-5 sm:px-6">
            {mainNav.map(({ href, label }, i) => (
              <Link
                key={href}
                ref={i === 0 ? firstMobileLinkRef : undefined}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block min-h-[44px] rounded-lg px-3 py-3 text-[16px] font-semibold leading-snug text-celestial-navy transition-colors hover:bg-warm-cream active:bg-sage-mist"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/join-our-community"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex min-h-[48px] items-center justify-center rounded-full bg-sacred-gold py-3.5 text-[16px] font-semibold text-celestial-navy transition-colors hover:bg-sacred-gold/90 active:bg-sacred-gold/80"
            >
              {CTA.JOIN_OUR_COMMUNITY}
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}