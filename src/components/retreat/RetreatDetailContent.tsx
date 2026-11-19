import Link from "next/link";
import { RequestPlaceForm } from "@/components/retreat/RequestPlaceForm";
import { RetreatGallery } from "@/components/retreat/RetreatGallery";
import type { RetreatRow, DepartureRow } from "@/lib/retreats/types";
export function RetreatDetailContent({
  row,
  departures,
  hasAdmin = false,
}: {
  row: RetreatRow;
  departures: DepartureRow[];
  hasAdmin?: boolean;
}) {
  const previewOnly = Boolean(row.previewOnly);
  const photos = [
    ...new Set([...(row.gallery_paths ?? []), row.image_path].filter(Boolean)),
  ];
  const itinerary = (row.itinerary ?? []).map((item, i) => ({
    title: String(item.title ?? item.day ?? `Day ${i + 1}`),
    description:
      typeof item.description === "string"
        ? item.description
        : typeof item.content === "string"
          ? item.content
          : "",
  }));
  const formatDate = (s: string) =>
    new Date(`${s}T12:00:00Z`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  return (
    <div className="lp">
      <div className="lp-container lp-detail">
        {(hasAdmin || previewOnly) && (
          <div className="lp-admin-notice">
            {previewOnly ? "Milestone preview only · Illustrative stock photos · Details and operator checks pending · Not bookable" : "Admin preview · Not a public booking page"}
          </div>
        )}
        <nav className="lp-breadcrumb" aria-label="Breadcrumb">
          <Link href="/retreat-listings">Discover retreats</Link>
          <span aria-hidden>›</span>
          <span>{row.type}</span>
        </nav>
        <span className="lp-eyebrow">{row.type} · Time to reconnect</span>
        <h1>{row.title}</h1>
        <p className="lp-subtitle">
          {[row.location, row.country, row.dates_display]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <RetreatGallery paths={photos} title={row.title} illustrative={Boolean(row.stockPhoto)} />
        {row.stockPhoto && <p className="lp-photo-credit"><strong>Illustrative destination stock photo, not the retreat venue.</strong> Actual venue photos pending. Photo by <a href={row.stockPhoto.source} target="_blank" rel="noreferrer">{row.stockPhoto.photographer} / Unsplash</a>. <a href="https://unsplash.com/license" target="_blank" rel="noreferrer">Unsplash License</a>.</p>}
        <div className="lp-detail-columns">
          <div>
            <nav className="lp-sections" aria-label="Retreat sections">
              <a href="#overview">Overview</a>
              {row.inclusions?.length || row.exclusions?.length ? (
                <a href="#included">Included</a>
              ) : null}
              {itinerary.length > 0 && <a href="#programme">Programme</a>}
              <a href="#dates">Dates & details</a>
              <a href="#questions">Questions</a>
            </nav>
            <section className="lp-section" id="overview">
              <span className="lp-eyebrow">The experience</span>
              <h2>A little space to reconnect.</h2>
              {row.description?.trim() ? (
                <p className="lp-description">{row.description}</p>
              ) : (
                <p>
                  More details about this retreat will be added by the team. Ask
                  about the experience before making plans.
                </p>
              )}
            </section>
            {row.inclusions?.length || row.exclusions?.length ? (
              <section className="lp-section" id="included">
                <h2>What’s part of your time away</h2>
                <div className="lp-inclusions">
                  {row.inclusions?.length ? (
                    <div>
                      <h3>Included</h3>
                      <ul>
                        {row.inclusions.map((v, i) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {row.exclusions?.length ? (
                    <div>
                      <h3>Not included</h3>
                      <ul>
                        {row.exclusions.map((v, i) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
            {itinerary.length > 0 && (
              <section className="lp-section" id="programme">
                <span className="lp-eyebrow">The programme</span>
                <h2>Your retreat rhythm</h2>
                {itinerary.map((item, i) => (
                  <div key={i} className="lp-itinerary">
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                  </div>
                ))}
              </section>
            )}
            <section className="lp-section" id="dates">
              <h2>Your time away</h2>
              <dl className="lp-facts">
                <div>
                  <dt>Retreat style</dt>
                  <dd>{row.type}</dd>
                </div>
                {(row.country || row.location) && (
                  <div>
                    <dt>Destination</dt>
                    <dd>
                      {[row.location, row.country].filter(Boolean).join(", ")}
                    </dd>
                  </div>
                )}
                {row.dates_display && (
                  <div>
                    <dt>Dates</dt>
                    <dd>{row.dates_display}</dd>
                  </div>
                )}
                {row.price_display && (
                  <div>
                    <dt>Listed price</dt>
                    <dd>{row.price_display}</dd>
                  </div>
                )}
              </dl>
              {row.price_notes && <p>{row.price_notes}</p>}
              {departures.length > 0 ? (
                <div className="lp-departures">
                  {departures.map((d) => {
                    const full =
                      d.status === "full" ||
                      (d.spots_left != null && d.spots_left <= 0);
                    const nights = Math.round(
                      (Date.parse(d.end_date) - Date.parse(d.start_date)) /
                        86400000,
                    );
                    return (
                      <div className="lp-departure" key={d.id}>
                        <div>
                          <strong>
                            {formatDate(d.start_date)} –{" "}
                            {formatDate(d.end_date)}
                          </strong>
                          <p>
                            {nights} night{nights === 1 ? "" : "s"}
                            {full
                              ? " · Full"
                              : d.spots_left != null
                                ? ` · ${d.spots_left} places available`
                                : ""}
                          </p>
                          {d.price_override != null && row.price_currency && (
                            <p>
                              {new Intl.NumberFormat("en", {
                                style: "currency",
                                currency: row.price_currency,
                              }).format(d.price_override)}
                            </p>
                          )}
                        </div>
                        {!hasAdmin && !previewOnly && (
                          <RequestPlaceForm
                            retreatId={row.id}
                            departureId={d.id}
                            retreatTitle={row.title}
                            full={full}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>
                  Contact the team to confirm current dates and availability.
                </p>
              )}
              <p className="lp-terms-note">
                Confirm the programme, accommodation, inclusions and
                cancellation terms before booking travel.
              </p>
            </section>
            <section className="lp-section" id="questions">
              <h2>Before you go</h2>
              <details>
                <summary>How do I ask about this retreat?</summary>
                <p>
                  {previewOnly ? "This is a review-only listing. Photos, programme details and operator checks must be completed before enquiries or bookings open." : "Use the enquiry button to ask about dates, rooms, access needs or the programme. The team will confirm the details with you."}
                </p>
              </details>
              <details>
                <summary>What are the booking and cancellation terms?</summary>
                <p>
                  Confirm the host’s current terms, inclusions and availability
                  with the team before committing. Sending a request does not
                  confirm a booking or take a payment.
                </p>
              </details>
            </section>
            <Link className="lp-button lp-outline" href="/retreat-listings">
              ← Back to retreats
            </Link>
          </div>
          <aside className="lp-enquiry">
            <span className="lp-eyebrow">Your next chapter</span>
            {row.price_display ? (
              <h2>{row.price_display}</h2>
            ) : (
              <h2>Make space for yourself.</h2>
            )}
            {row.price_notes && <p>{row.price_notes}</p>}
            {row.dates_display && <p>{row.dates_display}</p>}
            <div className="lp-enquiry-rule" />
            <p>{previewOnly ? "Review only. No booking or enquiry can be submitted from this preview." : "Have a question about dates, accommodation or the programme?"}</p>
            {!hasAdmin && !previewOnly && (
              <div className="lp-enquiry-action">
                <RequestPlaceForm
                  retreatId={row.id}
                  retreatTitle={row.title}
                  enquiry
                />
              </div>
            )}
            <a className="lp-button lp-outline" href="#dates">
              Explore dates →
            </a>
            <p className="lp-fine">
              An enquiry is not a confirmed booking. Check availability and
              terms with the team before making plans.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
