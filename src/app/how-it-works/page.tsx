"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Role = "seeker" | "owner" | "facilitator";

const roles: { id: Role; label: string; tagline: string; icon: React.ReactNode }[] = [
  {
    id: "seeker",
    label: "I'm looking for a retreat",
    tagline: "Find transformation, not just availability.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
    ),
  },
  {
    id: "owner",
    label: "I run a retreat",
    tagline: "Fill your retreats with the right people.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: "facilitator",
    label: "I'm a facilitator",
    tagline: "Get matched with retreats that need your gift.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

const stepIcons: Record<Role, React.ReactNode[]> = {
  seeker: [
    <svg key="s1" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>,
    <svg key="s2" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>,
    <svg key="s3" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>,
  ],
  owner: [
    <svg key="o1" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>,
    <svg key="o2" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>,
    <svg key="o3" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>,
  ],
  facilitator: [
    <svg key="f1" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>,
    <svg key="f2" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>,
    <svg key="f3" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>,
  ],
};

const steps: Record<
  Role,
  { step: string; title: string; body: string; outcome: string }[]
> = {
  seeker: [
    {
      step: "01",
      title: "Tell us your intention",
      body: "Answer a short, reflective questionnaire — not a filter, a conversation. We ask about what's bringing you to a retreat: burnout, grief, spiritual growth, a reset. Your intention shapes everything.",
      outcome: "Takes 3–5 minutes. No account needed.",
    },
    {
      step: "02",
      title: "We do the searching",
      body: "Our team reviews your profile and hand-matches you with retreats that genuinely fit — location, depth, style, budget. Not ranked by ad spend. Not automated guesswork.",
      outcome: "You receive curated options within 48 hours.",
    },
    {
      step: "03",
      title: "You choose and connect",
      body: "We introduce you directly to the retreat or facilitator. You ask questions, feel it out, and book directly with them. No platform fees on your end. No middleman in the way.",
      outcome: "Your retreat. Your terms. Zero booking fee.",
    },
  ],
  owner: [
    {
      step: "01",
      title: "Submit your retreat",
      body: "Tell us about your space, your programme, and the type of guests you serve best. This takes 15 minutes and gives us everything we need to match you with intention-aligned seekers.",
      outcome: "Listing reviewed within 5 business days.",
    },
    {
      step: "02",
      title: "We send you aligned guests",
      body: "We don't blast your retreat across a directory and hope. We review incoming seeker profiles and hand-select retreats that match. You receive guests who already understand and want what you offer.",
      outcome: "Higher conversion. Fewer mismatches.",
    },
    {
      step: "03",
      title: "You handle your bookings",
      body: "We introduce the seeker to you directly. You manage your own booking process — no locked-in payment processor, no 14% commission. You stay in control of your guest relationship from day one.",
      outcome: "No platform commission. No lock-in.",
    },
  ],
  facilitator: [
    {
      step: "01",
      title: "Share who you are",
      body: "Tell us your modality, your availability, and what kind of retreat environment brings out the best in your work. Yoga teacher, breathwork guide, somatic therapist — we want to understand your gift.",
      outcome: "Free to join. Always.",
    },
    {
      step: "02",
      title: "Get matched with retreats",
      body: "When retreat owners are looking for facilitators with your exact skills — for a specific programme, location, or seasonal offer — we connect you. No cold outreach. No job board scrolling.",
      outcome: "Warm introductions only.",
    },
    {
      step: "03",
      title: "Grow your practice",
      body: "Each match is a relationship, not a transaction. You work directly with the retreat owner. We step back. Your profile stays active and continues attracting future opportunities as the platform grows.",
      outcome: "Build a network. Build a career.",
    },
  ],
};

const differentFrom: { label: string; them: string; us: string }[] = [
  {
    label: "How retreats are matched",
    them: "Algorithm + ad ranking",
    us: "Human curation, intention-first",
  },
  {
    label: "Booking fees",
    them: "14% commission on every booking",
    us: "Zero commission, direct booking",
  },
  {
    label: "Who gets seen",
    them: "Highest bidder / most reviews",
    us: "Best fit for the seeker's intention",
  },
  {
    label: "Facilitator access",
    them: "Paid listings or not included",
    us: "Free matching, always",
  },
  {
    label: "Guest relationship",
    them: "Platform-mediated, anonymous",
    us: "Direct, personal, human",
  },
];

const trustSignals = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Curated, not automated",
    body: "Every match is reviewed by a real person. We don't release retreats or facilitators that haven't been properly onboarded.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "You own the relationship",
    body: "We introduce. You connect. You book. The guest relationship belongs to you — the retreat owner — not to us.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Your data stays yours",
    body: "We collect intention data to match better — not to sell, not to retarget. Your information is held in a private system and used only to serve your journey.",
  },
];

const ctaByRole: Record<
  Role,
  { label: string; href: string; secondary?: { label: string; href: string } }
> = {
  seeker: {
    label: "Start my retreat discovery",
    href: "/retreat-discovery-form",
    secondary: { label: "Browse retreats first", href: "/retreat-listings" },
  },
  owner: {
    label: "List my retreat",
    href: "/retreat-intake-form",
    secondary: { label: "Learn more for owners", href: "/for-retreat-owners" },
  },
  facilitator: {
    label: "Join as a facilitator",
    href: "/facilitator-onboarding",
    secondary: {
      label: "See the facilitators portal",
      href: "/facilitators-portal",
    },
  },
};

