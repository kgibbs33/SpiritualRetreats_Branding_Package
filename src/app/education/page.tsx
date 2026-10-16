import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/metadata";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";

export const metadata: Metadata = {
  title: "Education",
  alternates: { canonical: canonicalUrl("/education") },
};

export default function EducationPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* ED-01 */}
      <section className="rounded-2xl border border-sage-mist bg-warm-cream p-8 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-celestial-navy">
          Education is coming soon
        </h1>
        <p className="mx-auto mt-4 max-w-md text-stone-600">
          Practical guidance for planning and running a transformational
          retreat. Join the waitlist to hear first.
        </p>
        <div className="mx-auto mt-6 max-w-sm">
          <NewsletterSignup variant="light" layout="stacked" />
        </div>
      </section>
    </div>
  );
}