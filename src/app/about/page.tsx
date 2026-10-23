import { TeamHeadshot } from "@/components/team/TeamHeadshot";
import { TEAM, type TeamMember } from "@/content/team";
import { SITE_CONFIG } from "@/config/site";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-900">
        About Light Path Retreats
      </h1>
      <p className="mt-4 text-lg font-semibold text-forest-green">
        {SITE_CONFIG.tagline}
      </p>

      <section className="mt-12 space-y-4 text-stone-700">
        <h2 className="text-xl font-semibold text-stone-900">Our mission</h2>
        <p className="leading-relaxed">
          We believe that when people reconnect with themselves, they reconnect with what matters most. Our mission is to create a trusted global home for transformational retreats, bringing together retreat guests, leaders, venues and partners to make life-changing experiences easier to discover, create and share.
        </p>
      </section>

      <section className="mt-12 space-y-4 text-stone-700">
        <h2 className="text-xl font-semibold text-stone-900">Our vision</h2>
        <p className="leading-relaxed">
          Light Path Retreats exists to illuminate a new path, one built on trust, integrity, collaboration and meaningful human connection. We believe transformational retreats are among the most powerful experiences available to help people pause, reconnect with who they are and return to life with greater clarity, purpose and compassion.
        </p>
      </section>

      <section className="mt-12 space-y-4 text-stone-700">
        <h2 className="text-xl font-semibold text-stone-900">What we do</h2>
        <ul className="list-disc space-y-2 pl-5 leading-relaxed">
          <li><strong className="text-stone-800">For guests:</strong> find retreats that fit your goals, budget, and journey.</li>
          <li><strong className="text-stone-800">For Retreat Planners:</strong> list your retreats, reach guests, and find venues and facilitators.</li>
          <li><strong className="text-stone-800">For venues and facilitators:</strong> be discovered by Retreat Planners looking for the right space or professional.</li>
        </ul>
      </section>

      {/* Team */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold text-stone-900">Team</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {TEAM.map((m: TeamMember) => (
            <div key={m.name} className="rounded-2xl border border-sage-mist bg-white p-5">
              <div className="mb-3 mx-auto flex h-32 w-32 items-center justify-center">
                <TeamHeadshot name={m.name} imagePath={m.imagePath} />
              </div>
              <h3 className="mt-3 text-center font-semibold text-celestial-navy">{m.name}</h3>
              <p className="text-center text-xs font-medium text-forest-green">{m.subheading}</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{m.bio.replace("{name}", m.name)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}