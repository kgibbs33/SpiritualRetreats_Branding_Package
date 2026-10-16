import Link from "next/link";
import { RetreatIntakeForm } from "@/components/retreat/RetreatIntakeForm";
import { GhlForm } from "@/components/ui/GhlForm";

export default function RetreatIntakeFormPage() {
  return (
    <GhlForm
      formKey="retreatPlannerIntake"
      label="Register your retreat"
      existingForm={
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-800">
            List your retreat
          </h1>
          <p className="mt-2 text-stone-600">
            Submit your retreat for review. We&apos;ll confirm details and listing
            status (pending → approved) with you by email.
          </p>
          <div className="mt-10">
            <RetreatIntakeForm />
          </div>
          <p className="mt-10 text-center text-sm text-stone-500">
            <Link href="/why-work-with-us" className="text-river-teal hover:underline">
              ← Back to Why list with us
            </Link>
          </p>
        </div>
      }
    />
  );
}