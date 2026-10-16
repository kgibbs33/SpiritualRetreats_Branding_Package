import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Join Our Community",
  description:
    "Be part of a growing retreat community — as a Retreat Planner, a venue, or a facilitator.",
  alternates: { canonical: "/join-our-community" },
};

const pathways = [
  {
    heading: "Are you a Retreat Planner?",
    body: "List and promote your retreats, reach potential guests, and discover venues and facilitators.",
    cta: "Join as a Retreat Planner",
    href: "/retreat-intake-form",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
        <path d="M12 6a10 10 0 0 0-7.07 13.16" />
        <path d="M12 6a10 10 0 0 1 7.07 13.16" />
        <path d="M2.5 12.5h19" />
      </svg>
    ),
  },
  {
    heading: "Do you own or manage a retreat venue?",
    body: "Showcase your property to Retreat Planners looking for the right place to host their experience.",
    cta: "List Your Venue",
    href: "/venue-application",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-6h6v6" />
        <path d="M9 10h.01M15 10h.01" />
      </svg>
    ),
  },
  {
    heading: "Are you a facilitator?",
    body: "Showcase your skills and expertise to Retreat Planners looking for professionals to contribute to their programmes.",
    cta: "Join as a Facilitator",
    href: "/facilitator-onboarding",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
        <path d="M12 2v2M12.5 21h8l-2.5-6h-8.5" />
      </svg>
    ),
  },
];

export default function JoinOurCommunityPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-warm-cream py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-celestial-navy sm:text-4xl lg:text-5xl">
              Be part of a growing retreat community.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">
              Whatever your role, there is a way to join — and a community
              ready to meet you.
            </p>
          </div>
        </div>
      </section>

      {/* Pathway cards */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-3">
            {pathways.map(({ heading, body, cta, href, icon }) => (
              <div
                key={href}
                className="flex flex-col rounded-2xl border border-sage-mist bg-white p-6 sm:p-8"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-sage-mist text-river-teal">
                  {icon}
                </div>
                <h2 className="mt-5 text-xl font-semibold text-celestial-navy">
                  {heading}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600 sm:text-base">
                  {body}
                </p>
                <Link
                  href={href}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-sacred-gold px-6 text-base font-semibold text-celestial-navy shadow-sm transition-all hover:bg-sacred-gold/90 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-river-teal focus-visible:ring-offset-2"
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}