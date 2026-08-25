import Link from "next/link";

import { FacilitatorOnboardingForm } from "@/components/facilitator/FacilitatorOnboardingForm";

export default function FacilitatorOnboardingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-800">
        Facilitator onboarding
      </h1>
      <p className="mt-2 text-stone-600">
        Tell us about your practice so we can connect you with aligned seekers.
      </p>

      <div className="mt-10">
        <FacilitatorOnboardingForm />
      </div>

      <p className="mt-10 text-center text-sm text-stone-500">
        <Link href="/facilitators-portal" className="text-forest hover:underline">
          ← Back to Facilitators Portal
        </Link>
      </p>
    </div>
  );
}
