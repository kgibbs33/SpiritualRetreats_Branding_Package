"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const mainNav = [
  { href: "/#search", label: "Find Your Retreat" },
  { href: "/about", label: "About" },
  { href: "/retreat-planners", label: "Retreat Planners" },
];

const otherServices = [
  { href: "/find-a-venue", label: "Find a Venue" },
  { href: "/find-a-facilitator", label: "Find a Facilitator" },
  { href: "/partner-with-us", label: "Partner With Us" },
  { href: "/education", label: "Education" },
];

const linkUnderline =
  "relative shrink-0 whitespace-nowrap px-1 py-2.5 text-[15px] font-semibold tracking-tight text-river-teal transition-colors duration-200 hover:text-forest-green motion-reduce:transition-none 2xl:text-base after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-forest-green after:transition-[width] after:duration-200 motion-reduce:after:transition-none hover:after:w-full after:content-['']";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  // Close dropdown on Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setDropdownOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dropdownOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    queueMicrotask(() => firstMobileLinkRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-stone-900/35 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none xl:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
      />

      <header className="sticky top-0 z-50 border-b border-sage-mist bg-white/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:px-6 sm:py-3.5 xl:flex xl:max-w-[90rem] xl:justify-between xl:gap-x-6 xl:px-8 xl:py-4 2xl:gap-x-10">
          <Link
            href="/"
            className="group relative col-start-2 flex shrink-0 items-center justify-self-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 xl:col-auto xl:justify-self-auto"
          >
            <span className="xl:hidden"><BrandLogo variant="emblem" /></span>
            <span className="hidden xl:inline-flex"><BrandLogo variant="horizontal" /></span>
          </Link>

          <nav className="hidden min-w-0 xl:flex xl:flex-1 xl:items-center xl:justify-center" aria-label="Main">
            <div className="flex max-w-full flex-nowrap items-center justify-center gap-x-4 overflow-x-auto overscroll-x-contain px-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden 2xl:gap-x-6" role="presentation">
              {mainNav.map(({ href, label }) => (
                <Link key={href} href={href} className={linkUnderline}>{label}</Link>
              ))}

              {/* Other Services dropdown */}
              <div ref={dropdownRef} className="relative" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                <button
                  ref={toggleRef}
                  type="button"
                  onClick={() => setDropdownOpen(true)}
                  onKeyDown={(e) => { if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); setDropdownOpen(true); } }}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  className={`${linkUnderline} inline-flex items-center gap-1`}
                >
                  Other Services
                  <svg className="h-3 w-3 opacity-60" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5l3 3 3-3" /></svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 z-50 mt-2 min-w-[180px] rounded-xl border border-sage-mist bg-white p-1.5 shadow-lg">
                    {otherServices.map(({ href, label }) => (
                      <Link key={href} href={href} onClick={() => setDropdownOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-warm-cream hover:text-forest-green">
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/contact" className={linkUnderline}>Contact</Link>
            </div>
          </nav>

          <div className="col-start-3 flex shrink-0 items-center justify-end gap-3 xl:col-auto xl:pl-2">
            <Link
              href="/#search"
              className="hidden rounded-full bg-sacred-gold px-5 py-2.5 text-[15px] font-semibold leading-none text-celestial-navy shadow-sm transition-all motion-reduce:transition-none hover:bg-sacred-gold/90 hover:shadow-md xl:inline-flex"
            >
              Book Your Retreat
            </Link>
            <button
              type="button" onClick={() => setMobileOpen((o) => !o)}
              className="flex h-11 min-h-[44px] min-w-[44px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 xl:hidden"
              aria-expanded={mobileOpen} aria-controls="mobile-nav" aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <span className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-200 motion-reduce:transition-none ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 rounded-full bg-current transition-opacity duration-200 motion-reduce:transition-none ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-200 motion-reduce:transition-none ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav
          id="mobile-nav"
          className={`overflow-hidden border-t border-sage-mist bg-warm-cream transition-[max-height] duration-300 ease-out motion-reduce:transition-none xl:hidden ${
            mobileOpen ? "max-h-[min(85vh,calc(100dvh-5rem))]" : "max-h-0"
          }`}
          aria-label="Mobile" aria-hidden={!mobileOpen}
        >
          <div className="max-h-[min(85vh,calc(100dvh-5rem))] overflow-y-auto overscroll-y-contain px-4 py-5 sm:px-6">
            {mainNav.map(({ href, label }, i) => (
              <Link key={href} ref={i === 0 ? firstMobileLinkRef : undefined} href={href} onClick={() => setMobileOpen(false)}
                className="block min-h-[44px] rounded-lg px-3 py-3 text-[16px] font-semibold leading-snug text-celestial-navy transition-colors hover:bg-warm-cream active:bg-sage-mist">
                {label}
              </Link>
            ))}
            <p className="mt-2 px-3 pt-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">Other Services</p>
            {otherServices.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className="block min-h-[44px] rounded-lg px-3 py-3 text-[15px] font-medium leading-snug text-stone-600 transition-colors hover:bg-warm-cream active:bg-sage-mist">
                {label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setMobileOpen(false)}
              className="block min-h-[44px] rounded-lg px-3 py-3 text-[16px] font-semibold leading-snug text-celestial-navy transition-colors hover:bg-warm-cream active:bg-sage-mist">
              Contact
            </Link>
            <Link href="/#search" onClick={() => setMobileOpen(false)}
              className="mt-3 flex min-h-[48px] items-center justify-center rounded-full bg-sacred-gold py-3.5 text-[16px] font-semibold text-celestial-navy transition-colors hover:bg-sacred-gold/90 active:bg-sacred-gold/80">
              Book Your Retreat
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}