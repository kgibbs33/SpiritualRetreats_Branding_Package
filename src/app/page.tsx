import type { Metadata } from "next";
import Link from "next/link";
import { RetreatSearchBar } from "@/components/home/RetreatSearchBar";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";
import { canonicalUrl } from "@/lib/metadata";
import { BrandImage } from "@/components/ui/BrandImage";
import { IMAGES } from "@/config/images";
import { DirectoryCard } from "@/components/retreat/DirectoryCard";
import { listPublishedRetreats } from "@/lib/retreats/queries";
import { isDemoRetreatHref } from "@/lib/retreats/demo-records";
import { milestonePreviewEnabled, milestonePreviewRows } from "@/lib/retreats/milestone-preview";
import { previewStock } from "@/lib/retreats/preview-stock";
import "@/app/retreat-design.css";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl("/") },
};

const INTENTS = [
  { label: "Rest & recharge", line: "Step away from the demands of everyday life.", href: "/retreat-listings?intent=rest+and+recharge", img: "/images/beach-wellness.jpg", alt: "Illustrative beach and ocean photo" },
  { label: "Spiritual connection", line: "Explore a deeper connection with yourself.", href: "/retreat-listings?intent=spiritual", img: "/images/meditation-retreat-type.png", alt: "Illustrative meditation photo" },
  { label: "Wellness & renewal", line: "Make time for your body, mind and soul.", href: "/retreat-listings?intent=health+and+wellbeing", img: "/images/spa-wellness.jpg", alt: "Illustrative spa and wellness photo" },
  { label: "Personal growth", line: "Discover new perspectives and possibilities.", href: "/retreat-listings?intent=personal+growth", img: "/images/yoga-retreat.jpg", alt: "Illustrative yoga photo" },
  { label: "Nature & adventure", line: "Reconnect with the natural world.", href: "/retreat-listings?intent=adventure", img: "/images/nature-immersion.jpg", alt: "Illustrative forest photo" },
  { label: "Stillness & mindfulness", line: "Find space for presence and reflection.", href: "/retreat-listings?intent=clarity+and+focus", img: "/images/mindfulness-retreat.jpg", alt: "Illustrative mindfulness photo" },
];

const CLASSIC = [
  ["Yoga", "yoga"], ["Meditation", "meditation"], ["Breathwork", "breathwork"], ["Wellness", "wellness"], ["Nature", "nature"],
] as const;

const DESTINATIONS = [
  { name: "Portugal", stock: previewStock.madeira },
  { name: "Brazil", stock: previewStock.brazil },
  { name: "Mexico", stock: previewStock.tulum },
  { name: "Peru", stock: previewStock.peru },
];

const PROFESSIONAL = [
  { title: "For Retreat Planners", text: "Share your passion, reach new audiences and grow your retreat business with purpose.", cta: "List my retreat", href: "/retreat-planners", img: "/images/yoga-retreat.jpg", alt: "Illustrative yoga photo" },
  { title: "For Venue Owners", text: "Your space could be the setting for someone's next meaningful retreat. Show it to retreat planners looking for places to host.", cta: "List my venue", href: "/find-a-venue", img: "/images/sacred-valley.jpg", alt: "Illustrative landscape photo" },
  { title: "For Facilitators", text: "Share your expertise, connect with retreat leaders and discover professional opportunities.", cta: "Create my profile", href: "/find-a-facilitator", img: "/images/meditation-nature.jpg", alt: "Illustrative meditation photo" },
];

const PILLARS = [
  ["Meaningful experiences", "Discover retreats with purpose."],
  ["Inspiring destinations", "Explore beautiful places around the world."],
  ["Clear information", "Dates, prices and what is included, shown plainly."],
  ["Your journey, your choice", "Find experiences aligned with your intentions."],
];