export default function HowItWorksPage() {
  const [activeRole, setActiveRole] = useState<Role>("seeker");
  const active = roles.find((r) => r.id === activeRole)!;
  const cta = ctaByRole[activeRole];
  const icons = stepIcons[activeRole];

  return (
    <div className="bg-white">
      {/* Hero with background image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-nature.jpg"
            alt="Peaceful nature retreat"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-stone-900/55" />
        </div>
        <div className="relative px-4 py-24 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-amber-300">
            How it works
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-white sm:text-5xl max-w-2xl mx-auto">
            Transformation starts with the right match.
          </h1>
          <p className="mt-4 mx-auto max-w-xl text-lg text-stone-200">
            We connect seekers, retreat owners, and facilitators — not through
            algorithms, but through intention and human curation.
          </p>
          {/* Quick trust stats */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
            {[
              { value: "48h", label: "Avg. matching time" },
              { value: "0%", label: "Commission taken" },
              { value: "100%", label: "Human-reviewed" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-stone-300 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role selector */}
      <section className="border-b border-stone-100 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-stone-500 mb-6">
          Select who you are to see how it works for you
        </p>
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`flex-1 rounded-xl border px-5 py-4 text-left transition-all ${
                activeRole === role.id
                  ? "border-forest bg-forest/5 shadow-sm"
                  : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={activeRole === role.id ? "text-forest" : "text-stone-400"}>
                  {role.icon}
                </span>
                <span
                  className={`text-sm font-semibold ${activeRole === role.id ? "text-forest" : "text-stone-700"}`}
                >
                  {role.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-stone-500 pl-7">{role.tagline}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Steps — visual flow */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-800">
          {active.tagline}
        </h2>
        <p className="mt-1 text-stone-500 text-sm">Three simple steps.</p>

        {/* Progress connector */}
        <div className="mt-10 flex items-center justify-between mb-8 px-4 sm:px-8">
          {steps[activeRole].map((s, i) => (
            <div key={i} className="flex-1 flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className="h-10 w-10 rounded-full bg-forest/10 flex items-center justify-center text-forest">
                  {icons[i]}
                </div>
                <span className="text-xs font-medium text-stone-400 mt-1">{s.step}</span>
              </div>
              {i < 2 && (
                <div className="flex-1 mx-2 sm:mx-4 h-px bg-gradient-to-r from-forest/30 to-forest/10" />
              )}
            </div>
          ))}
        </div>

        <ol className="space-y-5">
          {steps[activeRole].map((s, i) => (
            <li
              key={i}
              className="flex gap-5 rounded-2xl border border-stone-100 bg-stone-50 p-6 sm:p-7 hover:border-forest/20 hover:bg-stone-50/80 transition-all"
            >
              <div className="shrink-0 flex flex-col items-center gap-2 pt-1">
                <div className="h-9 w-9 rounded-full bg-forest/10 flex items-center justify-center text-forest">
                  {icons[i]}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-300 font-[family-name:var(--font-display)]">
                    {s.step}
                  </span>
                  <h3 className="font-semibold text-stone-800 text-base">{s.title}</h3>
                </div>
                <p className="mt-2 text-stone-600 leading-relaxed text-sm">{s.body}</p>
                <p className="mt-3 text-xs font-medium text-forest bg-forest/8 inline-flex items-center gap-1.5 rounded-full px-3 py-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {s.outcome}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* CTA for current role */}
        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link
            href={cta.href}
            className="rounded-xl bg-forest px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-forest/90 transition-colors"
          >
            {cta.label}
          </Link>
          {cta.secondary && (
            <Link
              href={cta.secondary.href}
              className="text-sm text-stone-500 hover:text-stone-700 underline underline-offset-2"
            >
              {cta.secondary.label}
            </Link>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-stone-100" />

      {/* How we're different */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-widest text-forest">
          vs. the alternatives
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-800">
          Why this is different from everything else you&apos;ve seen.
        </h2>
        <p className="mt-3 text-stone-500 text-sm max-w-xl">
          Most retreat directories are search engines with a booking button. We
          built something different — because transformation deserves better than
          a filtered list.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-stone-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wide w-1/3"></th>
                <th className="px-5 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wide">
                  Other platforms
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-forest uppercase tracking-wide">
                  Light Path Retreats
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {differentFrom.map((row, i) => (
                <tr key={i} className="bg-white">
                  <td className="px-5 py-4 text-stone-600 font-medium text-xs">
                    {row.label}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-stone-400">
                      <svg className="h-3.5 w-3.5 text-red-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {row.them}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-stone-700 font-medium">
                      <svg className="h-3.5 w-3.5 text-forest shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {row.us}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-stone-100" />

      {/* Trust signals */}
      <section className="bg-stone-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest text-forest text-center">
            How we operate
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-800 text-center">
            What you can count on.
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {trustSignals.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border border-stone-100 bg-white p-6 flex flex-col"
              >
                <div className="h-12 w-12 rounded-xl bg-forest/8 flex items-center justify-center text-forest mb-4">
                  {s.icon}
                </div>
                <h3 className="font-semibold text-stone-800 text-sm">{s.title}</h3>
                <p className="mt-2 text-stone-500 text-xs leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA with background image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/meditation-nature.jpg"
            alt="Peaceful meditation in nature"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-stone-900/60" />
        </div>
        <div className="relative px-4 py-24 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
            Ready to take the first step?
          </h2>
          <p className="mt-3 text-stone-200 max-w-sm mx-auto text-sm">
            It takes 3–5 minutes. No account needed. No commitment. Just clarity
            on what you need next.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/retreat-discovery-form"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50 transition-colors"
            >
              Find my retreat
            </Link>
            <Link
              href="/for-retreat-owners"
              className="rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              List a retreat
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
