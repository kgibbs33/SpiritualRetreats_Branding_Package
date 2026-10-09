import Link from "next/link";

import {
  MAKE_YOUR_RETREAT_MODULES,
  MODULE_PRICE_EUR,
} from "@/lib/make-your-retreat-modules";

export const metadata = {
  title: "Make Your Retreat | Light Path Retreats",
  description:
    "Twelve owner support modules — vision through delivery. €250 per module with human guidance.",
  alternates: { canonical: "/make-your-retreat" },
};

export default function MakeYourRetreatPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-beige bg-cream px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-forest">
            For retreat owners
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Make Your Retreat
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Twelve modules to launch or scale your retreat — from vision through
            delivery. Each module is{" "}
            <strong className="font-semibold text-stone-800">
              €{MODULE_PRICE_EUR}
            </strong>{" "}
            with guided support (stakeholder offer, May 2026).
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-forest px-6 font-semibold text-white hover:bg-[#345834]"
            >
              Enquire about a module
            </Link>
            <Link
              href="/retreat-intake-form"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-beige px-6 font-semibold text-forest hover:bg-cream"
            >
              List your retreat
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <ol className="grid gap-4 sm:grid-cols-2">
          {MAKE_YOUR_RETREAT_MODULES.map((mod, i) => (
            <li
              key={mod.slug}
              className="rounded-2xl border border-beige bg-cream/30 p-6"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-warm-brown">
                Module {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
                {mod.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {mod.summary}
              </p>
              <p className="mt-4 text-sm font-medium text-forest">
                €{MODULE_PRICE_EUR} / module
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-2xl border border-forest/20 bg-forest/5 p-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900">
            Need help advertising, marketing, or selling?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-stone-600">
            Modules 9–11 cover brand, marketing, and sales — or start with a
            single module and grow from there.
          </p>
          <Link
            href="/contact?subject=make-your-retreat"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-warm-brown px-8 font-semibold text-white hover:bg-warm-brown/90"
          >
            Talk to our team
          </Link>
        </div>
      </div>
    </div>
  );
}
