import { SeekerDiscoveryForm } from "@/components/seeker/SeekerDiscoveryForm";

export default function RetreatDiscoveryFormPage() {
  return (
    <div className="relative min-h-screen bg-cream">
      {/* Subtle organic background texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(61,95,61,0.06)_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_left,_rgba(139,101,77,0.05)_0%,_transparent_60%)]"
      />

      <div className="relative mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-warm-brown">
            Free · 3 minutes
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Find your retreat
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-stone-500">
            Answer a few questions and we match you with retreats made for where
            you are right now.
          </p>
        </div>

        <SeekerDiscoveryForm />
      </div>
    </div>
  );
}
