"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/admin/Pagination";

type Retreat = {
  id: string;
  slug: string;
  title: string;
  type: string;
  location: string | null;
  dates_display: string;
  price_display: string;
  status: string;
  sort_order: number;
  trust_tier: string | null;
  badge: string | null;
  rating: number | null;
  review_count: number | null;
  created_at: string;
  updated_at: string;
};

export default function RetreatsPage() {
  const [items, setItems] = useState<Retreat[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback((p: number, s: string) => {
    setLoading(true);
    fetch(`/api/admin/retreats?page=${p}&status=${s}`)
      .then(r => r.json())
      .then(json => {
        setItems(json.data ?? []);
        setTotal(json.total ?? 0);
        setLoading(false);
      });
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(1, statusFilter); }, [statusFilter, fetchData]);

  async function toggleStatus(retreat: Retreat) {
    const newStatus = retreat.status === "published" ? "draft" : "published";
    setMsg("");
    startTransition(async () => {
      const res = await fetch("/api/admin/retreats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: retreat.id, status: newStatus }),
      });
      const json = await res.json();
      if (res.ok) {
        setMsg(`"${retreat.title}" set to ${newStatus}.`);
        fetchData(page, statusFilter);
      } else {
        setMsg(`Error: ${json.error}`);
      }
    });
  }

  // SCOPE-044: admin sets the retreat trust tier (verified ↔ listed).
  async function toggleVerified(retreat: Retreat) {
    const verified = /verified|^partner$/i.test(retreat.trust_tier ?? "");
    const trust_tier = verified ? "listed" : "verified_partner";
    setMsg("");
    startTransition(async () => {
      const res = await fetch("/api/admin/retreats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: retreat.id, trust_tier }),
      });
      const json = await res.json();
      if (res.ok) {
        setMsg(`"${retreat.title}" ${verified ? "unverified" : "verified"}.`);
        fetchData(page, statusFilter);
      } else {
        setMsg(`Error: ${json.error}`);
      }
    });
  }

  const FILTERS = [
    { label: "All", value: "all" },
    { label: "Published", value: "published" },
    { label: "Draft", value: "draft" },
  ];

  return (
    <AdminShell title="Published Retreats" subtitle="Manage the live retreat directory">
      <div className="flex items-center gap-1 mb-5 bg-white rounded-xl border border-beige p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${statusFilter === f.value ? "bg-forest text-cream font-medium" : "text-muted hover:text-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.startsWith("Error") ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {msg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-beige shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">No retreats found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-beige bg-cream/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Location</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Dates</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Price</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Sort</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-beige">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground truncate max-w-[200px]">{item.title}</div>
                      {item.badge && <span className="text-xs text-gold font-medium">{item.badge}</span>}
                    </td>
                    <td className="px-5 py-3 text-muted capitalize">{item.type}</td>
                    <td className="px-5 py-3 text-muted">{item.location ?? "—"}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{item.dates_display}</td>
                    <td className="px-5 py-3 text-muted">{item.price_display}</td>
                    <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-3 text-muted">{item.sort_order}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleStatus(item)}
                          disabled={isPending}
                          className={`text-xs font-medium hover:underline disabled:opacity-60 ${item.status === "published" ? "text-amber-600" : "text-forest"}`}
                        >
                          {item.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => toggleVerified(item)}
                          disabled={isPending}
                          className="text-xs font-medium text-forest hover:underline disabled:opacity-60"
                        >
                          {/verified|^partner$/i.test(item.trust_tier ?? "") ? "Unverify" : "Verify"}
                        </button>
                        <Link
                          href={`/retreat/${item.slug}`}
                          target="_blank"
                          className="text-xs text-muted hover:text-forest transition-colors"
                        >
                          View ↗
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} total={total} limit={20} onPageChange={(p) => { setPage(p); fetchData(p, statusFilter); }} />
    </AdminShell>
  );
}
