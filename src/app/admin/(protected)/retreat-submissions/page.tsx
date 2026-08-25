"use client";

import { Suspense, useEffect, useState, useCallback, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/admin/Pagination";

type Submission = {
  id: string;
  contact_name: string;
  email: string;
  retreat_title: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  capacity: number | null;
  price_range: string | null;
  facilitator_notes: string | null;
  status: string;
  created_at: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function RetreatSubmissionsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get("status") ?? "all";

  const [items, setItems] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionMsg, setActionMsg] = useState("");

  const fetchData = useCallback((p: number, s: string) => {
    setLoading(true);
    fetch(`/api/admin/retreat-submissions?status=${s}&page=${p}`)
      .then(r => r.json())
      .then(json => {
        setItems(json.data ?? []);
        setTotal(json.total ?? 0);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(1, statusFilter);
  }, [statusFilter, fetchData]);

  function setFilter(s: string) {
    router.push(`/admin/retreat-submissions${s !== "all" ? `?status=${s}` : ""}`);
  }

  async function doAction(id: string, action: string) {
    setActionMsg("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/retreat-submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionMsg(action === "approve" ? `Approved and published!${json.slug ? ` Slug: ${json.slug}` : ""}` : `Status updated to ${action}.`);
        setSelected(null);
        fetchData(page, statusFilter);
      } else {
        setActionMsg(`Error: ${json.error}`);
      }
    });
  }

  const FILTERS = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <AdminShell title="Retreat Submissions" subtitle="Review and approve retreat intake forms">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 bg-white rounded-xl border border-beige p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${statusFilter === f.value ? "bg-forest text-cream font-medium" : "text-muted hover:text-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {actionMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          {actionMsg}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-beige shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">No submissions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-beige bg-cream/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Retreat</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Contact</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Location</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Dates</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Submitted</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-beige">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground max-w-[200px] truncate">{item.retreat_title}</td>
                    <td className="px-5 py-3 text-muted">
                      <div className="truncate max-w-[140px]">{item.contact_name}</div>
                      <div className="text-xs truncate max-w-[140px]">{item.email}</div>
                    </td>
                    <td className="px-5 py-3 text-muted">{item.location ?? "—"}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">
                      {item.start_date && item.end_date
                        ? `${item.start_date} → ${item.end_date}`
                        : item.start_date ?? "—"}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(item.created_at)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelected(item)}
                        className="text-xs text-forest hover:underline font-medium"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} total={total} limit={20} onPageChange={(p) => { setPage(p); fetchData(p, statusFilter); }} />

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-white border-b border-beige px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-semibold text-foreground truncate">{selected.retreat_title}</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-cream transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} />
                <span className="text-xs text-muted">Submitted {formatDate(selected.created_at)}</span>
              </div>

              <Section label="Contact">
                <Field label="Name" value={selected.contact_name} />
                <Field label="Email" value={selected.email} />
              </Section>

              <Section label="Retreat Details">
                <Field label="Title" value={selected.retreat_title} />
                <Field label="Location" value={selected.location} />
                <Field label="Dates" value={selected.start_date && selected.end_date ? `${selected.start_date} → ${selected.end_date}` : selected.start_date} />
                <Field label="Capacity" value={selected.capacity?.toString()} />
                <Field label="Price Range" value={selected.price_range} />
              </Section>

              {selected.description && (
                <Section label="Description">
                  <p className="text-sm text-foreground leading-relaxed">{selected.description}</p>
                </Section>
              )}

              {selected.facilitator_notes && (
                <Section label="Facilitator Notes">
                  <p className="text-sm text-foreground leading-relaxed">{selected.facilitator_notes}</p>
                </Section>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-beige px-6 py-4 flex gap-2 flex-wrap">
              {selected.status !== "approved" && (
                <button
                  onClick={() => doAction(selected.id, "approve")}
                  disabled={isPending}
                  className="flex-1 bg-forest text-cream py-2.5 rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
                >
                  Approve & Publish
                </button>
              )}
              {selected.status !== "rejected" && (
                <button
                  onClick={() => doAction(selected.id, "reject")}
                  disabled={isPending}
                  className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-60"
                >
                  Reject
                </button>
              )}
              {selected.status !== "pending" && (
                <button
                  onClick={() => doAction(selected.id, "reset")}
                  disabled={isPending}
                  className="px-4 border border-beige py-2.5 rounded-xl text-sm text-muted hover:bg-cream transition-colors disabled:opacity-60"
                >
                  Reset to Pending
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default function RetreatSubmissionsPage() {
  return (
    <Suspense
      fallback={
        <AdminShell title="Retreat Submissions" subtitle="Review and approve retreat intake forms">
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        </AdminShell>
      }
    >
      <RetreatSubmissionsPageInner />
    </Suspense>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{label}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted w-24 shrink-0">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
