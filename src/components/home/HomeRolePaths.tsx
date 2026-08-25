import Link from "next/link";

const paths = [
  {
    href: "/retreat-discovery-form",
    title: "I'm looking for a retreat",
    body: "Share your intention — we match you with retreats that fit.",
    cta: "Find my retreat",
    accent: "bg-forest text-white hover:bg-[#345834]",
  },
  {
    href: "/for-retreat-owners",
    title: "I run a retreat",
    body: "List your retreat and reach seekers who are ready to book.",
    cta: "For retreat owners",
    accent: "bg-warm-brown text-white hover:bg-warm-brown/90",
  },
  {
    href: "/facilitators-portal",
    title: "I'm a facilitator",
    body: "Get matched with retreat owners who need your practice.",
    cta: "Facilitator portal",
    accent: "border-2 border-forest bg-white text-forest hover:bg-forest/5",
  },
] as const;

export function HomeRolePaths() {
  return (
    <section
      className="border-b border-beige bg-white py-12 sm:py-16"
      aria-labelledby="home-role-paths-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2
          id="home-role-paths-heading"
          className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl"
        >
          Where do you fit?
        </h2>
        <p className="mt-2 max-w-2xl text-stone-600">
          Choose your path — each journey has its own form and human follow-up.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {paths.map(({ href, title, body, cta, accent }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-2xl border border-beige bg-cream/40 p-6 transition-shadow hover:shadow-md"
              >
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                  {body}
                </p>
                <span
                  className={`mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 text-sm font-semibold transition-all ${accent}`}
                >
                  {cta} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
