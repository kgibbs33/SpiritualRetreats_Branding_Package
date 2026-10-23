"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";

type Retreat = {
  id: string; slug: string; title: string; type: string;
  location: string | null; country: string | null; region: string | null;
  dates_display: string; price_display: string;
  price_from: number | null; price_currency: string | null;
  status: string; qualification_status: string | null;
  commercial_status: string | null;
  sort_order: number; trust_tier: string | null;
  rating: number | null; review_count: number | null;
  gallery_paths: string[] | null; image_path: string | null;
  categories: string[] | null;
  operator_name: string | null;
  created_at: string; updated_at: string;
};

export default function RetreatsPage() {
  const [items, setItems] = useState<Retreat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback((p: number, s: string) => {
    fetch(`/api/admin/retreats?page=${p}&status=${s}`)
      .then(r => r.json()).then(json => {
        setItems(json.data ?? []); setTotal(json.total ?? 0); setLoading(false);
      });
  }, []);

  useEffect(() => { fetchData(1, statusFilter); }, [statusFilter, fetchData]);
  async function toggleStatus(retreat: Retreat) {
    const newStatus = retreat.status === "published" ? "draft" : "published";
    setMsg("");
    startTransition(async () => {
      const res = await fetch("/api/admin/retreats", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: retreat.id, status: newStatus }),
      });
      const json = await res.json();
      if (res.ok) {
        setItems(prev => prev.map(r => r.id === retreat.id ? { ...r, status: newStatus } : r));
        setMsg(`${retreat.title} → ${newStatus}`);
      } else {
        setMsg(`Error: ${json.error}`);
      }
    });
  }

  async function updateQualification(id: string, qs: string) {
    startTransition(async () => {
      const res = await fetch("/api/admin/retreats", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, qualification_status: qs }),
      });
      const json = await res.json();
      setMsg(res.ok ? `Qualification → ${qs}` : `Error: ${json.error}`);
      if (res.ok) {
        setItems(prev => prev.map(r => r.id === id ? { ...r, qualification_status: qs } : r));
      }
    });
  }

  const canPublish = (r: Retreat) => {
    const qs = r.qualification_status;
    if (qs !== "approved" && qs !== "live") return false;
    if (!r.gallery_paths?.length && !r.image_path) return false;
    return true;
  };

  return (
    <AdminShell title="Retreats">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Retreats</h1>
          <div className="flex items-center gap-3">
            <Link href="/admin/retreats/new" className="rounded-xl bg-sacred-gold px-4 py-2 text-sm font-semibold text-celestial-navy shadow-sm hover:bg-sacred-gold/90">+ Create retreat</Link>
            <Link href="/admin/retreat-submissions" className="text-sm text-link">Submissions</Link>
            <Link href="/admin/enquiries" className="text-sm text-link">Enquiries</Link>
            <Link href="/admin/search-alerts" className="text-sm text-link">Alerts</Link>
          </div>
        </div>

        {msg && <div className="mt-3 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{msg}</div>}

        <div className="mt-4 flex gap-2">
          {["all","published","draft"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusFilter === s ? "bg-forest-green text-white" : "bg-sage-mist text-stone-600"}`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? <p className="mt-6 text-sm text-stone-400">Loading…</p> : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-sage-mist text-xs uppercase text-stone-400">
                <tr>
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 px-2">Country</th>
                  <th className="py-2 px-2">Price</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Qualification</th>
                  <th className="py-2 px-2">Tags</th>
                  <th className="py-2 px-2">Operator</th>
                  <th className="py-2 pl-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(r => (
                  <tr key={r.id} className="border-b border-sage-mist/50 hover:bg-warm-cream/50">
                    <td className="py-2 pr-3 font-medium">
                      <Link href={`/admin/retreats/${r.id}`} className="text-link hover:underline">{r.title}</Link>
                      <br /><span className="text-xs text-stone-400">{r.slug}</span>
                    </td>
                    <td className="py-2 px-2">{r.country || r.location || "—"}</td>
                    <td className="py-2 px-2">{r.price_from ? `${r.price_currency || "EUR"} ${r.price_from}` : r.price_display || "—"}</td>
                    <td className="py-2 px-2"><StatusBadge status={r.status} /></td>
                    <td className="py-2 px-2">
                      <select value={r.qualification_status || "submitted"} onChange={e => updateQualification(r.id, e.target.value)}
                        className="rounded border border-sage-mist px-1 py-0.5 text-xs">
                        <option value="submitted">Submitted</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="approved">Approved</option>
                        <option value="live">Live</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex max-w-[180px] flex-wrap gap-1">
                        {(Array.isArray(r.categories) ? r.categories : []).slice(0, 4).map((t: string) => (
                          <span key={t} className="rounded-full bg-sage-mist px-2 py-0.5 text-[10px] text-forest-green">{t}</span>
                        ))}
                        {Array.isArray(r.categories) && r.categories.length > 4 && (
                          <span className="text-[10px] text-stone-400">+{r.categories.length - 4}</span>
                        )}
                        {!Array.isArray(r.categories) || r.categories.length === 0 ? "—" : null}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-xs">{r.operator_name || "—"}</td>
                    <td className="py-2 pl-2">
                      <button onClick={() => toggleStatus(r)} disabled={isPending}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${r.status === "published" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"} disabled:opacity-50`}
                        title={r.status === "published" ? "Unpublish" : canPublish(r) ? "Publish" : "Cannot publish: needs approved/live + image + departure"}>
                        {r.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-stone-400">{total} retreats total</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}