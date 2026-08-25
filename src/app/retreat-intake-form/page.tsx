import Link from "next/link";
import { RetreatIntakeForm } from "@/components/retreat/RetreatIntakeForm";

export default function RetreatIntakeFormPage() {
  return (
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
        <Link href="/for-retreat-owners" className="text-forest hover:underline">
          ← Back to For Retreat Owners
        </Link>
      </p>
    </div>
  );
}
