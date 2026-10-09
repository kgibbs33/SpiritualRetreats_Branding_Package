"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IconYoga,
  IconLotus,
  IconBreath,
  IconSoundWave,
  IconBody,
  IconSparkles,
} from "@/components/ui/icons/retreat-icons";

type Modality =
  | "All"
  | "Yoga"
  | "Meditation"
  | "Breathwork"
  | "Sound Healing"
  | "Somatic"
  | "Mindfulness";

type Format = "All" | "Residential" | "Day Programme" | "Online" | "Hybrid";

interface Opportunity {
  id: number;
  title: string;
  retreat: string;
  location: string;
  dates: string;
  format: Format;
  modality: Modality;
  spotsNeeded: number;
  compensation: string;
  tags: string[];
  urgent?: boolean;
}

const opportunities: Opportunity[] = [
  {
    id: 1,
    title: "Yoga & Breathwork Facilitator",
    retreat: "Casa Serena Retreat",
    location: "Alentejo, Portugal",
    dates: "Jun 14–21, 2026",
    format: "Residential",
    modality: "Yoga",
    spotsNeeded: 1,
    compensation: "Accommodation + €400",
    tags: ["Morning sessions", "Group of 12", "7 nights"],
    urgent: true,
  },
  {
    id: 2,
    title: "Meditation Guide",
    retreat: "The Grove Wellbeing",
    location: "Wicklow, Ireland",
    dates: "Jul 4–7, 2026",
    format: "Residential",
    modality: "Meditation",
    spotsNeeded: 1,
    compensation: "Accommodation + meals + fee",
    tags: ["Weekend retreat", "Group of 8", "All levels"],
  },
  {
    id: 3,
    title: "Breathwork Practitioner",
    retreat: "Luz do Sol",
    location: "Algarve, Portugal",
    dates: "Aug 10–17, 2026",
    format: "Residential",
    modality: "Breathwork",
    spotsNeeded: 2,
    compensation: "€600 + accommodation",
    tags: ["Morning + evening", "International group", "Advanced"],
  },
  {
    id: 4,
    title: "Sound Healing Facilitator",
    retreat: "Stillwater Centre",
    location: "Devon, England",
    dates: "Jun 28–30, 2026",
    format: "Residential",
    modality: "Sound Healing",
    spotsNeeded: 1,
    compensation: "Full accommodation + €350",
    tags: ["Weekend", "Intimate group (6)", "Instruments provided"],
  },
  {
    id: 5,
    title: "Somatic Movement Guide",
    retreat: "Raíces Retiro",
    location: "Granada, Spain",
    dates: "Sep 5–12, 2026",
    format: "Residential",
    modality: "Somatic",
    spotsNeeded: 1,
    compensation: "Accommodation + €500",
    tags: ["Co-facilitation welcome", "Group of 10", "Spanish + English"],
  },
  {
    id: 6,
    title: "Mindfulness & Movement Teacher",
    retreat: "Clarity Space Online",
    location: "Remote",
    dates: "Flexible — ongoing",
    format: "Online",
    modality: "Mindfulness",
    spotsNeeded: 2,
    compensation: "Revenue share 40%",
    tags: ["Flexible schedule", "Global reach", "6-week programme"],
  },
];

const modalities: Modality[] = [
  "All",
  "Yoga",
  "Meditation",
  "Breathwork",
  "Sound Healing",
  "Somatic",
  "Mindfulness",
];

const formats: Format[] = [
  "All",
  "Residential",
  "Day Programme",
  "Online",
  "Hybrid",
];

const modalityIcons: Record<Modality, string> = {
  All: "✦",
  Yoga: "🧘",
  Meditation: "🪷",
  Breathwork: "🌬️",
  "Sound Healing": "🔔",
  Somatic: "🌿",
  Mindfulness: "☀️",
};

// SVG icon + colour palette per modality — used for the card avatar
const modalityAvatars: Record<
  Modality,
  { icon: React.ReactElement; bg: string; fg: string }
> = {
  All:           { icon: <IconSparkles className="h-5 w-5" />, bg: "bg-stone-100",   fg: "text-stone-500" },
  Yoga:          { icon: <IconYoga className="h-5 w-5" />,     bg: "bg-forest/10",   fg: "text-forest" },
  Meditation:    { icon: <IconLotus className="h-5 w-5" />,    bg: "bg-violet-50",   fg: "text-violet-500" },
  Breathwork:    { icon: <IconBreath className="h-5 w-5" />,   bg: "bg-sky-50",      fg: "text-sky-500" },
  "Sound Healing":{ icon: <IconSoundWave className="h-5 w-5" />, bg: "bg-amber-50",  fg: "text-amber-600" },
  Somatic:       { icon: <IconBody className="h-5 w-5" />,     bg: "bg-rose-50",     fg: "text-rose-500" },
  Mindfulness:   { icon: <IconSparkles className="h-5 w-5" />, bg: "bg-teal-50",     fg: "text-teal-600" },
};

