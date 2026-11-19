import {PreviewFilters} from "@/components/retreat/PreviewFilters";
import {previewFacets} from "@/lib/retreats/preview-filters";
import { milestonePreviewEnabled,milestonePreviewRows } from "@/lib/retreats/milestone-preview";
import type { Metadata } from "next";
import Link from "next/link";
import { DirectoryCard } from "@/components/retreat/DirectoryCard";
import { listPublishedRetreats } from "@/lib/retreats/queries";
import { isDemoRetreatHref } from "@/lib/retreats/demo-records";
import { parseRetreatListParams } from "@/lib/retreats/retreat-filters";
import "@/app/retreat-design.css";
import {
  RETREAT_TYPES,
  RETREAT_INTENTS,
  BUDGET_BANDS,
} from "@/lib/retreats/search-options";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Discover retreats",
  ...(milestonePreviewEnabled() ? { robots: "noindex, nofollow" } : {}),
  description:
    "Find space to pause. Explore retreats by destination, style and budget.",
  alternates: { canonical: "/retreat-listings" },
};
type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export default async function RetreatListingsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const q = parseRetreatListParams(raw);
  const text = (Array.isArray(raw.q) ? raw.q[0] : (raw.q ?? "")).trim();
  const {
    cards: databaseCards,
    total,
    page,
    error,
  } = await listPublishedRetreats(raw);
  const eligible = databaseCards.filter((r) => !isDemoRetreatHref(r.href));
  const cards = eligible;
  const filtered = Boolean(
    text || q.type || q.intent || q.budget || q.destination || q.currency || q.lengths?.length || q.categories?.length || q.features?.length || q.atmosphere?.length || q.level?.length || q.setting?.length || q.food?.length || q.included?.length || q.ages?.length || q.rooms?.length || q.language?.length,
  );
  return (
    <div className="lp">
      {milestonePreviewEnabled() && <div className="lp-preview-notice"><strong>Milestone preview only.</strong> Four submitted retreat concepts, not approved listings. Stock photos illustrate destinations, not the retreat venues. Actual photos, details and operator checks are pending. Booking and enquiries are disabled. <Link href="/media-workflow-preview">Try the photo-slot workflow →</Link></div>}
      <section className="lp-hero">
        <div className="lp-container lp-hero-inner">
          <div>
            <span className="lp-eyebrow">
              A little further from the everyday
            </span>
            <h1>
              Find space.
              <br />
              Find <em>your path.</em>
            </h1>
            <p>
              Discover a retreat that meets you where you are. A quieter mind, a
              new perspective, or simply time to be.
            </p>
            <div className="lp-hero-note">
              <span aria-hidden>☼</span> Your next chapter can start with a
              pause.
            </div>
          </div>
          <div className="lp-hero-art" aria-hidden>
            <span className="lp-sun" />
            <span className="lp-hill one" />
            <span className="lp-hill two" />
            <span className="lp-path" />
          </div>
        </div>
      </section>
      <form
        key={JSON.stringify(q)}
        action="/retreat-listings"
        method="get"
        className="lp-container lp-search"
        aria-label="Search and refine retreats"
      >
        <div className="lp-search-top">
          <label>
            Search retreats
            <input
              name="q"
              type="search"
              defaultValue={text}
              placeholder="What would you like to find?"
            />
          </label>
          <label>
            Your retreat style
            <select name="type" defaultValue={q.type ?? ""}>
              <option value="">All retreat styles</option>
              {RETREAT_TYPES.map((t) => (
                <option value={t} key={t}>
                  {t.replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </label>
          <label>
            Destination
            <input
              name="destination"
              defaultValue={q.destination ?? ""}
              placeholder="Country or region"
            />
          </label>
          <button className="lp-button" type="submit">
            Find my retreat <span aria-hidden>→</span>
          </button>
        </div>
        <div className="lp-directory">
          <aside className="lp-filters">
            <div className="lp-filter-title">
              <h2>Refine your search</h2>
              <Link href="/retreat-listings">Clear all</Link>
            </div>
            {!milestonePreviewEnabled()&&<label>
              What do you need?
              <select name="intent" defaultValue={q.intent ?? ""}>
                <option value="">Any intention</option>
                {RETREAT_INTENTS.map((o) => (
                  <option key={o} value={o}>
                    {o.replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </label>}
            {!milestonePreviewEnabled()&&<label>
              Budget
              <select name="budget" defaultValue={q.budget ?? ""}>
                <option value="">Any budget</option>
                {BUDGET_BANDS.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>}
            {milestonePreviewEnabled()&&<PreviewFilters value={q} counts={previewFacets(milestonePreviewRows)}/>}
            {!milestonePreviewEnabled()&&<label>
              Sort by
              <select name="sort" defaultValue={q.sort ?? "soonest"}>
                <option value="soonest">Recommended</option>
                <option value="price_asc" disabled={milestonePreviewEnabled()&&!q.currency}>Price: low to high</option>
                <option value="price_desc" disabled={milestonePreviewEnabled()&&!q.currency}>Price: high to low</option>
                <option value="newest">Recently added</option>
              </select>
            </label>}
            <button className="lp-button lp-outline" type="submit">
              Apply filters →
            </button>
            <div className="lp-tip">
              <span aria-hidden>☼</span>
              <h3>No need to have it all figured out.</h3>
              <p>
                Start with what you need more of: stillness, movement, nature or
                a change of scene.
              </p>
            </div>
          </aside>
          <section className="lp-results" aria-label="Retreat results">
            <div className="lp-results-title">
              <div>
                <h2>A path for every pause</h2>
                <p>
                  {error
                    ? "The directory is temporarily unavailable"
                    : `${total} retreat${total !== 1 ? "s" : ""} found`}
                </p>
              </div>
            </div>
            {error ? (
              <div className="lp-empty" role="alert">
                <span className="lp-eyebrow">A brief pause</span>
                <h3>We couldn’t load the retreats.</h3>
                <p>
                  Please try again shortly. You can still tell us what you’re
                  looking for.
                </p>
                <Link className="lp-button" href="/retreat-discovery-form">
                  Find your path →
                </Link>
              </div>
            ) : cards.length ? (
              <div className="lp-cards">
                {cards.map((r) => (
                  <DirectoryCard key={String(r.id)} {...r} />
                ))}
              </div>
            ) : (
              <div className="lp-empty">
                <div className="lp-empty-mark" aria-hidden>
                  ☼
                </div>
                <span className="lp-eyebrow">Room for what’s next</span>
                <h3>
                  {filtered
                    ? "No retreats match this search, yet."
                    : "Our next chapter is taking shape."}
                </h3>
                <p>
                  {filtered
                    ? "Try a different destination or fewer filters. If you have something in mind, we can help you find your path."
                    : "We’re preparing the retreat directory. There are no retreats available to browse right now. Tell us what you’re looking for and start a conversation with the team."}
                </p>
                <div className="lp-empty-actions">
                  <Link className="lp-button" href="/retreat-discovery-form">
                    Find your path →
                  </Link>
                  {filtered && (
                    <Link
                      className="lp-button lp-outline"
                      href="/retreat-listings"
                    >
                      Clear filters
                    </Link>
                  )}
                </div>
              </div>
            )}
            {total > 12 && (
              <nav className="lp-pagination" aria-label="Results pages">
                {page > 1 && (
                  <Link
                    className="lp-button lp-outline"
                    href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : (v ?? "")])), page: String(page - 1) })}`}
                  >
                    ← Previous
                  </Link>
                )}
                <span>
                  Page {page} of {Math.ceil(total / 12)}
                </span>
                {page * 12 < total && (
                  <Link
                    className="lp-button lp-outline"
                    href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : (v ?? "")])), page: String(page + 1) })}`}
                  >
                    Next →
                  </Link>
                )}
              </nav>
            )}
            <div className="lp-match">
              <h3>Your path doesn’t have to look like anyone else’s.</h3>
              <p>Share what you need from your time away.</p>
              <Link href="/retreat-discovery-form">
                Explore a personal match <span aria-hidden>↗</span>
              </Link>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
