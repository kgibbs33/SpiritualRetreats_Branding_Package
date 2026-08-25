"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Pagination } from "@/components/admin/Pagination";
import { PRACTICE_AREA_LABELS } from "@/lib/facilitators/practice-areas";

type FacilitatorResponse = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  practice_areas: string[] | null;
  practice_focus: string | null;
  credentials: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
  cv_path: string | null;
  referrals: string | null;
  referral_consent: boolean | null;
  vetted_at: string | null;
  vetting: {
    cvReviewed?: boolean;
    referralsChecked?: boolean;
    promotionConsent?: boolean;
    notes?: string | null;
    at?: string;
  } | null;
  /**
   * Embedded published-facilitator row (SCOPE-037). PostgREST returns a single
   * object (the FK `source_onboarding_id` is UNIQUE → one-to-one), but tolerate
   * an array too for robustness.
   */
  facilitators:
    | { open_to_work: boolean; verified: boolean }
    | { open_to_work: boolean; verified: boolean }[]
    | null;
};

function embedRow(f: FacilitatorResponse["facilitators"]) {
  return Array.isArray(f) ? f[0] : f;
}
/** Current open-to-work value from the embed (default true), shape-tolerant. */
function openToWorkOf(f: FacilitatorResponse["facilitators"]): boolean {
  return embedRow(f)?.open_to_work ?? true;
}
/** Current verified value from the embed (default false), shape-tolerant. */
function verifiedOf(f: FacilitatorResponse["facilitators"]): boolean {
  return embedRow(f)?.verified ?? false;
}

function practiceAreaLabel(area: string) {
  return (PRACTICE_AREA_LABELS as Record<string, string>)[area] ?? area;
}

const STATUS_STYLES: Record<string, string> = {
  new: "bg-stone-100 text-stone-600",
  vetted: "bg-teal/10 text-teal",
  reviewed: "bg-teal/10 text-teal",
  published: "bg-forest/10 text-forest",
  rejected: "bg-red-50 text-red-600",
};