const steps = [
  {
    num: "01",
    title: "Create your facilitator profile",
    body: "Tell us your modality, experience, availability, and what kind of retreat environment brings out your best. Takes 10 minutes.",
    outcome: "Free to join. Always.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Get matched with retreat owners",
    body: "When a retreat owner needs your exact skills — for a specific programme, dates, or setting — we make the introduction. No cold outreach required.",
    outcome: "Warm introductions only.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Grow your practice",
    body: "Each match is a relationship, not a transaction. You work directly with the retreat owner. Your profile stays active, attracting future opportunities as the network grows.",
    outcome: "Build a network. Build a career.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

const pillars = [
  {
    title: "No commission, ever",
    body: "Every partnership is yours. We connect you — what you negotiate and earn is between you and the retreat owner.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Human matching",
    body: "We review every match personally. No algorithm deciding your career. Every introduction is intentional and specific to your skills.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    title: "Quality retreats only",
    body: "Every retreat in our network has been vetted. You'll only be introduced to owners who are serious, prepared, and genuinely aligned.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
];

function OpportunityCard({ opp }: { opp: Opportunity }) {
  const avatar = modalityAvatars[opp.modality] ?? modalityAvatars.All;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-stone-100 bg-white p-6 shadow-[0_2px_8px_rgba(61,95,61,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-forest/20 hover:shadow-[0_8px_24px_rgba(61,95,61,0.1)]">
      {opp.urgent && (
        <span className="absolute right-4 top-4 rounded-full bg-gold/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warm-brown">
          Urgent
        </span>
      )}

      <div className="mb-4 flex items-start gap-3">
        {/* Modality avatar */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${avatar.bg} ${avatar.fg} transition-transform duration-200 group-hover:scale-105`}
          aria-hidden="true"
        >
          {avatar.icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            {opp.modality} · {opp.format}
          </p>
          <h3 className="mt-0.5 font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-stone-800">
            {opp.title}
          </h3>
        </div>
      </div>

      <p className="text-sm font-semibold text-forest">{opp.retreat}</p>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <svg
            className="h-3.5 w-3.5 shrink-0 text-stone-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {opp.location}
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <svg
            className="h-3.5 w-3.5 shrink-0 text-stone-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {opp.dates}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {opp.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-stone-100 bg-stone-50 px-2.5 py-0.5 text-[11px] text-stone-500"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-stone-50 pt-4">
        <span className="text-xs font-semibold text-stone-700">
          {opp.compensation}
        </span>
        <span className="text-xs text-stone-400">
          {opp.spotsNeeded} spot{opp.spotsNeeded > 1 ? "s" : ""} needed
        </span>
      </div>

      <Link
        href="/facilitator-matching-form"
        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-forest/30 px-4 text-sm font-semibold text-forest transition-all hover:bg-forest hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
      >
        Express interest
      </Link>
    </article>
  );
}

export default function FacilitatorsPortalPage() {
  const [activeModality, setActiveModality] = useState<Modality>("All");
  const [activeFormat, setActiveFormat] = useState<Format>("All");

  const filtered = opportunities.filter((o) => {
    const modMatch = activeModality === "All" || o.modality === activeModality;
    const fmtMatch = activeFormat === "All" || o.format === activeFormat;
    return modMatch && fmtMatch;
  });

  return (
    <div className="bg-white">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-sage">
              Facilitators Portal
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your next retreat partnership starts here.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/70 sm:text-lg">
              We connect skilled facilitators with retreat owners who need your
              exact gift. No cold outreach. No scrolling job boards.
              Human-curated, intention-matched.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/facilitator-onboarding"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-7 text-sm font-semibold text-forest shadow-sm transition-all hover:bg-cream hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
              >
                Create your profile
              </Link>
              <a
                href="#opportunities"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
              >
                Browse opportunities
              </a>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-10 sm:max-w-md">
            {[
              { value: "0%", label: "Commission taken" },
              { value: "48h", label: "Avg. matching time" },
              { value: "100%", label: "Human-reviewed" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white sm:text-3xl">
                  {s.value}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/45">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Opportunities ───────────────────────────── */}
      <section id="opportunities" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-forest">
                Open positions
              </p>
              <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-800 sm:text-3xl">
                Retreat owners looking for facilitators.
              </h2>
            </div>
            <p className="text-sm text-stone-400">
              {filtered.length} opportunit
              {filtered.length === 1 ? "y" : "ies"} found
            </p>
          </div>

          {/* Filters */}
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              {modalities.map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveModality(m)}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-1 ${
                    activeModality === m
                      ? "border-forest bg-forest text-white shadow-sm"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <span className="text-xs leading-none">
                    {modalityIcons[m]}
                  </span>
                  {m}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {formats.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFormat(f)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-1 ${
                    activeFormat === f
                      ? "border-teal bg-teal/10 text-teal"
                      : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length > 0 ? (
              filtered.map((opp) => (
                <OpportunityCard key={opp.id} opp={opp} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <p className="text-sm text-stone-400">
                  No opportunities match your current filters.
                </p>
                <button
                  onClick={() => {
                    setActiveModality("All");
                    setActiveFormat("All");
                  }}
                  className="mt-3 text-sm text-forest underline underline-offset-2 hover:text-forest/80"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Soft CTA for unlisted facilitators */}
          <div className="mt-10 rounded-2xl border border-beige bg-cream p-7 text-center sm:p-8">
            <p className="font-[family-name:var(--font-display)] text-lg font-medium text-stone-700 sm:text-xl">
              Don&apos;t see a match yet?
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Join our network and we&apos;ll contact you when your modality is
              needed by a retreat owner.
            </p>
            <Link
              href="/facilitator-onboarding"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-forest px-7 text-sm font-semibold text-white transition-colors hover:bg-[#345834] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
            >
              Join the facilitator network
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-stone-100" />

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-forest">
            Your path
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-800 sm:text-3xl">
            Three steps to your next retreat.
          </h2>

          <div className="mb-6 mt-10 flex items-center justify-between px-2 sm:px-4">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest">
                    {s.icon}
                  </div>
                  <span className="font-[family-name:var(--font-display)] text-[10px] font-medium text-stone-300">
                    {s.num}
                  </span>
                </div>
                {i < 2 && (
                  <div className="mx-3 h-px flex-1 bg-gradient-to-r from-forest/25 to-forest/5 sm:mx-5" />
                )}
              </div>
            ))}
          </div>

          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li
                key={i}
                className="flex gap-5 rounded-2xl border border-stone-100 bg-stone-50 p-6 transition-all hover:border-forest/20"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
                  {s.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                    {s.body}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-forest/[0.08] px-3 py-1 text-xs font-medium text-forest">
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {s.outcome}
                  </span>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/facilitator-onboarding"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-forest px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#345834] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
            >
              Start onboarding
            </Link>
            <Link
              href="/facilitator-matching-form"
              className="text-sm text-stone-500 underline underline-offset-2 hover:text-stone-700"
            >
              Fill in matching details instead
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-stone-100" />

      {/* ── Why Light Path Retreats ─────────────────────────────────── */}
      <section className="bg-cream px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-forest">
            Why facilitators choose us
          </p>
          <h2 className="mt-2 text-center font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-800 sm:text-3xl">
            Your gift deserves the right stage.
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {pillars.map((p, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl border border-beige bg-white p-6 shadow-[0_2px_8px_rgba(61,95,61,0.05)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/[0.08] text-forest">
                  {p.icon}
                </div>
                <h3 className="font-semibold text-stone-800">{p.title}</h3>
                <p className="text-sm leading-relaxed text-stone-500">{p.body}</p>
              </div>
            ))}
          </div>

          {/* Comparison row */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-beige">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-beige bg-stone-50">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-400 w-1/3" />
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-400">
                    Other platforms
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-forest">
                    Light Path Retreats
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 bg-white">
                {[
                  {
                    label: "How you get matched",
                    them: "Job board scrolling",
                    us: "We come to you",
                  },
                  {
                    label: "Platform commission",
                    them: "10–15% of your fee",
                    us: "Zero, always",
                  },
                  {
                    label: "Who reviews you",
                    them: "Algorithm + ad budget",
                    us: "Human curation",
                  },
                  {
                    label: "Retreat quality",
                    them: "Anyone can list",
                    us: "Vetted owners only",
                  },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3.5 text-xs font-medium text-stone-600">
                      {row.label}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-stone-400">
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-red-300"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {row.them}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 font-medium text-stone-700">
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-forest"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {row.us}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="bg-forest px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-20 sm:pb-16 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-sage">
          Ready to begin?
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-white sm:text-4xl">
          Share your gift with the world.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/65 sm:text-base">
          Join our facilitator network — free, always. Get matched with retreat
          owners who genuinely need what you offer.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/facilitator-onboarding"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-forest shadow-sm transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
          >
            Create your profile
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest"
          >
            Ask a question
          </Link>
        </div>
        <p className="mt-6 text-xs text-white/35">
          Already onboarded?{" "}
          <Link
            href="/retreat-intake-form"
            className="text-white/55 underline transition-colors hover:text-white"
          >
            Submit a retreat
          </Link>{" "}
          or{" "}
          <Link
            href="/facilitator-matching-form"
            className="text-white/55 underline transition-colors hover:text-white"
          >
            update your matching info
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
