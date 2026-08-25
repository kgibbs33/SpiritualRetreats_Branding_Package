import Image from "next/image";
import Link from "next/link";

export default function DesignPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-800">
        Design System
      </h1>
      <p className="mt-2 text-stone-600">
        UI elements for the retreat matching platform. See DESIGN_STRATEGY and
        COMPONENT_MAP.
      </p>

      <div className="mt-16 space-y-16">
        {/* Typography */}
        <section>
          <h2 className="text-xl font-semibold text-stone-800">Typography</h2>
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs text-stone-500">Display / H1</p>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-800">
                Find your retreat. Find yourself.
              </h1>
            </div>
            <div>
              <p className="text-xs text-stone-500">H2</p>
              <h2 className="text-2xl font-semibold text-stone-800">
                Find the journey that transforms
              </h2>
            </div>
            <div>
              <p className="text-xs text-stone-500">H3</p>
              <h3 className="text-lg font-medium text-stone-700">Section title</h3>
            </div>
            <div>
              <p className="text-xs text-stone-500">Body</p>
              <p className="text-stone-600">
                We connect seekers to transformative retreat experiences. Browse
                by intention, match with qualified retreats, and discover your
                path.
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Small / Muted</p>
              <p className="text-sm text-stone-500">
                Supporting copy, captions, and metadata
              </p>
            </div>
          </div>
        </section>

        {/* Colors */}
        <section>
          <h2 className="text-xl font-semibold text-stone-800">Colors</h2>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="h-16 w-24 rounded-lg border border-beige bg-forest" />
              <span className="text-xs text-stone-600">Forest #3D5F3D</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-16 w-24 rounded-lg border border-beige bg-warm-brown" />
              <span className="text-xs text-stone-600">Warm Brown #8B654D</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-16 w-24 rounded-lg border border-beige bg-gold" />
              <span className="text-xs text-stone-600">Gold #D79F4F</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-16 w-24 rounded-lg border border-beige bg-cream" />
              <span className="text-xs text-stone-600">Cream #F1EDE4</span>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-xl font-semibold text-stone-800">Buttons</h2>
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-forest px-6 font-medium text-white transition-colors hover:bg-[#345834]"
            >
              Primary CTA
            </button>
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-stone-300 px-6 font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              Secondary
            </button>
            <button
              type="button"
              disabled
              className="inline-flex h-12 cursor-not-allowed items-center justify-center rounded-lg bg-stone-300 px-6 font-medium text-stone-500"
            >
              Disabled
            </button>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-xl font-semibold text-stone-800">Cards</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/yoga-retreat.jpg"
                  alt="Yoga retreat"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-[#5c6b52]">
                  yoga · 5 days
                </span>
                <h3 className="mt-1 font-medium text-stone-800">
                  Mindful Journey
                </h3>
                <p className="mt-1 text-sm text-stone-500">March 2025</p>
                <span className="mt-2 inline-block rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                  Verified
                </span>
              </div>
            </div>
            <div className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
              <div className="relative aspect-square">
                <Image
                  src="/images/meditation-retreat-type.png"
                  alt="Meditation"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-medium text-stone-800">Meditation</h3>
                <p className="mt-1 text-sm text-stone-600">Find inner calm</p>
                <span className="mt-3 inline-block text-sm font-medium text-[#5c6b52]">
                  Explore →
                </span>
              </div>
            </div>
            <div className="flex gap-4 rounded-sm border border-stone-200 bg-white p-4 shadow-sm">
              <div className="h-12 w-12 shrink-0 rounded-full bg-stone-200" />
              <div>
                <h3 className="font-semibold text-stone-800">Jane Smith</h3>
                <p className="text-xs text-stone-500">RYT-200 · 5 years</p>
                <span className="mt-1 inline-block text-xs text-stone-600">
                  Certified yoga teacher
                </span>
              </div>
            </div>
          </div>
          <p className="mt-2 text-sm text-stone-500">
            Retreat card · Category card · Facilitator card
          </p>
        </section>

        {/* Forms */}
        <section>
          <h2 className="text-xl font-semibold text-stone-800">Form Elements</h2>
          <div className="mt-6 max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Text input
              </label>
              <input
                type="text"
                placeholder="Enter text"
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 shadow-sm focus:border-[#5c6b52] focus:outline-none focus:ring-1 focus:ring-[#5c6b52]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Select
              </label>
              <select className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 shadow-sm focus:border-[#5c6b52] focus:outline-none focus:ring-1 focus:ring-[#5c6b52]">
                <option>General inquiry</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Textarea
              </label>
              <textarea
                rows={3}
                placeholder="Your message"
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 shadow-sm focus:border-[#5c6b52] focus:outline-none focus:ring-1 focus:ring-[#5c6b52]"
              />
            </div>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-xl font-semibold text-stone-800">Badges</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Verified
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Featured
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
              yoga
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
              meditation
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
              RYT-200
            </span>
          </div>
          <p className="mt-2 text-sm text-stone-500">
            Trust label · Type label · Credential badge
          </p>
        </section>

        {/* Filters */}
        <section>
          <h2 className="text-xl font-semibold text-stone-800">Filters</h2>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <select className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#5c6b52] focus:outline-none focus:ring-1 focus:ring-[#5c6b52]">
              <option>Type</option>
              <option>yoga</option>
              <option>meditation</option>
            </select>
            <input
              type="date"
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#5c6b52] focus:outline-none focus:ring-1 focus:ring-[#5c6b52]"
            />
            <select className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#5c6b52] focus:outline-none focus:ring-1 focus:ring-[#5c6b52]">
              <option>Budget</option>
              <option>Under $1K</option>
              <option>$1K–$2K</option>
            </select>
            <span className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1 text-sm">
              yoga <button type="button" className="ml-1 text-stone-400 hover:text-stone-600">×</button>
            </span>
            <select className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#5c6b52] focus:outline-none focus:ring-1 focus:ring-[#5c6b52]">
              <option>Sort: Relevance</option>
              <option>Date</option>
              <option>Price</option>
            </select>
          </div>
        </section>

        {/* States */}
        <section>
          <h2 className="text-xl font-semibold text-stone-800">States</h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
              <div className="h-6 w-6 animate-pulse rounded-full bg-stone-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
            </div>
            <p className="text-sm text-stone-500">Loading (skeleton)</p>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-8 text-center">
              <p className="text-stone-600">No retreats match your filters.</p>
              <Link
                href="/retreat-discovery-form"
                className="mt-2 inline-block text-sm font-medium text-[#5c6b52] hover:underline"
              >
                Find Your Path
              </Link>
            </div>
            <p className="text-sm text-stone-500">Empty state</p>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              Something went wrong. Please try again.
            </div>
            <p className="text-sm text-stone-500">Error state</p>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
              Thank you! You&apos;re on your way.
            </div>
            <p className="text-sm text-stone-500">Success state</p>
          </div>
        </section>

        {/* Progress */}
        <section>
          <h2 className="text-xl font-semibold text-stone-800">
            Progress indicator
          </h2>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-12 rounded-full ${
                    s <= 2 ? "bg-[#5c6b52]" : "bg-stone-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-stone-600">Step 2 of 3</span>
          </div>
        </section>
      </div>
    </div>
  );
}