// Pending -> vetted -> published (or rejected). DB stores "new" for pending and
// tolerates legacy "reviewed" rows (treated as vetted).
const STATUS_LABELS: Record<string, string> = {
  new: "Pending",
  reviewed: "Vetted",
  vetted: "Vetted",
  published: "Published",
  rejected: "Rejected",
};

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "new";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[s] ?? STATUS_STYLES.new}`}>
      {STATUS_LABELS[s] ?? s}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function FacilitatorResponsesPage() {
  const [items, setItems] = useState<FacilitatorResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FacilitatorResponse | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checklist, setChecklist] = useState({
    cvReviewed: false,
    referralsChecked: false,
    promotionConsent: false,
  });

  // Reset the vetting checklist when a different submission is opened; prefill
  // from a stored vetting record if it was already vetted.
  useEffect(() => {
    const v = selected?.vetting;
    setChecklist({
      cvReviewed: Boolean(v?.cvReviewed),
      referralsChecked: Boolean(v?.referralsChecked),
      promotionConsent: Boolean(v?.promotionConsent),
    });
  }, [selected]);

  const checklistComplete =
    checklist.cvReviewed && checklist.referralsChecked && checklist.promotionConsent;

  const fetchData = useCallback((p: number) => {
    setLoading(true);
    fetch(`/api/admin/facilitator-responses?page=${p}`)
      .then(r => r.json())
      .then(json => {
        setItems(json.data ?? []);
        setTotal(json.total ?? 0);
        setLoading(false);
      });
  }, []);

  async function runAction(id: string, action: string) {
    setBusy(true);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/admin/facilitator-responses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionMsg(json.error || "Action failed.");
      } else {
        setActionMsg(
          action === "publish"
            ? `Published to directory.${json.slug ? ` Slug: ${json.slug}` : ""}`
            : action === "vet"
              ? "Vetted — now eligible to publish."
              : action === "reset"
                ? "Reset to pending."
                : `Status updated to ${action}.`
        );
        setSelected(null);
        fetchData(page);
      }
    } catch {
      setActionMsg("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function runVet(id: string) {
    setBusy(true);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/admin/facilitator-responses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "vet", checklist }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionMsg(json.error || "Vetting failed.");
      } else {
        setActionMsg("Vetted — now eligible to publish.");
        setSelected(null);
        fetchData(page);
      }
    } catch {
      setActionMsg("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function patchFlag(
    id: string,
    body: Record<string, unknown>,
    apply: (cur: { open_to_work: boolean; verified: boolean }) => {
      open_to_work: boolean;
      verified: boolean;
    }
  ) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/facilitator-responses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSelected((s) =>
          s && s.id === id
            ? {
                ...s,
                facilitators: apply({
                  open_to_work: openToWorkOf(s.facilitators),
                  verified: verifiedOf(s.facilitators),
                }),
              }
            : s
        );
        fetchData(page);
      }
    } finally {
      setBusy(false);
    }
  }

  function setOpenToWork(id: string, value: boolean) {
    return patchFlag(
      id,
      { action: "set_open_to_work", openToWork: value },
      (cur) => ({ ...cur, open_to_work: value })
    );
  }
  function setVerified(id: string, value: boolean) {
    return patchFlag(
      id,
      { action: "set_verified", verified: value },
      (cur) => ({ ...cur, verified: value })
    );
  }

  useEffect(() => { fetchData(1); }, [fetchData]);

  return (
    <AdminShell title="Facilitator Responses" subtitle="All facilitator portal onboarding submissions">
      {actionMsg && (
        <div className="mb-4 rounded-xl bg-cream border border-beige px-4 py-2.5 text-sm text-foreground">
          {actionMsg}
        </div>
      )}
      <div className="bg-white rounded-2xl border border-beige shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">No facilitator responses yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-beige bg-cream/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Practice Focus</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Submitted</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-beige">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{item.full_name}</td>
                    <td className="px-5 py-3 text-muted max-w-[180px] truncate">{item.email}</td>
                    <td className="px-5 py-3">
                      {item.practice_focus ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-teal/10 text-teal capitalize">{item.practice_focus}</span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(item.created_at)}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => setSelected(item)} className="text-xs text-forest hover:underline font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} total={total} limit={20} onPageChange={(p) => { setPage(p); fetchData(p); }} />

      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b border-beige px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-semibold text-foreground">{selected.full_name}</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-cream transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">Submitted {formatDate(selected.created_at)}</p>
                <StatusBadge status={selected.status} />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Contact</h3>
                <div className="space-y-1.5">
                  {[
                    { label: "Email", value: selected.email },
                    { label: "Phone", value: selected.phone },
                  ].map(({ label, value }) => value ? (
                    <div key={label} className="flex gap-2 text-sm">
                      <span className="text-muted w-24 shrink-0">{label}</span>
                      <span className="text-foreground">{value}</span>
                    </div>
                  ) : null)}
                </div>
              </div>

              {selected.practice_areas && selected.practice_areas.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Skills &amp; practices</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.practice_areas.map((area) => (
                      <span key={area} className="text-xs px-2 py-0.5 rounded-full bg-forest/10 text-forest">
                        {practiceAreaLabel(area)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.practice_focus && (
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Practice Focus</h3>
                  <p className="text-sm text-foreground">{selected.practice_focus}</p>
                </div>
              )}

              {selected.credentials && (
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Credentials</h3>
                  <p className="text-sm text-foreground leading-relaxed">{selected.credentials}</p>
                </div>
              )}

              {selected.message && (
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Message</h3>
                  <p className="text-sm text-foreground leading-relaxed">{selected.message}</p>
                </div>
              )}

              {selected.status !== "rejected" && (
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    Vetting checklist
                  </h3>
                  {/* Underlying captured data the admin verifies against. */}
                  <div className="mb-3 space-y-1 rounded-lg bg-cream/60 px-3 py-2 text-xs text-muted">
                    <div className="flex gap-2">
                      <span className="w-32 shrink-0">CV / documents</span>
                      <span className="text-foreground">{selected.cv_path ? "Attached" : "None uploaded"}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-32 shrink-0">Referral contacts</span>
                      <span className="text-foreground">
                        {selected.referrals ? "Provided" : "None"}
                        {selected.referral_consent ? " · consent given" : " · no consent"}
                      </span>
                    </div>
                    {selected.vetted_at && (
                      <div className="flex gap-2">
                        <span className="w-32 shrink-0">Vetted</span>
                        <span className="text-foreground">{formatDate(selected.vetted_at)}</span>
                      </div>
                    )}
                  </div>
                  {selected.status === "published" ? (
                    <p className="text-xs text-forest">Vetted &amp; published — checklist locked.</p>
                  ) : (
                    <div className="space-y-2">
                      {[
                        { key: "cvReviewed" as const, label: "CV / documents reviewed" },
                        { key: "referralsChecked" as const, label: "Referral contacts checked" },
                        { key: "promotionConsent" as const, label: "Promotion / listing consent confirmed" },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                          <input
                            type="checkbox"
                            disabled={busy}
                            checked={checklist[key]}
                            onChange={(e) =>
                              setChecklist((c) => ({ ...c, [key]: e.target.checked }))
                            }
                            className="accent-forest"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selected.status === "published" && (
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Directory settings</h3>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        disabled={busy}
                        checked={openToWorkOf(selected.facilitators)}
                        onChange={(e) => setOpenToWork(selected.id, e.target.checked)}
                        className="accent-forest"
                      />
                      Open to work (sorts to the top of the directory)
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        disabled={busy}
                        checked={verifiedOf(selected.facilitators)}
                        onChange={(e) => setVerified(selected.id, e.target.checked)}
                        className="accent-forest"
                      />
                      Verified (shows the Verified badge)
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-beige px-6 py-4 flex flex-wrap gap-2">
              {/* Vet (pending -> vetted): requires a complete checklist. */}
              {(selected.status === "new" || selected.status === "reviewed") && (
                <button
                  disabled={busy || !checklistComplete}
                  title={checklistComplete ? undefined : "Complete the checklist to vet"}
                  onClick={() => runVet(selected.id)}
                  className="inline-flex h-10 items-center rounded-xl bg-teal px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {selected.status === "reviewed" ? "Update vetting" : "Vet & approve"}
                </button>
              )}
              {/* Publish is gated: only a vetted submission can go public. */}
              {selected.status === "vetted" || selected.status === "reviewed" ? (
                <button
                  disabled={busy}
                  onClick={() => runAction(selected.id, "publish")}
                  className="inline-flex h-10 items-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-[#345834] disabled:opacity-50"
                >
                  Publish to directory
                </button>
              ) : selected.status === "published" ? (
                <button
                  disabled={busy}
                  onClick={() => runAction(selected.id, "reset")}
                  className="inline-flex h-10 items-center rounded-xl border border-beige px-5 text-sm font-semibold text-forest hover:bg-cream disabled:opacity-50"
                >
                  Withdraw from directory
                </button>
              ) : null}
              {selected.status !== "rejected" && (
                <button
                  disabled={busy}
                  onClick={() => runAction(selected.id, "rejected")}
                  className="inline-flex h-10 items-center rounded-xl border border-beige px-5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