export default async function Home() {
  let featured: Awaited<ReturnType<typeof listPublishedRetreats>>["cards"] = [];
  try {
    const res = await listPublishedRetreats({});
    featured = res.cards.filter((r) => !isDemoRetreatHref(r.href)).slice(0, 4);
  } catch {
    featured = [];
  }
  const preview = milestonePreviewEnabled();
  const countries = new Set(preview ? milestonePreviewRows.map((r) => r.country) : []);
  const destinations = DESTINATIONS.filter((d) => countries.has(d.name));
  const h2 = "font-[family-name:var(--font-display)] text-3xl font-semibold text-forest-green sm:text-4xl";
  const cta = "inline-flex h-12 items-center rounded-full bg-forest-green px-8 text-sm font-semibold text-white shadow-md transition hover:bg-forest-green/90";

  return (
    <div className="bg-white">
      {/* 1 Hero */}
      <section className="relative isolate overflow-hidden min-h-[34rem] lg:min-h-[80vh]">
        <BrandImage slot={IMAGES.homeHero} fill priority sizes="100vw" className="object-[70%_center] md:object-right" />
        <div aria-hidden className="absolute inset-0 bg-warm-cream/80 sm:hidden" />
        <div aria-hidden className="hidden sm:block absolute inset-0 bg-[linear-gradient(90deg,#F8F2E7_0%,rgba(248,242,231,0.96)_38%,rgba(248,242,231,0)_60%)]" />
        <div className="relative mx-auto flex min-h-[34rem] max-w-7xl items-center px-5 py-16 sm:px-8 lg:min-h-[80vh] lg:px-10">
          <div className="max-w-[36rem] text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5E1A]">Transformational retreats worldwide</p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.05] tracking-tight text-forest-green lg:text-7xl">
              Leave the noise behind.
            </h1>
            <p className="mt-3 font-[family-name:var(--font-display)] text-2xl italic leading-snug text-[#8B5E1A] lg:text-3xl">
              Return to what matters.
            </p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-700 lg:text-xl">
              Discover your ideal retreat in some of the world&apos;s most inspiring places. Reconnect with yourself, restore your balance and explore meaningful experiences that speak to your soul.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#search" className={cta}>Find my retreat</a>
              <Link href="/retreat-listings" className="inline-flex h-12 items-center rounded-full border-2 border-forest-green px-8 text-sm font-semibold text-forest-green transition-colors hover:bg-forest-green hover:text-white">
                Explore retreats
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2 Search */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 pt-10 pb-6 sm:px-8 lg:px-10">
          <div id="search" className="scroll-mt-24">
            <p className="mb-1 text-center font-[family-name:var(--font-display)] text-2xl font-semibold text-forest-green">Your journey starts here.</p>
            <p className="mb-5 text-center text-sm text-stone-600">Find an experience that feels right for you.</p>
            <RetreatSearchBar />
          </div>
        </div>
      </section>

      {/* 3 Explore by intention */}
      <section className="bg-warm-cream/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className={h2}>What is your soul calling for?</h2>
          <p className="mt-3 max-w-2xl text-stone-600">
            Sometimes we need space to breathe. Sometimes we seek clarity, connection or a new beginning. Start with how you want to feel.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {INTENTS.map((t) => (
              <Link key={t.label} href={t.href} className="group overflow-hidden rounded-2xl border border-sage-mist bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="relative h-36 w-full sm:h-48">
                  <BrandImage slot={{ src: t.img, alt: t.alt }} fill className="transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <span className="block text-lg font-semibold text-celestial-navy">{t.label}</span>
                  <span className="mt-1 block text-sm text-stone-600">{t.line}</span>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-sm text-stone-600">Prefer to browse by practice?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CLASSIC.map(([label, v]) => (
              <Link key={v} href={`/retreat-listings?type=${v}`} className="rounded-full border border-forest-green/40 px-4 py-2 text-sm font-medium text-forest-green hover:bg-forest-green hover:text-white">
                {label}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-stone-500">Photos are illustrative stock images, not specific venues.</p>
        </div>
      </section>

      {/* 4 Featured retreats */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className={h2}>Your next meaningful experience awaits.</h2>
          <p className="mt-3 max-w-2xl text-stone-600">
            From peaceful mountain sanctuaries to sun-drenched coastal escapes, step away from the everyday and reconnect with what matters.
          </p>
          {featured.length > 0 ? (
            <div className="lp lp-browse mt-8">
              <div className="lp-cards">
                {featured.map((r) => (
                  <DirectoryCard key={String(r.id)} {...r} />
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-8 rounded-2xl border border-sage-mist bg-sage-mist/30 p-6 text-stone-700">
              New retreats are being added. Tell us what you are looking for and we will point you to the right one.
            </p>
          )}
          <div className="mt-8">
            <Link href="/retreat-listings" className={cta}>Explore all retreats</Link>
          </div>
        </div>
      </section>

      {/* 5 Destinations (only countries with a listing) */}
      {destinations.length > 0 && (
        <section className="bg-warm-cream/40 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <h2 className={h2}>Beautiful places. Meaningful journeys.</h2>
            <p className="mt-3 max-w-2xl text-stone-600">Destinations where we currently have retreat listings.</p>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {destinations.map((d) => (
                <Link key={d.name} href={`/retreat-listings?destination=${encodeURIComponent(d.name)}`} className="group overflow-hidden rounded-2xl border border-sage-mist bg-white transition hover:shadow-lg">
                  <div className="relative h-40 w-full">
                    <BrandImage slot={{ src: d.stock.path, alt: d.stock.alt }} fill className="transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <span className="block p-4 text-lg font-semibold text-celestial-navy">{d.name}</span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-xs text-stone-500">Photos are illustrative stock images (Unsplash License), not the retreat venues.</p>
          </div>
        </section>
      )}

      {/* 6 Why Light Path */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <h2 className={h2}>More than a getaway. A journey back to yourself.</h2>
          <p className="mt-5 text-lg leading-relaxed text-stone-700">
            The most meaningful journeys are not always about how far we travel, but how deeply we reconnect with ourselves. Light Path Retreats brings together inspiring experiences, beautiful spaces and retreat leaders who share a belief in meaningful connection.
          </p>
          <p className="mt-4 font-[family-name:var(--font-display)] text-xl italic text-[#8B5E1A]">Find your path. At your own pace.</p>
          <div className="mt-10 grid grid-cols-2 gap-6 text-left">
            {PILLARS.map(([t, d]) => (
              <div key={t}>
                <h3 className="font-semibold text-celestial-navy">{t}</h3>
                <p className="mt-1 text-sm text-stone-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Inspiration */}
      <section className="bg-warm-cream/40 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <h2 className={h2}>Inspiration for wherever life takes you.</h2>
          <p className="mt-4 text-stone-700">
            Guides and stories to help you choose a retreat that is right for you are coming. Your journey does not have to begin with a plane ticket. Sometimes it begins with a little inspiration.
          </p>
          <Link href="/education" className="mt-6 inline-block text-sm font-semibold text-forest-green underline">Join the waitlist for the Light Path Journal</Link>
        </div>
      </section>

      {/* 8 Final invitation */}
      <section className="bg-forest-green py-16 text-center text-warm-cream sm:py-20">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">Perhaps it&apos;s time to make space for you.</h2>
          <p className="mt-3 font-[family-name:var(--font-display)] italic text-sacred-gold">A new perspective. A deeper connection. A meaningful beginning.</p>
          <p className="mt-4 text-warm-cream/85">Whatever you are searching for, your next journey starts with a single step.</p>
          <a href="#search" className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-sacred-gold px-10 text-base font-semibold text-celestial-navy shadow-md transition hover:bg-sacred-gold/90">Find my retreat</a>
        </div>
      </section>

      {/* 9 Professionals */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#8B5E1A]">Grow with Light Path</p>
          <h2 className={`${h2} mt-2 text-center`}>Together, we create meaningful experiences.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-stone-600">
            Are you a retreat leader, venue owner or facilitator? Join our growing retreat community and share what makes your work extraordinary.
          </p>
          <div className="mt-10 divide-y divide-sage-mist rounded-2xl border border-sage-mist">
            {PROFESSIONAL.map((p) => (
              <div key={p.title} className="flex items-center gap-5 p-5">
                <div className="relative h-24 w-24 flex-none overflow-hidden rounded-xl">
                  <BrandImage slot={{ src: p.img, alt: p.alt }} fill sizes="96px" />
                </div>
                <div>
                  <h3 className="font-semibold text-celestial-navy">{p.title}</h3>
                  <p className="mt-1 text-sm text-stone-600">{p.text}</p>
                  <Link href={p.href} className="mt-2 inline-block text-sm font-semibold text-forest-green">{p.cta} →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 Newsletter */}
      <section className="border-t border-sage-mist bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-5 sm:px-8">
          <NewsletterSignup variant="light" layout="stacked" />
        </div>
      </section>
    </div>
  );
}
