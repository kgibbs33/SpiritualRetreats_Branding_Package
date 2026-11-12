"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Pagination } from "@/components/admin/Pagination";
import { ENHANCED_REVIEW_TERMS } from "@/config/enhanced-review";

const PER_PAGE = 50;

type Candidate = {
  retreat_id: string;
  retreat_name: string;
  primary_category: string | null;
  country: string | null;
  city_area: string | null;
  verification_level: string | null;
  record_status: string | null;
  website: string | null;
  data_quality_score: number | null;
};

type CandidateDetail = Record<string, unknown>;

function needsEnhancedReview(row: Candidate): boolean {
  const cats = [row.primary_category ?? ""].join(" ").toLowerCase();
  return ENHANCED_REVIEW_TERMS.some((t) => cats.includes(t));
}

export default function CandidatesPage() {
  const [items, setItems] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [selected, setSelected] = useState<CandidateDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [verification, setVerification] = useState("");
  const [status, setStatus] = useState("");
  const [hideEnhanced, setHideEnhanced] = useState(true);
  const [hiddenCount, setHiddenCount] = useState(0);

  const [filters, setFilters] = useState<{
    country: string[];
    category: string[];
    verification: string[];
    status: string[];
  }>({ country: [], category: [], verification: [], status: [] });

  const fetchData = useCallback(
    (p: number) => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(p) });
      if (q.trim()) params.set("q", q.trim());
      if (country) params.set("country", country);
      if (category) params.set("category", category);
      if (verification) params.set("verification", verification);
      if (status) params.set("status", status);
      params.set("hideEnhanced", String(hideEnhanced));

      fetch(`/api/admin/candidates?${params}`)
        .then((r) => r.json())
        .then((json) => {
          setItems(json.data ?? []);
          setTotal(json.total ?? 0);
          setTableMissing(json.tableMissing ?? false);
          if (json.filters) setFilters(json.filters);
          setHiddenCount(json.hiddenCount ?? 0);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    [q, country, category, verification, status]
  );

  useEffect(() => {
    setPage(1);
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, country, category, verification, status, hideEnhanced]);

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function openDetail(retreat_id: string) {
    setDetailLoading(true);
    fetch(`/api/admin/candidates/${retreat_id}`)
      .then((r) => r.json())
      .then((json) => {
        setSelected((json.data as CandidateDetail) ?? null);
        setDetailLoading(false);
      })
      .catch(() => setDetailLoading(false));
  }

  function clearFilters() {
    setQ("");
    setCountry("");
    setCategory("");
    setVerification("");
    setStatus("");
  }

  const hasFilters = q || country || category || verification || status;

  return (
    <AdminShell
      title="Candidate Database"
      subtitle="Research list from Andrew. Internal only. Not published. Do not contact anyone without team approval."
    >
      {/* Banner */}
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <p>Internal research data. Nothing here is on the public site. No outreach
        until the team agrees the outreach policy.</p>
        <p className="mt-1">Compiled by AI from public web sources. Not independently
        verified. Contacts must be rechecked before any use.</p>
      </div>

      {tableMissing ? (
        <div className="py-20 text-center text-sm text-stone-500">
          The candidate table has not been loaded yet.
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search name, city or website…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="rounded-lg border border-sage-mist px-3 py-2 text-sm flex-1 min-w-[200px]"
            />
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-lg border border-sage-mist px-3 py-2 text-sm max-w-[160px]">
              <option value="">All countries</option>
              {filters.country.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-sage-mist px-3 py-2 text-sm max-w-[180px]">
              <option value="">All categories</option>
              {filters.category.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={verification} onChange={(e) => setVerification(e.target.value)} className="rounded-lg border border-sage-mist px-3 py-2 text-sm max-w-[160px]">
              <option value="">Verification</option>
              {filters.verification.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-sage-mist px-3 py-2 text-sm max-w-[160px]">
              <option value="">Status</option>
              {filters.status.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-sm text-stone-600 cursor-pointer select-none">
              <input type="checkbox" checked={hideEnhanced} onChange={(e) => setHideEnhanced(e.target.checked)} className="accent-forest-green" />
              Hide enhanced-review categories
              {hiddenCount > 0 && <span className="text-amber-700 font-medium">({hiddenCount} hidden)</span>}
            </label>
            {hasFilters && (
              <button onClick={clearFilters} className="rounded-lg border border-sage-mist px-3 py-2 text-sm text-stone-500 hover:bg-sage-mist/20">
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-stone-400">Loading…</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-sm text-stone-500">
              {hasFilters ? "No candidates match these filters." : "No candidates loaded yet."}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-sage-mist bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sage-mist bg-warm-cream/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">ID</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Country</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">City</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Verification</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Score</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-mist">
                  {items.map((row) => (
                    <tr key={row.retreat_id} className="hover:bg-warm-cream/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-stone-500">{row.retreat_id}</td>
                      <td className="px-5 py-3 font-medium text-stone-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          {row.retreat_name}
                          {needsEnhancedReview(row) && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Enhanced review required</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-stone-600">{row.primary_category ?? "—"}</td>
                      <td className="px-5 py-3 text-stone-600">{row.country ?? "—"}</td>
                      <td className="px-5 py-3 text-stone-600 max-w-[140px] truncate">{row.city_area ?? "—"}</td>
                      <td className="px-5 py-3 text-stone-600">{row.verification_level ?? "—"}</td>
                      <td className="px-5 py-3 text-stone-600">{row.record_status ?? "—"}</td>
                      <td className="px-5 py-3 text-stone-600">{row.data_quality_score != null ? row.data_quality_score : "—"}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => openDetail(row.retreat_id)} className="text-xs text-forest-green hover:underline font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination page={page} total={total} limit={PER_PAGE} onPageChange={(p) => setPage(p)} />
        </>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b border-beige px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-semibold text-foreground">
                {(selected.retreat_name as string) ?? (selected.retreat_id as string)}
              </h2>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-cream transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-5">
              {detailLoading ? (
                <p className="text-sm text-stone-400">Loading…</p>
              ) : (
                <>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {String(selected.opt_out_do_not_contact ?? "").toLowerCase() === "yes" && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Do not contact</span>
                    )}
                    {needsEnhancedReview(selected as unknown as Candidate) && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Enhanced review required</span>
                    )}
                  </div>

                  <DrawerSection label="Organisation">
                    <D label="Retreat Name" v={selected.retreat_name} />
                    <D label="Legal Name" v={selected.legal_organisation_name} />
                    <D label="Primary Category" v={selected.primary_category} />
                    <D label="Secondary Categories" v={selected.secondary_categories} />
                    <D label="Description" v={selected.retreat_description} />
                    <D label="Organisation Type" v={selected.organisation_type} />
                    <D label="Parent Network" v={selected.parent_network} />
                    <D label="Languages" v={selected.languages} />
                  </DrawerSection>

                  <DrawerSection label="Location">
                    <D label="Country" v={selected.country} />
                    <D label="Region" v={selected.region} />
                    <D label="State/Province" v={selected.state_province} />
                    <D label="City/Area" v={selected.city_area} />
                    <D label="Street Address" v={selected.street_address} />
                    <D label="Postal Code" v={selected.postal_code} />
                  </DrawerSection>

                  <DrawerSection label="Source and Verification">
                    <D label="Website" v={selected.website} />
                    <D label="Source URL 1" v={selected.source_url_1_official} />
                    <D label="Source URL 2" v={selected.source_url_2} />
                    <D label="Date First Found" v={selected.date_first_found} />
                    <D label="Last Verified" v={selected.last_verified} />
                    <D label="Verified By" v={selected.verified_by} />
                    <D label="Verification Level" v={selected.verification_level} />
                    <D label="Email Verification" v={selected.email_verification_status} />
                    <D label="Phone Verification" v={selected.phone_verification_status} />
                    <D label="Data Quality Score" v={selected.data_quality_score} />
                    <D label="Days Since Verified" v={selected.days_since_verified} />
                  </DrawerSection>

                  <DrawerSection label="Contacts (public business contacts only)">
                    <D label="Public Email" v={selected.public_general_email} />
                    <D label="Named Contact Email" v={selected.named_contact_email} />
                    <D label="Contact Name" v={selected.public_contact_name} />
                    <D label="Contact Role" v={selected.contact_role_department} />
                    <D label="Phone" v={selected.public_phone} />
                    <D label="WhatsApp" v={selected.whatsapp} />
                  </DrawerSection>

                  <DrawerSection label="Outreach and Commercial">
                    <D label="Outreach Status" v={selected.outreach_status} />
                    <D label="Last Contact Date" v={selected.last_contact_date} />
                    <D label="Next Follow Up" v={selected.next_follow_up} />
                    <D label="Legal Basis Note" v={selected.outreach_legal_basis_note} />
                    <D label="Privacy Notice Sent" v={selected.privacy_notice_sent} />
                    <D label="Opt Out / Do Not Contact" v={selected.opt_out_do_not_contact} />
                    <D label="Commercial Fit" v={selected.commercial_fit} />
                    <D label="Direct Booking" v={selected.direct_booking_status} />
                    <D label="Commission Potential" v={selected.commission_potential} />
                    <D label="Partnership Route" v={selected.suggested_partnership_route} />
                    <D label="Commercial Agreement" v={selected.commercial_agreement_status} />
                    <D label="Retreat Offer Status" v={selected.retreat_offer_status} />
                  </DrawerSection>

                  <DrawerSection label="Research Notes">
                    <D label="Batch ID" v={selected.batch_id} />
                    <D label="Record Status" v={selected.record_status} />
                    <D label="Duplicate Key" v={selected.duplicate_key} />
                    <D label="Research Notes" v={selected.research_notes} />
                  </DrawerSection>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function DrawerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">{label}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function D({ label, v }: { label: string; v: unknown }) {
  const s = v == null || v === "" ? null : String(v);
  if (s === null) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-stone-400 w-32 shrink-0">{label}</span>
      <span className="text-stone-700 break-words">{s}</span>
    </div>
  );
}