import Link from "next/link";

import { FacilitatorMatchingForm } from "@/components/facilitator/FacilitatorMatchingForm";

export const metadata = {
  title: "Facilitator Matching — Re: Treat Yourself",
  description:
    "Tell us about your facilitation practice and availability so we can connect you with retreat owners looking for the right collaborator.",
};

export default function FacilitatorMatchingFormPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-800">
          Facilitator matching
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
          Let us know your practice focus, availability, and what kind of retreat
          collaboration you are looking for. We will match you with retreat owners
          who need exactly what you bring.
        </p>
      </div>

      <FacilitatorMatchingForm />

      <p className="mt-10 text-center text-sm text-stone-500">
        <Link
          href="/facilitators-portal"
          className="text-forest hover:underline"
        >
          ← Back to Facilitators Portal
        </Link>
      </p>
    </div>
  );
}
