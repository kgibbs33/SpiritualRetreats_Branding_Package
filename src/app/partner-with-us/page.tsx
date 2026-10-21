import type { Metadata } from "next";
import Link from "next/link";
import { canonicalUrl } from "@/lib/metadata";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";

export const metadata: Metadata = {
  title: "Partner With Us",
  alternates: { canonical: canonicalUrl("/partner-with-us") },
};

export default function PartnerWithUsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* PW-01 Hero */}
      <section className="text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-celestial-navy sm:text-4xl">
          Partner with us.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">
          Grow your own retreat with a team that helps you plan and organise it.
        </p>
      </section>

      {/* PW-02 50/50 partnership */}
      <section className="mt-12 rounded-2xl border border-sage-mist bg-warm-cream/60 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-celestial-navy">
          A 50/50 profit-split partnership
        </h2>
        <p className="mt-3 text-stone-700">
          We offer a 50/50 profit-split partnership. We help you plan and
          organise your retreat. On-site presence from our team is an optional
          paid extra, at an agreed daily or weekly rate plus expenses. How
          expenses are handled is agreed in writing.
        </p>
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Legal wording for the partnership terms to follow (solicitor review).
        </p>
        <Link
          href="/contact?subject=Partnership"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-sacred-gold px-6 text-sm font-semibold text-celestial-navy"
        >
          Enquire about a partnership
        </Link>
      </section>

      {/* PW-03 Supplier waitlist */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-celestial-navy">
          More partnership opportunities coming soon
        </h2>
        <p className="mt-3 text-stone-700">
          We are building a network of trusted suppliers for retreats, including
          travel agents, insurance providers, chefs, photographers, and gift and
          wellness product companies. Join our free waitlist to be the first to
          know.
        </p>
        <div className="mt-6 rounded-2xl border border-sage-mist bg-warm-cream p-6">
          <p className="text-sm font-semibold text-forest-green">
            Supplier waitlist
          </p>
          <p className="mt-2 text-xs text-stone-500">
            Waitlist signup is not live yet. Join the newsletter and we will
            announce it there.
          </p>
          <div className="mt-4 max-w-sm">
            <NewsletterSignup variant="light" layout="stacked" />
          </div>
        </div>
      </section>
    </div>
  );
}