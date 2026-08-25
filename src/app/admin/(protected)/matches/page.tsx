"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/admin/Pagination";

type Match = {
  id: string;
  seeker_email: string;
  seeker_name: string | null;
  facilitator_email: string;
  facilitator_name: string | null;
  status: string;
  operator_notes: string | null;
  created_at: string;
  retreats: { title: string; slug: string } | null;
};

type Retreat = { id: string; title: string; slug: string };
type SeekerOption = { id: string; full_name: string; email: string };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function CreateMatchForm({ onCreated }: { onCreated: () => void }) {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [seekers, setSeekers] = useState<SeekerOption[]>([]);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    seekerDiscoveryResponseId: "",
    seekerEmail: "",
    seekerName: "",
    retreatId: "",
    facilitatorEmail: "",
    facilitatorName: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/admin/retreats?status=published&page=1").then(r => r.json()).then(j => setRetreats(j.data ?? []));
    fetch("/api/admin/seeker-responses?page=1").then(r => r.json()).then(j => setSeekers(j.data ?? []));
  }, []);

  function handleSeekerSelect(id: string) {
    const s = seekers.find(x => x.id === id);
    setForm(f => ({
      ...f,
      seekerDiscoveryResponseId: id,
      seekerEmail: s?.email ?? f.seekerEmail,
      seekerName: s?.full_name ?? f.seekerName,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    startTransition(async () => {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok) {
        setMsg(`Match created successfully (ID: ${json.id}). Notifications sent.`);
        setForm({ seekerDiscoveryResponseId: "", seekerEmail: "", seekerName: "", retreatId: "", facilitatorEmail: "", facilitatorName: "", notes: "" });
        onCreated();
      } else {
        setMsg(`Error: ${json.error}`);
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-beige shadow-[var(--shadow-card)] p-6 mb-6">
      <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        Create a New Match
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Retreat *</label>
            <select
              required
              value={form.retreatId}
              onChange={e => setForm(f => ({ ...f, retreatId: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-beige bg-cream text-sm text-foreground focus:outline-none focus:border-forest"
            >
              <option value="">Select a published retreat</option>
              {retreats.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Seeker Response (optional)</label>
            <select
              value={form.seekerDiscoveryResponseId}
              onChange={e => handleSeekerSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-beige bg-cream text-sm text-foreground focus:outline-none focus:border-forest"
            >
              <option value="">— Link to seeker response</option>
              {seekers.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Seeker Email *</label>
            <input
              required
              type="email"
              value={form.seekerEmail}
              onChange={e => setForm(f => ({ ...f, seekerEmail: e.target.value }))}
              placeholder="seeker@email.com"
              className="w-full px-3 py-2 rounded-xl border border-beige bg-cream text-sm focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Seeker Name</label>
            <input
              type="text"
              value={form.seekerName}
              onChange={e => setForm(f => ({ ...f, seekerName: e.target.value }))}
              placeholder="Full name"
              className="w-full px-3 py-2 rounded-xl border border-beige bg-cream text-sm focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Facilitator Email *</label>
            <input
              required
              type="email"
              value={form.facilitatorEmail}
              onChange={e => setForm(f => ({ ...f, facilitatorEmail: e.target.value }))}
              placeholder="facilitator@email.com"
              className="w-full px-3 py-2 rounded-xl border border-beige bg-cream text-sm focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Facilitator Name</label>
            <input
              type="text"
              value={form.facilitatorName}
              onChange={e => setForm(f => ({ ...f, facilitatorName: e.target.value }))}
              placeholder="Full name"
              className="w-full px-3 py-2 rounded-xl border border-beige bg-cream text-sm focus:outline-none focus:border-forest"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1">Operator Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
            placeholder="Internal notes about this match…"
            className="w-full px-3 py-2 rounded-xl border border-beige bg-cream text-sm focus:outline-none focus:border-forest resize-none"
          />
        </div>

        {msg && (
          <p className={`text-sm px-3 py-2 rounded-lg ${msg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-teal text-cream px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isPending ? "Creating…" : "Create Match & Send Notifications"}
        </button>
      </form>
    </div>
  );
}

/** Allowed next statuses an operator can move a match to, by current status. */
const NEXT_STATUSES: Record<string, string[]> = {
  recorded: ["notified", "closed"],
  notified: ["closed"],
  closed: ["notified"],
};

export default function MatchesPage() {
  const [items, setItems] = useState<Match[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchData = useCallback((p: number) => {
    setLoading(true);
    fetch(`/api/admin/matches?page=${p}`)
      .then(r => r.json())
      .then(json => {
        setItems(json.data ?? []);
        setTotal(json.total ?? 0);
        setLoading(false);
      });
  }, []);

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/matches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData(page);
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => { fetchData(1); }, [fetchData]);

  return (
    <AdminShell title="Matches" subtitle="Manual seeker–retreat–facilitator matching">
      <CreateMatchForm onCreated={() => fetchData(1)} />

      <h2 className="text-sm font-semibold text-foreground mb-3">All Matches</h2>

      <div className="bg-white rounded-2xl border border-beige shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted">No matches yet. Create one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-beige bg-cream/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Retreat</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Seeker</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Facilitator</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Notes</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Created</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground max-w-[180px] truncate">
                      {item.retreats?.title ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      <div className="truncate max-w-[140px]">{item.seeker_name ?? item.seeker_email}</div>
                      {item.seeker_name && <div className="text-xs truncate max-w-[140px]">{item.seeker_email}</div>}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      <div className="truncate max-w-[140px]">{item.facilitator_name ?? item.facilitator_email}</div>
                      {item.facilitator_name && <div className="text-xs truncate max-w-[140px]">{item.facilitator_email}</div>}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-3 text-muted max-w-[160px] truncate">{item.operator_notes ?? "—"}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(item.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(NEXT_STATUSES[item.status] ?? []).map((next) => (
                          <button
                            key={next}
                            disabled={busyId === item.id}
                            onClick={() => updateStatus(item.id, next)}
                            className="text-xs rounded-lg border border-beige px-2.5 py-1 font-medium text-forest hover:bg-cream disabled:opacity-50"
                          >
                            {next === "notified"
                              ? item.status === "closed"
                                ? "Re-open"
                                : "Notify"
                              : "Close"}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} total={total} limit={20} onPageChange={(p) => { setPage(p); fetchData(p); }} />
    </AdminShell>
  );
}
