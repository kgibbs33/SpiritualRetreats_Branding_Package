import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-900">
        About Re: Treat Yourself
      </h1>
      <p className="mt-4 text-lg font-semibold text-forest">
        A global retreat matching platform for seekers, retreat owners, and
        facilitators.
      </p>

      <section className="mt-12 space-y-4 text-stone-700">
        <h2 className="text-xl font-semibold text-stone-900">Our mission</h2>
        <p className="leading-relaxed">
          We believe retreats are more than escapes — they are gateways to
          transformation. Our mission is to connect seekers of healing, growth,
          and renewal with authentic retreats worldwide, while supporting
          retreat owners and networks with visibility, trust, and sustainable
          growth.
        </p>
      </section>

      <section className="mt-12 space-y-4 text-stone-700">
        <h2 className="text-xl font-semibold text-stone-900">What we do</h2>
        <p className="leading-relaxed">
          We are the global search and matching platform for mind–body–spirit
          retreats.
        </p>
        <ul className="list-disc space-y-2 pl-5 leading-relaxed">
          <li>
            <strong className="text-stone-800">For seekers:</strong> we make it
            simple to find retreats that fit your goals, budget, and journey.
          </li>
          <li>
            <strong className="text-stone-800">For retreats:</strong> we
            provide exposure, authentic ratings, and social storytelling to
            attract the right guests.
          </li>
          <li>
            <strong className="text-stone-800">For retreat owners:</strong> we
            offer a fair, commission-based model — no upfront fees, just
            results.
          </li>
        </ul>
      </section>

      <section className="mt-12 space-y-4 text-stone-700">
        <h2 className="text-xl font-semibold text-stone-900">Our network</h2>
        <ul className="list-disc space-y-2 pl-5 leading-relaxed">
          <li>
            Connects retreat networks and independent centers worldwide.
          </li>
          <li>
            Offers diversity, authenticity, and accessibility across meditation,
            yoga, executive leadership, and holistic wellness.
          </li>
          <li>
            Curates trusted experiences and gives retreat owners meaningful
            visibility.
          </li>
        </ul>
      </section>

      <section className="mt-12 space-y-4 text-stone-700">
        <h2 className="text-xl font-semibold text-stone-900">Our founders</h2>
        <ul className="list-disc space-y-3 pl-5 leading-relaxed">
          <li>
            <strong className="text-stone-800">Andrew Allan Porteous</strong> —
            Co-Founder &amp; CEO / Partnerships Lead. Visionary strategist,
            building relationships with retreat owners and networks worldwide.
          </li>
          <li>
            <strong className="text-stone-800">Gordana Ross</strong> — Co-Founder
            &amp; Principal Leader. Visionary leader shaping the retreat
            experience and building partnerships that connect seekers with
            authentic, transformative retreats worldwide.
          </li>
        </ul>
        <p className="leading-relaxed">
          Together, they lead a team dedicated to creating a platform where
          personal growth meets global connection.
        </p>
      </section>

      <section className="mt-12 space-y-3 text-stone-700">
        <h2 className="text-xl font-semibold text-stone-900">Why choose us</h2>
        <ul className="list-disc space-y-2 pl-5 leading-relaxed">
          <li>
            <strong className="text-stone-800">Transparent:</strong> no hidden
            fees for guests.
          </li>
          <li>
            <strong className="text-stone-800">Authentic:</strong> real ratings,
            real stories, real growth.
          </li>
          <li>
            <strong className="text-stone-800">Global:</strong> retreats across
            continents.
          </li>
          <li>
            <strong className="text-stone-800">Supportive:</strong> we empower
            both seekers and providers.
          </li>
        </ul>
      </section>

      <div className="mt-14 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/retreat-discovery-form"
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-forest px-6 font-semibold text-white transition-colors hover:bg-[#345834]"
        >
          Start your journey today
        </Link>
        <Link
          href="/about/our-story"
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-stone-300 px-6 font-medium text-stone-800 transition-colors hover:bg-stone-50"
        >
          Our story
        </Link>
      </div>
    </div>
  );
}
